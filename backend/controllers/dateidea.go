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

	// Build a MUCH simpler, token-efficient prompt
	prompt := fmt.Sprintf("Generate 3 simple date ideas for %s", request.Location)

	if request.Preferences != "" {
		prompt += fmt.Sprintf(" (preferences: %s)", request.Preferences)
	}

	if request.Budget != "" {
		prompt += fmt.Sprintf(" (budget: %s)", request.Budget)
	}

	prompt += `. Return JSON array:
[
  {
    "title": "Short title",
    "description": "Brief description",
    "cost": "$X-Y range",
    "bestTime": "Best time to visit (e.g., weekends, evenings, mornings)",
    "address": "Specific address or area",
    "mapUrl": "https://maps.google.com/maps?q=encoded+address"
  }
]

Keep responses concise. Include Google Maps URLs and best timing for each activity.`

	// Log token usage comparison
	fmt.Printf("🔥 TOKEN EFFICIENCY IMPROVED! 🔥\n")
	fmt.Printf("📊 OLD prompt: ~1000+ characters (~300+ tokens)\n")
	fmt.Printf("📊 NEW prompt: %d characters (~%d tokens)\n", len(prompt), len(prompt)/4)
	fmt.Printf("💰 Token savings: ~%d%% reduction!\n", (1000-len(prompt))*100/1000)

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
		// Handle different HTTP status codes properly
		switch resp.StatusCode {
		case 429:
			// Gemini API rate limit exceeded - provide fallback
			fmt.Printf("🚨 GEMINI API 429 ERROR: %s\n", string(body))

			// Return fallback suggestions instead of error
			fallbackIdeas := generateFallbackIdeas(request.Location, request.Preferences, request.Budget)
			c.JSON(http.StatusOK, gin.H{
				"ideas":    fallbackIdeas,
				"location": request.Location,
				"success":  true,
				"fallback": true,
				"message":  "Generated offline suggestions due to API quota exceeded",
			})
		case 400:
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Invalid request to Gemini API",
				"details": string(body),
			})
		case 403:
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "Gemini API access denied",
				"message": "Please check your API key",
				"details": string(body),
			})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":      "Gemini API error",
				"statusCode": resp.StatusCode,
				"details":    string(body),
			})
		}
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

// generateFallbackIdeas creates offline suggestions when API quota is exceeded
func generateFallbackIdeas(location, preferences, budget string) string {
	// Create Google Maps URLs for common date spots
	locationEncoded := location // In a real app, you'd URL encode this

	fallbackJSON := fmt.Sprintf(`[
		{
			"title": "Local Coffee & Walk",
			"description": "Visit a cozy cafe then walk around %s together.",
			"cost": "$15-30",
			"bestTime": "Morning or afternoon",
			"address": "%s downtown area",
			"mapUrl": "https://maps.google.com/maps?q=coffee+shops+near+%s"
		},
		{
			"title": "Park & Picnic Date", 
			"description": "Enjoy outdoor time at a local park in %s.",
			"cost": "$20-40",
			"bestTime": "Weekends, sunny afternoons",
			"address": "%s public parks",
			"mapUrl": "https://maps.google.com/maps?q=parks+near+%s"
		},
		{
			"title": "Local Restaurant Night",
			"description": "Try a popular local restaurant in %s.",
			"cost": "$40-80",
			"bestTime": "Evening, weekends",
			"address": "%s restaurant district",
			"mapUrl": "https://maps.google.com/maps?q=restaurants+near+%s"
		}
	]`, location, location, location, locationEncoded, location, location, location, locationEncoded, location, location, location, locationEncoded)

	return fallbackJSON
}
