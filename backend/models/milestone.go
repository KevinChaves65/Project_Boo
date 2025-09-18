package models

import (
	"context"
	"time"

	"github.com/KevinChaves65/Project_Boo/config"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Milestone struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	CoupleID    primitive.ObjectID `bson:"couple_id" json:"couple_id"`
	Title       string             `bson:"title" json:"title"`
	Description string             `bson:"description" json:"description"`
	Date        time.Time          `bson:"date" json:"date"`
	Reminder    bool               `bson:"reminder" json:"reminder"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`
}

// AddMilestone adds a new milestone to the database
func AddMilestone(milestone Milestone) error {
	collection := config.GetDB().Collection("milestones")
	milestone.CreatedAt = time.Now()
	milestone.UpdatedAt = time.Now()
	_, err := collection.InsertOne(context.TODO(), milestone)
	return err
}

// GetMilestones retrieves milestones for a couple
func GetMilestones(coupleID primitive.ObjectID) ([]Milestone, error) {
	collection := config.GetDB().Collection("milestones")
	var milestones []Milestone

	// Query the database for milestones with the given couple_id
	cursor, err := collection.Find(context.TODO(), bson.M{"couple_id": coupleID})
	if err != nil {
		return milestones, err
	}

	// Decode the results into the milestones slice
	if err := cursor.All(context.TODO(), &milestones); err != nil {
		return milestones, err
	}

	return milestones, nil
}

// UpdateMilestone updates an existing milestone
func UpdateMilestone(id primitive.ObjectID, updatedMilestone Milestone) error {
	collection := config.GetDB().Collection("milestones")
	updatedMilestone.UpdatedAt = time.Now()
	_, err := collection.UpdateOne(context.TODO(), bson.M{"_id": id}, bson.M{"$set": updatedMilestone})
	return err
}

// DeleteMilestone deletes a milestone by ID
func DeleteMilestone(id primitive.ObjectID) error {
	collection := config.GetDB().Collection("milestones")
	_, err := collection.DeleteOne(context.TODO(), bson.M{"_id": id})
	return err
}
