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
		PartnerID string `json:"partner_id"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get current user from JWT token
	currentUsername, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Retrieve current user by username
	currentUser, err := models.GetUser(currentUsername.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Current user not found"})
		return
	}

	// Convert partner ID string to ObjectID
	partnerObjectID, err := primitive.ObjectIDFromHex(request.PartnerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid partner ID format"})
		return
	}

	// Retrieve partner by ID
	partner, err := models.GetUserByID(partnerObjectID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Partner not found"})
		return
	}

	// Check if current user is already in a couple
	_, err = models.GetCoupleByUserID(currentUser.ID)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "You are already in a couple"})
		return
	}

	// Check if partner is already in a couple
	_, err = models.GetCoupleByUserID(partner.ID)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Partner is already in a couple"})
		return
	}

	// Create a couple entry
	coupleID, err := models.AddCouple(currentUser.ID, partner.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to link couple"})
		return
	}

	// Update users with the couple ID
	err = models.UpdateUser(currentUser.ID, bson.M{"couple_id": coupleID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update current user"})
		return
	}

	err = models.UpdateUser(partner.ID, bson.M{"couple_id": coupleID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update partner"})
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

	// Retrieve the couple by ID
	couple, err := models.GetCoupleByID(objectID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Couple not found"})
		return
	}

	// Fetch usernames for user1 and user2
	user1, err := models.GetUserByID(couple.User1ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user1"})
		return
	}

	user2, err := models.GetUserByID(couple.User2ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user2"})
		return
	}

	// Return the couple info along with usernames
	c.JSON(http.StatusOK, gin.H{
		"couple": gin.H{
			"id":             couple.ID.Hex(),
			"user1_id":       couple.User1ID.Hex(),
			"user1_username": user1.Username,
			"user2_id":       couple.User2ID.Hex(),
			"user2_username": user2.Username,
			"created_at":     couple.CreatedAt,
		},
	})
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
