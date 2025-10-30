package main

import (
	"log"
	"os"

	"github.com/KevinChaves65/Project_Boo/config"
	"github.com/KevinChaves65/Project_Boo/controllers"
	"github.com/KevinChaves65/Project_Boo/middlewares"
	"github.com/KevinChaves65/Project_Boo/models"
	"github.com/KevinChaves65/Project_Boo/services"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file from the root directory
	if err := godotenv.Load("../.env"); err != nil {
		log.Println("No local .env file found, relying on Docker/host environment variables.")
	}

	go services.HandleMessages()

	// Connect to the database
	config.ConnectDB()

	// Initialize default word themes
	if err := models.InitializeDefaultThemes(); err != nil {
		log.Printf("Failed to initialize default themes: %v", err)
	}

	r := gin.Default()

	// Enable CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // Frontend origin
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	r.POST("/register", controllers.Register)
	r.POST("/login", controllers.Login)
	r.GET("/user/public", controllers.GetPublicUserInfo)

	// WebSocket route for real-time chat
	r.GET("/ws", gin.WrapF(controllers.ChatHandler))

	auth := r.Group("/auth")
	auth.Use(middlewares.JWTAuthMiddleware())
	auth.GET("/profile", controllers.Profile)
	auth.PUT("/profile", controllers.UpdateProfile)
	auth.PUT("/password", controllers.ChangePassword)

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
	auth.POST("/calendar/add", controllers.AddToCalendar)

	// Date Ideas routes
	auth.POST("/dateideas/generate", controllers.GenerateDateIdeas)

	// Saved Suggestions routes
	auth.POST("/saved-suggestions", controllers.SaveSuggestion)
	auth.GET("/saved-suggestions", controllers.GetSavedSuggestions)
	auth.DELETE("/saved-suggestions/:id", controllers.DeleteSavedSuggestion)
	auth.GET("/saved-suggestions/check", controllers.CheckIfSaved)

	// New themed word bank routes
	auth.GET("/word-themes", controllers.GetWordThemesHandler)
	auth.POST("/word-bank", controllers.AddWordToBankHandler)
	auth.GET("/word-bank", controllers.GetWordBankHandler)
	auth.PUT("/word-bank/theme", controllers.UpdateWordThemeHandler)
	auth.DELETE("/word-bank", controllers.DeleteWordFromBankHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // default port
	}

	r.Run(":" + port)
}
