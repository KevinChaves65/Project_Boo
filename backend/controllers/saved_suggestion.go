package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/KevinChaves65/Project_Boo/config"
	"github.com/KevinChaves65/Project_Boo/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// SaveSuggestionRequest represents the request body for saving a suggestion
type SaveSuggestionRequest struct {
	Title         string `json:"title" binding:"required"`
	Description   string `json:"description"`
	Cost          string `json:"cost"`
	Timing        string `json:"timing"`
	BusinessName  string `json:"business_name"`
	Address       string `json:"address"`
	MapURL        string `json:"map_url"`
	ImageURL      string `json:"image_url"`
	IsAIGenerated bool   `json:"is_ai_generated"`
}

// SaveSuggestion saves a date suggestion for a couple
func SaveSuggestion(c *gin.Context) {
	// Get couple ID from context (you'll need to set this in your auth middleware)
	coupleIDStr, exists := c.Get("couple_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Couple not authenticated"})
		return
	}

	coupleID, err := primitive.ObjectIDFromHex(coupleIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid couple ID"})
		return
	}

	var req SaveSuggestionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()
	collection := db.Collection("saved_suggestions")

	// Check if suggestion already exists for this couple
	filter := bson.M{
		"couple_id": coupleID,
		"title":     req.Title,
	}

	var existingSuggestion models.SavedSuggestion
	err = collection.FindOne(context.TODO(), filter).Decode(&existingSuggestion)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Suggestion already saved"})
		return
	}

	// Create new saved suggestion
	now := time.Now()
	savedSuggestion := models.SavedSuggestion{
		ID:            primitive.NewObjectID(),
		CoupleID:      coupleID,
		Title:         req.Title,
		Description:   req.Description,
		Cost:          req.Cost,
		Timing:        req.Timing,
		BusinessName:  req.BusinessName,
		Address:       req.Address,
		MapURL:        req.MapURL,
		ImageURL:      req.ImageURL,
		IsAIGenerated: req.IsAIGenerated,
		SavedAt:       now,
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	_, err = collection.InsertOne(context.TODO(), savedSuggestion)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save suggestion"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "Suggestion saved successfully",
		"suggestion": savedSuggestion,
	})
}

// GetSavedSuggestions retrieves all saved suggestions for a couple
func GetSavedSuggestions(c *gin.Context) {
	coupleIDStr, exists := c.Get("couple_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Couple not authenticated"})
		return
	}

	coupleID, err := primitive.ObjectIDFromHex(coupleIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid couple ID"})
		return
	}

	db := config.GetDB()
	collection := db.Collection("saved_suggestions")

	filter := bson.M{"couple_id": coupleID}
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve saved suggestions"})
		return
	}
	defer cursor.Close(context.TODO())

	var savedSuggestions []models.SavedSuggestion
	if err = cursor.All(context.TODO(), &savedSuggestions); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode saved suggestions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"suggestions": savedSuggestions,
		"count":       len(savedSuggestions),
	})
}

// DeleteSavedSuggestion removes a saved suggestion
func DeleteSavedSuggestion(c *gin.Context) {
	coupleIDStr, exists := c.Get("couple_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Couple not authenticated"})
		return
	}

	coupleID, err := primitive.ObjectIDFromHex(coupleIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid couple ID"})
		return
	}

	suggestionIDStr := c.Param("id")
	suggestionID, err := primitive.ObjectIDFromHex(suggestionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid suggestion ID"})
		return
	}

	db := config.GetDB()
	collection := db.Collection("saved_suggestions")

	filter := bson.M{
		"_id":       suggestionID,
		"couple_id": coupleID,
	}

	result, err := collection.DeleteOne(context.TODO(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete suggestion"})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Suggestion not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Suggestion deleted successfully"})
}

// CheckIfSaved checks if a suggestion is already saved
func CheckIfSaved(c *gin.Context) {
	coupleIDStr, exists := c.Get("couple_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Couple not authenticated"})
		return
	}

	coupleID, err := primitive.ObjectIDFromHex(coupleIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid couple ID"})
		return
	}

	title := c.Query("title")
	if title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Title parameter is required"})
		return
	}

	db := config.GetDB()
	collection := db.Collection("saved_suggestions")

	filter := bson.M{
		"couple_id": coupleID,
		"title":     title,
	}

	var savedSuggestion models.SavedSuggestion
	err = collection.FindOne(context.TODO(), filter).Decode(&savedSuggestion)

	isSaved := err == nil
	var suggestionID string
	if isSaved {
		suggestionID = savedSuggestion.ID.Hex()
	}

	c.JSON(http.StatusOK, gin.H{
		"is_saved":      isSaved,
		"suggestion_id": suggestionID,
	})
}
