package models

import (
	"context"
	"errors"
	"time"

	"github.com/KevinChaves65/Project_Boo/config"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID          primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
	Username    string              `bson:"username" json:"username"`
	Password    string              `bson:"password,omitempty" json:"-"`
	Email       string              `bson:"email" json:"email"`
	PhoneNumber string              `bson:"phone_number" json:"phone_number"`
	Gender      string              `bson:"gender" json:"gender"`
	FullName    string              `bson:"full_name" json:"full_name"`
	Birthday    string              `bson:"birthday" json:"birthday"` // Format: YYYY-MM-DD
	CoupleID    *primitive.ObjectID `bson:"couple_id,omitempty" json:"couple_id"`
	CreatedAt   time.Time           `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time           `bson:"updated_at" json:"updated_at"`
}

type Login struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// Add a user to the database
func AddUser(user User) error {
	collection := config.GetDB().Collection("users")
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	_, err := collection.InsertOne(context.TODO(), user)
	return err
}

// Get a user from the database
func GetUser(username string) (User, error) {
	collection := config.GetDB().Collection("users")
	var user User
	err := collection.FindOne(context.TODO(), bson.M{"username": username}).Decode(&user)
	return user, err
}

// Authenticate a user
func AuthenticateUser(username, password string) (User, error) {
	collection := config.GetDB().Collection("users")
	var user User

	// Find the user by username
	err := collection.FindOne(context.TODO(), bson.M{"username": username}).Decode(&user)
	if err != nil {
		return user, errors.New("invalid username or password")
	}

	// Compare the provided password with the hashed password
	if !CheckPasswordHash(password, user.Password) {
		return user, errors.New("invalid username or password")
	}

	return user, nil
}

// UpdateUser updates a user's information in the database
func UpdateUser(userID primitive.ObjectID, update bson.M) error {
	collection := config.GetDB().Collection("users")
	_, err := collection.UpdateOne(context.TODO(), bson.M{"_id": userID}, bson.M{"$set": update})
	return err
}

func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
