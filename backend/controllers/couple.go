package controllers

import (
	"net/http"

	"github.com/KevinChaves65/Project_Boo/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func LinkCouple(c *gin.Context) {
	var request struct {
		User1Username string `json:"user1_username"`
		User2Username string `json:"user2_username"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Retrieve users by username
	user1, err := models.GetUser(request.User1Username)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User1 not found"})
		return
	}

	user2, err := models.GetUser(request.User2Username)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User2 not found"})
		return
	}

	// Check if either user is already in a couple
	_, err = models.GetCoupleByUserID(user1.ID)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User1 is already in a couple"})
		return
	}

	_, err = models.GetCoupleByUserID(user2.ID)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User2 is already in a couple"})
		return
	}

	// Create a couple entry
	coupleID, err := models.AddCouple(user1.ID, user2.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to link couple"})
		return
	}

	// Update users with the couple ID
	err = models.UpdateUser(user1.ID, bson.M{"couple_id": coupleID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update User1"})
		return
	}

	err = models.UpdateUser(user2.ID, bson.M{"couple_id": coupleID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update User2"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Couple linked successfully", "couple_id": coupleID.Hex()})
}

func GetCouple(c *gin.Context) {
	coupleID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(coupleID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid couple ID"})
		return
	}

	couple, err := models.GetCoupleByID(objectID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Couple not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"couple": couple})
}

func DeleteCouple(c *gin.Context) {
	coupleID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(coupleID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid couple ID"})
		return
	}

	if err := models.DeleteCouple(objectID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete couple"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Couple deleted successfully"})
}
