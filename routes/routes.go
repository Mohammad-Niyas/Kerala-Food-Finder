package routes

import (
	"kerala-food-finder/controllers"
	"kerala-food-finder/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {

	router.Use(middleware.CORSMiddleware())

	api := router.Group("/api")
	{
		restaurants := api.Group("/restaurants")
		{
			restaurants.GET("", controllers.GetAllRestaurants)
			restaurants.GET("/:id", controllers.GetRestaurant)
			restaurants.GET("/:id/dishes", controllers.GetRestaurantDishes)
			restaurants.GET("/:id/reels", controllers.GetRestaurantReels)
		}

		dishes := api.Group("/dishes")
		{
			dishes.GET("", controllers.GetAllDishes)
			dishes.GET("/:id", controllers.GetDish)
			dishes.POST("", controllers.CreateDish)
			dishes.POST("/:id/save", controllers.SaveDish)
			dishes.DELETE("/:id/save", controllers.UnsaveDish)
			dishes.GET("/:id/reviews", controllers.GetReviews)
			dishes.POST("/:id/reviews", controllers.CreateReview)
		}

		reviews := api.Group("/reviews")
		{
			reviews.PUT("/:id/helpful", controllers.MarkHelpful)
		}

		api.GET("/search", controllers.Search)

		// Trending
		api.GET("/trending", controllers.GetTrending)
	}
}