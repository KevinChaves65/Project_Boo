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

// Get a user by ID from the database
func GetUserByID(userID primitive.ObjectID) (User, error) {
	collection := config.GetDB().Collection("users")
	var user User
	err := collection.FindOne(context.TODO(), bson.M{"_id": userID}).Decode(&user)
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

func GetUserByUsername(username string) (User, error) {
	collection := config.GetDB().Collection("users")
	var user User

	err := collection.FindOne(context.TODO(), bson.M{"username": username}).Decode(&user)
	if err != nil {
		return user, errors.New("user not found")
	}

	return user, nil
}

// UpdateUserProfile updates user's full name and email
func UpdateUserProfile(username, fullName, email string) error {
	collection := config.GetDB().Collection("users")

	update := bson.M{
		"$set": bson.M{
			"full_name":  fullName,
			"email":      email,
			"updated_at": time.Now(),
		},
	}

	_, err := collection.UpdateOne(context.TODO(), bson.M{"username": username}, update)
	return err
}

// ChangeUserPassword changes user's password after verifying old password
func ChangeUserPassword(username, oldPassword, newPassword string) error {
	collection := config.GetDB().Collection("users")

	// First get the user to verify old password
	user, err := GetUser(username)
	if err != nil {
		return errors.New("user not found")
	}

	// Verify old password
	if !CheckPasswordHash(oldPassword, user.Password) {
		return errors.New("invalid current password")
	}

	// Hash new password
	hashedPassword, err := HashPassword(newPassword)
	if err != nil {
		return errors.New("failed to hash new password")
	}

	// Update password
	update := bson.M{
		"$set": bson.M{
			"password":   hashedPassword,
			"updated_at": time.Now(),
		},
	}

	_, err = collection.UpdateOne(context.TODO(), bson.M{"username": username}, update)
	return err
}

// IsUsernameTaken returns true if another user (not the current one) already uses newUsername.
func IsUsernameTaken(newUsername, currentUsername string) (bool, error) {
	collection := config.GetDB().Collection("users")

	filter := bson.M{
		"$and": []bson.M{
			{"username": newUsername},
			{"username": bson.M{"$ne": currentUsername}},
		},
	}

	count, err := collection.CountDocuments(context.TODO(), filter)
	return count > 0, err
}


// IsEmailTaken returns true if another user (not the current one) already uses newEmail.
func IsEmailTaken(newEmail, currentUsername string) (bool, error) {
	collection := config.GetDB().Collection("users")
	filter := bson.M{
		"$and": []bson.M{
			{"email": newEmail},
			{"username": bson.M{"$ne": currentUsername}},
		},
	}
	count, err := collection.CountDocuments(context.TODO(), filter)
	return count > 0, err
}

// UpdateUserCredentials updates username and/or email for the specified currentUsername.
func UpdateUserCredentials(currentUsername, newUsername, newEmail string) error {
	collection := config.GetDB().Collection("users")

	updateSet := bson.M{"updated_at": time.Now()}
	if newUsername != "" {
		updateSet["username"] = newUsername
	}
	if newEmail != "" {
		updateSet["email"] = newEmail
	}

	_, err := collection.UpdateOne(
		context.TODO(),
		bson.M{"username": currentUsername},
		bson.M{"$set": updateSet},
	)
	return err
}
