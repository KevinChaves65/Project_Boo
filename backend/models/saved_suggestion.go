package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type SavedSuggestion struct {
	ID            primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	CoupleID      primitive.ObjectID `json:"couple_id" bson:"couple_id"`
	Title         string             `json:"title" bson:"title"`
	Description   string             `json:"description" bson:"description"`
	Cost          string             `json:"cost" bson:"cost"`
	Timing        string             `json:"timing" bson:"timing"`
	BusinessName  string             `json:"business_name" bson:"business_name"`
	Address       string             `json:"address" bson:"address"`
	MapURL        string             `json:"map_url" bson:"map_url"`
	ImageURL      string             `json:"image_url" bson:"image_url"`
	IsAIGenerated bool               `json:"is_ai_generated" bson:"is_ai_generated"`
	SavedAt       time.Time          `json:"saved_at" bson:"saved_at"`
	CreatedAt     time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt     time.Time          `json:"updated_at" bson:"updated_at"`
}
