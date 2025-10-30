package controllers

import (
	"net/http"

	"github.com/KevinChaves65/Project_Boo/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GetWordThemesHandler returns all available word themes
func GetWordThemesHandler(c *gin.Context) {
	themes, err := models.GetAllWordThemes()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve themes"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"themes": themes})
}

// AddWordToBankHandler adds a word with theme to couple's word bank
func AddWordToBankHandler(c *gin.Context) {
	var body struct {
		CoupleID string `json:"couple_id"`
		WordName string `json:"word_name"`
		ThemeID  string `json:"theme_id"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if len(body.WordName) == 0 || len(body.WordName) > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Word name must be between 1 and 100 characters"})
		return
	}

	wordBank := models.WordBank{
		ID:       uuid.New().String(),
		CoupleID: body.CoupleID,
		WordName: body.WordName,
		ThemeID:  body.ThemeID,
	}

	if err := models.SaveWordToBank(wordBank); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save word"})
		return
	}

	c.JSON(http.StatusCreated, wordBank)
}

// GetWordBankHandler retrieves all words for a couple
func GetWordBankHandler(c *gin.Context) {
	coupleID := c.Query("couple_id")
	if coupleID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing couple_id"})
		return
	}

	wordBank, err := models.GetWordBankByCoupleID(coupleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve word bank"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"word_bank": wordBank})
}

// UpdateWordThemeHandler updates the theme of a word
func UpdateWordThemeHandler(c *gin.Context) {
	var body struct {
		CoupleID   string `json:"couple_id"`
		WordID     string `json:"word_id"`
		NewThemeID string `json:"new_theme_id"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if err := models.UpdateWordTheme(body.CoupleID, body.WordID, body.NewThemeID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update word theme"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Word theme updated successfully"})
}

// DeleteWordFromBankHandler removes a word from couple's word bank
func DeleteWordFromBankHandler(c *gin.Context) {
	coupleID := c.Query("couple_id")
	wordID := c.Query("word_id")

	if coupleID == "" || wordID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing couple_id or word_id"})
		return
	}

	if err := models.DeleteWordFromBank(coupleID, wordID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete word"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Word deleted successfully"})
}
