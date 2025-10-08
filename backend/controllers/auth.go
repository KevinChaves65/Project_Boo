package controllers

import (
	"errors"
	"net/http"
	"regexp"

	"github.com/KevinChaves65/Project_Boo/models"
	"github.com/KevinChaves65/Project_Boo/utils"
	"github.com/gin-gonic/gin"
)

type RegisterUser struct {
	Username        string `json:"username" binding:"required"`
	Password        string `json:"password" binding:"required,min=8"`
	ConfirmPassword string `json:"confirm_password" binding:"required"`
	Email           string `json:"email" binding:"required,email"`
	PhoneNumber     string `json:"phone_number" binding:"required"`
	Gender          string `json:"gender" binding:"required"`
	FullName        string `json:"full_name" binding:"required"`
	Birthday        string `json:"birthday" binding:"required"` // Format: YYYY-MM-DD
}

func validatePassword(password string) error {
	if len(password) < 8 {
		return errors.New("password must be at least 8 characters long")
	}
	if !regexp.MustCompile(`[A-Z]`).MatchString(password) {
		return errors.New("password must contain at least one uppercase letter")
	}
	if !regexp.MustCompile(`[a-z]`).MatchString(password) {
		return errors.New("password must contain at least one lowercase letter")
	}
	if !regexp.MustCompile(`[0-9]`).MatchString(password) {
		return errors.New("password must contain at least one number")
	}
	if !regexp.MustCompile(`[!@#\$%\^&\*]`).MatchString(password) {
		return errors.New("password must contain at least one special character")
	}
	return nil
}

func Register(c *gin.Context) {
	var registerUser RegisterUser

	// Bind the user data
	if err := c.ShouldBindJSON(&registerUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate confirm password
	if registerUser.Password != registerUser.ConfirmPassword {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Passwords do not match"})
		return
	}

	// Validate password
	if err := validatePassword(registerUser.Password); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if the username already exists
	_, err := models.GetUser(registerUser.Username)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
		return
	}

	// Hash the password
	hashedPassword, err := models.HashPassword(registerUser.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Create a User object
	user := models.User{
		Username:    registerUser.Username,
		Password:    hashedPassword,
		Email:       registerUser.Email,
		PhoneNumber: registerUser.PhoneNumber,
		Gender:      registerUser.Gender,
		FullName:    registerUser.FullName,
		Birthday:    registerUser.Birthday,
	}

	// Add the user to the database
	if err := models.AddUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User registered successfully"})
}

func Login(c *gin.Context) {
	var loginData models.Login
	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Authenticate the user with the database
	user, err := models.AuthenticateUser(loginData.Username, loginData.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}

	token, err := utils.GenerateToken(user.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token})
}

func Profile(c *gin.Context) {
	user, _ := c.Get("user")

	// Retrieve the full user profile from the database
	dbUser, err := models.GetUser(user.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":           dbUser.ID.Hex(), // Include user ID as string
			"username":     dbUser.Username,
			"full_name":    dbUser.FullName,
			"birthday":     dbUser.Birthday,
			"email":        dbUser.Email,
			"phone_number": dbUser.PhoneNumber,
			"gender":       dbUser.Gender,
			"couple_id":    dbUser.CoupleID, // Ensure couple_id is included
		},
	})
}

func GetPublicUserInfo(c *gin.Context) {
	username := c.Query("username") // Get the username from the query parameter

	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
		return
	}

	// Fetch user by username
	user, err := models.GetUserByUsername(username)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Return only public information
	c.JSON(http.StatusOK, gin.H{
		"full_name":    user.FullName,
		"username":     user.Username,
		"gender":       user.Gender,
		"birthday":     user.Birthday,
		"email":        user.Email,
		"phone_number": user.PhoneNumber,
	})
}

// UpdateProfile updates user profile information
func UpdateProfile(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var updateData struct {
		FullName string `json:"full_name"`
		Email    string `json:"email"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update user profile in database
	err := models.UpdateUserProfile(user.(string), updateData.FullName, updateData.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}

// ChangePassword changes user password
func ChangePassword(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var passwordData struct {
		OldPassword string `json:"old_password" binding:"required"`
		NewPassword string `json:"new_password" binding:"required,min=8"`
	}

	if err := c.ShouldBindJSON(&passwordData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate new password
	if err := validatePassword(passwordData.NewPassword); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Change password in database
	err := models.ChangeUserPassword(user.(string), passwordData.OldPassword, passwordData.NewPassword)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
}
