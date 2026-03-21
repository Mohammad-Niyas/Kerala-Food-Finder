package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"strings"

	"kerala-food-finder/config"
	"kerala-food-finder/models"

	"github.com/gin-gonic/gin"
)

type ReelExtractInput struct {
	ReelLink string `json:"reel_link"`
}

type ExtractedData struct {
	Restaurant string   `json:"restaurant"`
	City       string   `json:"city"`
	Area       string   `json:"area"`
	Dishes     []string `json:"dishes"`
}

func claudeExtract(ocrText string, transcript string) (*ExtractedData, error) {
	apiKey := os.Getenv("GROQ_API_KEY")

	prompt := fmt.Sprintf(`You are a Kerala food expert.
Extract restaurant information from this Instagram/YouTube food reel caption.

Caption Text:
%s

Extract and return ONLY a JSON object:
{
  "restaurant": "restaurant name or empty string",
  "city": "Kerala city name or empty string",
  "area": "area/locality or empty string",
  "dishes": ["ALL food items mentioned"]
}

Rules:
- Extract ALL food items mentioned including brand names
- Look for Kerala cities: Kochi, Kozhikode, Kannur, Thrissur, Alappuzha, Palakkad, Thiruvananthapuram, Malappuram, Kasaragod, Kollam, Kottayam, Wayanad
- Extract restaurant name even if it is a brand
- dishes array must include every food item mentioned
- Return JSON only, no other text`, transcript)

	requestBody := map[string]interface{}{
		"model": "llama-3.3-70b-versatile",
		"messages": []map[string]interface{}{
			{
				"role":    "user",
				"content": prompt,
			},
		},
		"temperature": 0.1,
		"max_tokens":  1024,
	}

	jsonBody, _ := json.Marshal(requestBody)

	req, _ := http.NewRequest(
		"POST",
		"https://api.groq.com/openai/v1/chat/completions",
		bytes.NewBuffer(jsonBody),
	)
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var groqResp map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&groqResp)

	// Debug
	groqBody, _ := json.Marshal(groqResp)
	fmt.Println("Groq Response:", string(groqBody))

	// Extract text
	choices, ok := groqResp["choices"].([]interface{})
	if !ok || len(choices) == 0 {
		return nil, fmt.Errorf("Groq returned no choices")
	}

	choice, ok := choices[0].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("Groq choice error")
	}

	message, ok := choice["message"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("Groq message error")
	}

	text, ok := message["content"].(string)
	if !ok {
		return nil, fmt.Errorf("Groq content error")
	}

	text = strings.TrimSpace(text)
	// Remove all backtick variations
	text = strings.ReplaceAll(text, "```json", "")
	text = strings.ReplaceAll(text, "```", "")
	text = strings.TrimSpace(text)

	var extracted ExtractedData
	err = json.Unmarshal([]byte(text), &extracted)
	if err != nil {
		return nil, fmt.Errorf("JSON parse error: %s", text)
	}

	return &extracted, nil
}

func ExtractFromReel(c *gin.Context) {
	var input ReelExtractInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid input",
		})
		return
	}

	if input.ReelLink == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Reel link is required",
		})
		return
	}

	// Fetch caption from reel
	caption, err := fetchCaption(input.ReelLink)
	if err != nil || strings.TrimSpace(caption) == "" {
		c.JSON(http.StatusOK, gin.H{
			"data": ExtractedData{
				Restaurant: "",
				City:       "",
				Area:       "",
				Dishes:     []string{},
			},
			"message": "No caption found in reel",
		})
		return
	}

	fmt.Println("Caption:", caption)

	// Extract using Groq AI
	extracted, err := claudeExtract("", caption)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "AI extraction failed",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": extracted,
	})
}

func fetchCaption(reelLink string) (string, error) {
	cmd := exec.Command(
		"python", "-m", "yt_dlp",
		"--skip-download",
		"--print", "description",
		"--no-playlist",
		reelLink,
	)

	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()
	if err != nil {
		// Try title if description empty
		cmd2 := exec.Command(
			"python", "-m", "yt_dlp",
			"--skip-download",
			"--print", "title",
			"--no-playlist",
			reelLink,
		)
		var stdout2 bytes.Buffer
		cmd2.Stdout = &stdout2
		cmd2.Run()
		return stdout2.String(), nil
	}

	caption := stdout.String()
	if strings.TrimSpace(caption) == "" {
		return "", nil
	}

	return caption, nil
}

// SaveExtractedDishes — save selected dishes
func SaveExtractedDishes(c *gin.Context) {
	var input struct {
		RestaurantName string   `json:"restaurant_name"`
		City           string   `json:"city"`
		Area           string   `json:"area"`
		Dishes         []string `json:"dishes"`
		ReelLink       string   `json:"reel_link"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid input",
		})
		return
	}

	// Find or create restaurant
	restaurant := models.FindOrCreateRestaurant(
		input.RestaurantName,
		input.City,
		input.Area,
	)

	// Save reel
	reel := models.Reel{
		RestaurantID: restaurant.ID,
		ReelLink:     input.ReelLink,
		AddedBy:      "User",
	}
	config.DB.Create(&reel)

	// Save each dish
	var savedDishes []models.Dish
	for _, dishName := range input.Dishes {
		var existingDish models.Dish
		result := config.DB.Where(
			"name = ? AND restaurant_id = ?",
			dishName, restaurant.ID,
		).First(&existingDish)

		if result.Error != nil {
			// Create new dish
			newDish := models.Dish{
				Name:         dishName,
				RestaurantID: restaurant.ID,
				Saves:        1,
			}
			config.DB.Create(&newDish)
			savedDishes = append(savedDishes, newDish)
		} else {
			savedDishes = append(savedDishes, existingDish)
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "Dishes saved successfully!",
		"restaurant": restaurant,
		"dishes":     savedDishes,
	})
}
