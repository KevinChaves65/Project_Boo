package controllers

import (
	"net/http"

	"github.com/KevinChaves65/Project_Boo/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func AddMilestone(c *gin.Context) {
	var milestone models.Milestone
	if err := c.ShouldBindJSON(&milestone); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Add the milestone to the database
	if err := models.AddMilestone(milestone); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add milestone"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Milestone added successfully"})
}

func GetMilestones(c *gin.Context) {
	coupleID := c.Query("couple_id")
	objectID, err := primitive.ObjectIDFromHex(coupleID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid couple ID"})
		return
	}

	milestones, err := models.GetMilestones(objectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve milestones"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"milestones": milestones})
}

func UpdateMilestone(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid milestone ID"})
		return
	}

	var milestone models.Milestone
	if err := c.ShouldBindJSON(&milestone); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := models.UpdateMilestone(objectID, milestone); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update milestone"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Milestone updated successfully"})
}

func DeleteMilestone(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid milestone ID"})
		return
	}

	if err := models.DeleteMilestone(objectID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete milestone"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Milestone deleted successfully"})
}
