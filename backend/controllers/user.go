package controllers

import (
	"net/http"

	"github.com/KevinChaves65/Project_Boo/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// GetUserByID retrieves a user by their ID
func GetUserByID(c *gin.Context) {
	userID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	user, err := models.GetUserByID(objectID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}
