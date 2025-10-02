package controllers

import (
	"fmt"
	"net/http"
	"net/url"
	"time"

	"github.com/gin-gonic/gin"
)

func SyncCalendar(c *gin.Context) {
	// Placeholder for calendar sync logic
	c.JSON(http.StatusOK, gin.H{"message": "Calendar sync is not implemented yet"})
}

// AddToCalendarRequest represents the request body for adding to calendar
type AddToCalendarRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	StartDate   string `json:"start_date" binding:"required"` // Format: "2006-01-02"
	StartTime   string `json:"start_time"`                    // Format: "15:04"
	EndTime     string `json:"end_time"`
	Location    string `json:"location"`
}

// AddToCalendar generates calendar URLs for different calendar providers
func AddToCalendar(c *gin.Context) {
	var req AddToCalendarRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse date and time
	dateLayout := "2006-01-02"
	timeLayout := "15:04"

	startDate, err := time.Parse(dateLayout, req.StartDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start date format. Use YYYY-MM-DD"})
		return
	}

	// Default times if not provided
	startTime := "19:00" // 7 PM default
	endTime := "21:00"   // 9 PM default

	if req.StartTime != "" {
		startTime = req.StartTime
	}
	if req.EndTime != "" {
		endTime = req.EndTime
	}

	// Parse times
	startT, err := time.Parse(timeLayout, startTime)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start time format. Use HH:MM"})
		return
	}

	endT, err := time.Parse(timeLayout, endTime)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end time format. Use HH:MM"})
		return
	}

	// Combine date and time
	startDateTime := time.Date(startDate.Year(), startDate.Month(), startDate.Day(),
		startT.Hour(), startT.Minute(), 0, 0, time.UTC)
	endDateTime := time.Date(startDate.Year(), startDate.Month(), startDate.Day(),
		endT.Hour(), endT.Minute(), 0, 0, time.UTC)

	// Format for different calendar providers
	startFormatted := startDateTime.Format("20060102T150400Z")
	endFormatted := endDateTime.Format("20060102T150400Z")

	// Generate calendar URLs
	calendarUrls := map[string]string{
		"google":  generateGoogleCalendarURL(req.Title, req.Description, startFormatted, endFormatted, req.Location),
		"outlook": generateOutlookCalendarURL(req.Title, req.Description, startFormatted, endFormatted, req.Location),
		"yahoo":   generateYahooCalendarURL(req.Title, req.Description, startFormatted, endFormatted, req.Location),
		"ics":     generateICSURL(req.Title, req.Description, startFormatted, endFormatted, req.Location),
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Calendar URLs generated successfully",
		"urls":    calendarUrls,
		"event_details": map[string]interface{}{
			"title":          req.Title,
			"description":    req.Description,
			"start_datetime": startDateTime.Format("2006-01-02 15:04"),
			"end_datetime":   endDateTime.Format("2006-01-02 15:04"),
			"location":       req.Location,
		},
	})
}

// Helper functions to generate calendar URLs
func generateGoogleCalendarURL(title, description, start, end, location string) string {
	baseURL := "https://calendar.google.com/calendar/render"
	params := url.Values{}
	params.Add("action", "TEMPLATE")
	params.Add("text", title)
	params.Add("dates", fmt.Sprintf("%s/%s", start, end))
	if description != "" {
		params.Add("details", description)
	}
	if location != "" {
		params.Add("location", location)
	}
	return baseURL + "?" + params.Encode()
}

func generateOutlookCalendarURL(title, description, start, end, location string) string {
	baseURL := "https://outlook.live.com/calendar/0/deeplink/compose"
	params := url.Values{}
	params.Add("subject", title)
	params.Add("startdt", start)
	params.Add("enddt", end)
	if description != "" {
		params.Add("body", description)
	}
	if location != "" {
		params.Add("location", location)
	}
	return baseURL + "?" + params.Encode()
}

func generateYahooCalendarURL(title, description, start, end, location string) string {
	baseURL := "https://calendar.yahoo.com/"
	params := url.Values{}
	params.Add("v", "60")
	params.Add("view", "d")
	params.Add("type", "20")
	params.Add("title", title)
	params.Add("st", start)
	params.Add("et", end)
	if description != "" {
		params.Add("desc", description)
	}
	if location != "" {
		params.Add("in_loc", location)
	}
	return baseURL + "?" + params.Encode()
}

func generateICSURL(title, description, start, end, location string) string {
	// This would generate an ICS file download URL
	// For now, return a placeholder
	return "/api/calendar/download-ics?title=" + url.QueryEscape(title) +
		"&start=" + start + "&end=" + end + "&location=" + url.QueryEscape(location)
}
