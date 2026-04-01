package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
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

func fetchCaptionWithRapidAPI(reelLink string) (string, error) {
	apiKey := os.Getenv("RAPID_API_KEY")
	apiHost := os.Getenv("RAPID_API_HOST")

	if apiKey == "" || apiHost == "" {
		return "", fmt.Errorf("RapidAPI credentials are not set")
	}

	// Build the URL with Query Parameters
	baseURL := "https://" + apiHost + "/get_media_data.php"
	params := url.Values{}
	params.Add("reel_post_code_or_url", reelLink)
	params.Add("type", "reel")
	
	fullURL := baseURL + "?" + params.Encode()

	req, _ := http.NewRequest("GET", fullURL, nil)

	req.Header.Add("x-rapidapi-key", apiKey)
	req.Header.Add("x-rapidapi-host", apiHost)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	bodyBytes, _ := io.ReadAll(res.Body)
	fmt.Println("RapidAPI Raw Response:", string(bodyBytes))

	if res.StatusCode != 200 {
		return "", fmt.Errorf("RapidAPI error: status %d | body: %s", res.StatusCode, string(bodyBytes))
	}

	var result map[string]interface{}
	json.Unmarshal(bodyBytes, &result)

	// The API returns data in "data" -> "caption_text"
	data, ok := result["data"].(map[string]interface{})
	if ok {
		if caption, ok := data["caption_text"].(string); ok {
			return caption, nil
		}
		if caption, ok := data["text"].(string); ok {
			return caption, nil
		}
		if caption, ok := data["caption"].(string); ok {
			return caption, nil
		}
	}
	
	return "", fmt.Errorf("could not find caption in API response")
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

	// Fetch caption using RapidAPI (Professional & Legal)
	caption, err := fetchCaptionWithRapidAPI(input.ReelLink)
	if err != nil {
		fmt.Println("RapidAPI Error:", err)
		c.JSON(http.StatusOK, gin.H{
			"data": ExtractedData{
				Restaurant: "",
				City:       "",
				Area:       "",
				Dishes:     []string{},
			},
			"message": "Could not fetch reel data from API",
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
