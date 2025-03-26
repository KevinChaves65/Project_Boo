package models

import (
	"context"
	"time"

	"github.com/KevinChaves65/Project_Boo/config"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Couple struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`      // Primary key
	User1ID   primitive.ObjectID `bson:"user1_id" json:"user1_id"`     // First user's ID
	User2ID   primitive.ObjectID `bson:"user2_id" json:"user2_id"`     // Second user's ID
	CreatedAt time.Time          `bson:"created_at" json:"created_at"` // Timestamp when the couple was created
}

// AddCouple creates a new couple entry in the database
func AddCouple(user1ID, user2ID primitive.ObjectID) (primitive.ObjectID, error) {
	collection := config.GetDB().Collection("couples")
	couple := Couple{
		User1ID:   user1ID,
		User2ID:   user2ID,
		CreatedAt: time.Now(),
	}
	result, err := collection.InsertOne(context.TODO(), couple)
	if err != nil {
		return primitive.NilObjectID, err
	}
	return result.InsertedID.(primitive.ObjectID), nil
}

// GetCoupleByID retrieves a couple by their couple ID
func GetCoupleByID(coupleID primitive.ObjectID) (Couple, error) {
	collection := config.GetDB().Collection("couples")
	var couple Couple
	err := collection.FindOne(context.TODO(), bson.M{"_id": coupleID}).Decode(&couple)
	return couple, err
}

// GetCoupleByUserID retrieves a couple by one of the user's IDs
func GetCoupleByUserID(userID primitive.ObjectID) (Couple, error) {
	collection := config.GetDB().Collection("couples")
	var couple Couple
	err := collection.FindOne(context.TODO(), bson.M{"$or": []bson.M{
		{"user1_id": userID},
		{"user2_id": userID},
	}}).Decode(&couple)
	return couple, err
}

// DeleteCouple deletes a couple by their couple ID
func DeleteCouple(coupleID primitive.ObjectID) error {
	collection := config.GetDB().Collection("couples")
	_, err := collection.DeleteOne(context.TODO(), bson.M{"_id": coupleID})
	return err
}
