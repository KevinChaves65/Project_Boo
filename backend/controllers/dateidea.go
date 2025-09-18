package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// GeminiRequest represents the request structure for Gemini API
type GeminiRequest struct {
	Contents []GeminiContent `json:"contents"`
}

type GeminiContent struct {
	Parts []GeminiPart `json:"parts"`
}

type GeminiPart struct {
	Text string `json:"text"`
}

// GeminiResponse represents the response structure from Gemini API
type GeminiResponse struct {
	Candidates []GeminiCandidate `json:"candidates"`
}

type GeminiCandidate struct {
	Content      GeminiContentResponse `json:"content"`
	FinishReason string                `json:"finishReason"`
}

type GeminiContentResponse struct {
	Parts []GeminiPartResponse `json:"parts"`
}

type GeminiPartResponse struct {
	Text string `json:"text"`
}

// DateIdeaRequest represents the request from frontend
type DateIdeaRequest struct {
	Location    string `json:"location"`
	Preferences string `json:"preferences,omitempty"`
	Budget      string `json:"budget,omitempty"`
}

func GenerateDateIdeas(c *gin.Context) {
	var request DateIdeaRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get API key from environment
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gemini API key not configured"})
		return
	}

	// Build the enhanced prompt
	prompt := fmt.Sprintf("Give me 5-7 creative and diverse date ideas near %s", request.Location)

	if request.Preferences != "" {
		prompt += fmt.Sprintf(", considering these preferences: %s", request.Preferences)
	}

	if request.Budget != "" {
		prompt += fmt.Sprintf(", with a %s budget", request.Budget)
	}

	prompt += `. For each date idea, provide comprehensive information including:

1) A creative and specific title
2) Detailed description (2-3 sentences)
3) Estimated cost range
4) Best time/season to visit
5) Why it's special for couples
6) Specific business name and address if applicable
7) Google Maps star rating (if available, use realistic ratings 3.5-4.8)
8) Sample Google Maps review quotes (create realistic positive reviews)
9) High-quality image URLs (suggest relevant stock photo search terms or actual place photos if known)
10) Additional amenities or features

Format as a JSON array with objects containing these fields:
{
  "title": "Creative Title",
  "description": "Detailed description",
  "cost": "Cost range (e.g., $50-100 per couple)",
  "timing": "Best time to visit",
  "specialNote": "Why special for couples",
  "businessName": "Specific business name if applicable",
  "address": "Full address if applicable", 
  "rating": 4.2,
  "sampleReviews": [
    "Great place for a romantic evening! - Sarah M.",
    "Perfect atmosphere for couples! - John D."
  ],
  "imageUrl": "https://example.com/image.jpg or suggested search term",
  "amenities": ["parking", "outdoor seating", "live music"]
}

Please make the suggestions as specific and realistic as possible for the ` + request.Location + ` area. Include actual local businesses when possible, and create believable reviews and ratings that sound authentic.`

	// Prepare Gemini API request
	geminiReq := GeminiRequest{
		Contents: []GeminiContent{
			{
				Parts: []GeminiPart{
					{Text: prompt},
				},
			},
		},
	}

	// Convert to JSON
	jsonData, err := json.Marshal(geminiReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to prepare request"})
		return
	}

	// Make request to Gemini API
	url := "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-goog-api-key", apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to call Gemini API"})
		return
	}
	defer resp.Body.Close()

	// Read response
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response"})
		return
	}

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gemini API error", "details": string(body)})
		return
	}

	// Parse Gemini response
	var geminiResp GeminiResponse
	if err := json.Unmarshal(body, &geminiResp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse Gemini response"})
		return
	}

	// Extract text from response
	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No content in Gemini response"})
		return
	}

	responseText := geminiResp.Candidates[0].Content.Parts[0].Text

	// Return the generated ideas
	c.JSON(http.StatusOK, gin.H{
		"ideas":    responseText,
		"location": request.Location,
		"success":  true,
	})
}
