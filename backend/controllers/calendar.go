package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func SyncCalendar(c *gin.Context) {
	// Placeholder for calendar sync logic
	c.JSON(http.StatusOK, gin.H{"message": "Calendar sync is not implemented yet"})
}
