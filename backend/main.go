package main

import (
	"log"
	"os"

	"github.com/KevinChaves65/Project_Boo/config"
	"github.com/KevinChaves65/Project_Boo/controllers"
	"github.com/KevinChaves65/Project_Boo/middlewares"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file from the root directory
	err := godotenv.Load("../.env") // Adjust the path if the .env file is in the root directory
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	// Connect to the database
	config.ConnectDB()

	r := gin.Default()

	// Enable CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://your-trusted-domain.com"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	r.POST("/register", controllers.Register)
	r.POST("/login", controllers.Login)

	auth := r.Group("/auth")
	auth.Use(middlewares.JWTAuthMiddleware())
	auth.GET("/profile", controllers.Profile)

	// Chat routes
	auth.POST("/chat/send", controllers.SendMessage)
	auth.GET("/chat/receive", controllers.ReceiveMessages)

	// Couple routes
	auth.POST("/couple/link", controllers.LinkCouple)
	auth.GET("/couple/:id", controllers.GetCouple)
	auth.DELETE("/couple/:id", controllers.DeleteCouple)

	// Milestone routes
	auth.POST("/milestones", controllers.AddMilestone)
	auth.GET("/milestones", controllers.GetMilestones)
	auth.PUT("/milestones/:id", controllers.UpdateMilestone)
	auth.DELETE("/milestones/:id", controllers.DeleteMilestone)

	// Calendar routes
	auth.POST("/calendar/sync", controllers.SyncCalendar)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default port if not specified
	}

	r.Run(":" + port)
}
