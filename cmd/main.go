package main

import (
	"log"
	"os"

	"kerala-food-finder/config"
	"kerala-food-finder/models"
	"kerala-food-finder/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using system env")
	}

	config.ConnectDatabase()

	// AutoMigrate here!
	config.DB.AutoMigrate(
		&models.Restaurant{},
		&models.Dish{},
		&models.Reel{},
		&models.Review{},
		&models.Save{},
	)

	router := gin.Default()
	routes.SetupRoutes(router)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	log.Println("Server starting on port:", port)
	router.Run(":" + port)
}
