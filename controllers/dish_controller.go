package controllers

import (
	"net/http"
	"kerala-food-finder/config"
	"kerala-food-finder/models"
	"github.com/gin-gonic/gin"
)

func GetAllDishes(c *gin.Context) {
	var dishes []models.Dish
	city := c.Query("city")
	category := c.Query("category")

	query := config.DB.Preload("Restaurant")

	if city != "" {
		query = query.Joins(
			"JOIN restaurants ON restaurants.id = dishes.restaurant_id",
		).Where("restaurants.city = ?", city)
	}

	if category != "" {
		query = query.Where(
			"dishes.category = ?", category,
		)
	}

	query.Find(&dishes)

	c.JSON(http.StatusOK, gin.H{
		"data": dishes,
	})
}

func GetDish(c *gin.Context) {
	var dish models.Dish
	id := c.Param("id")

	result := config.DB.
		Preload("Restaurant").
		Preload("Reviews").
		First(&dish, id)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Dish not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": dish,
	})
}

func SaveDish(c *gin.Context) {
	id := c.Param("id")

	var dish models.Dish
	result := config.DB.First(&dish, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Dish not found",
		})
		return
	}

	save := models.Save{
		DishID: dish.ID,
	}
	config.DB.Create(&save)

	config.DB.Model(&dish).Update(
		"saves", dish.Saves+1,
	)

	c.JSON(http.StatusOK, gin.H{
		"message": "Dish saved successfully!",
	})
}


func UnsaveDish(c *gin.Context) {
	id := c.Param("id")

	config.DB.Where(
		"dish_id = ?", id,
	).Delete(&models.Save{})

	var dish models.Dish
	config.DB.First(&dish, id)
	if dish.Saves > 0 {
		config.DB.Model(&dish).Update(
			"saves", dish.Saves-1,
		)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Dish unsaved successfully!",
	})
}

func CreateDish(c *gin.Context) {

	var input struct {
		RestaurantName string `json:"restaurant_name"`
		City           string `json:"city"`
		Area           string `json:"area"`
		Name           string `json:"name"`
		Category       string `json:"category"`
		Notes          string `json:"notes"`
		ReelLink       string `json:"reel_link"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid input",
		})
		return
	}

	if input.RestaurantName == "" || 
	   input.City == "" || 
	   input.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Restaurant name, city and dish name are required",
		})
		return
	}

	restaurant := models.FindOrCreateRestaurant(
		input.RestaurantName,
		input.City,
		input.Area,
	)

	var existingDish models.Dish
	result := config.DB.Where(
		"name = ? AND restaurant_id = ?",
		input.Name, restaurant.ID,
	).First(&existingDish)

	if result.Error == nil {
		c.JSON(http.StatusOK, gin.H{
			"message": "Dish already exists!",
			"data":    existingDish,
		})
		return
	}

	dish := models.Dish{
		Name:         input.Name,
		RestaurantID: restaurant.ID,
		Category:     input.Category,
		Notes:        input.Notes,
		Saves:        0,
	}
	config.DB.Create(&dish)

	if input.ReelLink != "" {
		reel := models.Reel{
			RestaurantID: restaurant.ID,
			ReelLink:     input.ReelLink,
			AddedBy:      "User",
		}
		config.DB.Create(&reel)
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Dish added successfully!",
		"data":    dish,
	})
}
