package models

import (
	"context"
	"log"

	"github.com/KevinChaves65/Project_Boo/config"
	"go.mongodb.org/mongo-driver/bson"
)

type Message struct {
	Sender    string `json:"sender"`
	Receiver  string `json:"receiver"`
	Content   string `json:"content"`
	Timestamp int64  `json:"timestamp"`
}

// Save a message to the database
func SaveMessage(message Message) error {
	collection := config.GetDB().Collection("messages")
	_, err := collection.InsertOne(context.TODO(), message)
	return err
}

// Get messages for a user
func GetMessages(username string) ([]Message, error) {
	collection := config.GetDB().Collection("messages")
	var messages []Message

	// Query for messages where the user is either the sender or receiver
	filter := bson.M{
		"$or": []bson.M{
			{"receiver": username},
			{"sender": username},
		},
	}

	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		return messages, err
	}
	for cursor.Next(context.Background()) {
		var message Message
		if err := cursor.Decode(&message); err != nil {
			log.Println("Error decoding message:", err)
			continue
		}
		messages = append(messages, message)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return messages, nil
}
