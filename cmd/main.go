package main

import (
	"kerala-food-finder/config"
	"log"
	"os"
	"github.com/joho/godotenv"
	"github.com/gin-gonic/gin"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	config.ConnectDatabase()

	router:=gin.Default()

	port:=os.Getenv("PORT")

	log.Println("Server running on port:", port)
	router.Run(":" + port)
}