package main

import (
	"fmt"
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

	if os.Getenv("APP_ENV") != "production" {
		godotenv.Load()
	}

	config.ConnectDB()

	if err := models.InitializeDefaultThemes(); err != nil {
		log.Printf("Failed to initialize default themes: %v", err)
	}
	go services.HandleMessages()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			
        	if origin == "" || origin == "null" {
            return true
        	}
			if origin == "http://localhost:5173" {
				return true
			}
			if len(origin) > 16 && origin[:16] == "chrome-extension" {
				return true
			}
			if len(origin) > 13 && origin[:13] == "moz-extension" {
				return true
			}
			if origin == "https://heyboo.ca" {
				return true
			}
			return false
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization", "Origin", "Accept"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60,
	}))

	r.Use(gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		return fmt.Sprintf("%s - [%s] \"%s %s %s %d %s \"%s\" %s\"\n",
			param.ClientIP,
			param.TimeStamp.Format("02/Jan/2006:15:04:05 -0700"),
			param.Method,
			param.Path,
			param.Request.Proto,
			param.StatusCode,
			param.Latency,
			param.Request.UserAgent(),
			param.ErrorMessage,
		)
	}))

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	r.POST("/register", controllers.Register)
	r.POST("/login", controllers.Login)
	r.GET("/user/public", controllers.GetPublicUserInfo)
	r.GET("/ws", gin.WrapF(controllers.ChatHandler))

	auth := r.Group("/auth")
	auth.Use(middlewares.JWTAuthMiddleware())
	auth.GET("/profile", controllers.Profile)
	auth.PUT("/profile", controllers.UpdateProfile)
	auth.PUT("/password", controllers.ChangePassword)

	auth.POST("/chat/send", controllers.SendMessage)
	auth.GET("/chat/receive", controllers.ReceiveMessages)

	auth.POST("/couple/link", controllers.LinkCouple)
	auth.GET("/couple/:id", controllers.GetCouple)
	auth.DELETE("/couple/:id", controllers.DeleteCouple)

	auth.POST("/milestones", controllers.AddMilestone)
	auth.GET("/milestones", controllers.GetMilestones)
	auth.PUT("/milestones/:id", controllers.UpdateMilestone)
	auth.DELETE("/milestones/:id", controllers.DeleteMilestone)

	auth.POST("/calendar/sync", controllers.SyncCalendar)
	auth.POST("/calendar/add", controllers.AddToCalendar)

	auth.POST("/dateideas/generate", controllers.GenerateDateIdeas)

	auth.POST("/saved-suggestions", controllers.SaveSuggestion)
	auth.GET("/saved-suggestions", controllers.GetSavedSuggestions)
	auth.DELETE("/saved-suggestions/:id", controllers.DeleteSavedSuggestion)
	auth.GET("/saved-suggestions/check", controllers.CheckIfSaved)

	auth.GET("/word-themes", controllers.GetWordThemesHandler)
	auth.POST("/word-bank", controllers.AddWordToBankHandler)
	auth.GET("/word-bank", controllers.GetWordBankHandler)
	auth.PUT("/word-bank/theme", controllers.UpdateWordThemeHandler)
	auth.DELETE("/word-bank", controllers.DeleteWordFromBankHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("Server running on port", port)
	r.Run(":" + port)
}
