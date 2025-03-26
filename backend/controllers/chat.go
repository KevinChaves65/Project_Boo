package controllers

import (
	"net/http"

	"github.com/KevinChaves65/Project_Boo/models"
	"github.com/KevinChaves65/Project_Boo/utils"
	"github.com/gin-gonic/gin"
)

func SendMessage(c *gin.Context) {
	var message models.Message
	if err := c.ShouldBindJSON(&message); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Encrypt the message content
	encryptedMessage, err := utils.EncryptMessage(message.Content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encrypt message"})
		return
	}
	message.Content = encryptedMessage

	// Save the message to the database
	if err := models.SaveMessage(message); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send message"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Message sent successfully"})
}

func ReceiveMessages(c *gin.Context) {
	user, _ := c.Get("user")

	// Retrieve messages for the user
	messages, err := models.GetMessages(user.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve messages"})
		return
	}

	// Decrypt the message content
	for i, msg := range messages {
		decryptedMessage, err := utils.DecryptMessage(msg.Content)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decrypt message"})
			return
		}
		messages[i].Content = decryptedMessage
	}

	c.JSON(http.StatusOK, gin.H{"messages": messages})
}
