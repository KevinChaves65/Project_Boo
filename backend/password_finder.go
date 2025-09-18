package main

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	// The bcrypt hash from your database
	hash := "$2a$10$zouqFTue4VBjGAIfLimKTO3of3t1ug.Wic3wi9Kp9ASyRPDvrJuee"

	// Extended list of common passwords to test
	testPasswords := []string{
		// Basic passwords
		"password", "password123", "Password123", "Password123!",
		"12345678", "123456789", "1234567890",

		// User-specific passwords (based on john_doe)
		"john", "johndoe", "john123", "John123", "johndoe123",
		"johnDoe", "john_doe", "JohnDoe", "JohnDoe123", "JohnDoe123!",
		"doe", "Doe", "doe123", "Doe123",

		// Common variations
		"admin", "admin123", "Admin123", "Admin123!",
		"test", "test123", "Test123", "Test123!",
		"demo", "demo123", "Demo123", "Demo123!",
		"welcome", "Welcome123", "Welcome123!",
		"secret", "Secret123", "Secret123!",

		// Date-based (from birthday 1990-05-15)
		"19900515", "1990", "1990515", "05151990", "051590",
		"may1990", "May1990", "may15", "May15", "may151990",

		// Common patterns
		"qwerty", "qwerty123", "Qwerty123", "Qwerty123!",
		"abc123", "Abc123", "Abc123!",
		"letmein", "Letmein123", "Letmein123!",

		// Project-specific
		"heyboo", "HeyBoo", "heyboo123", "HeyBoo123", "HeyBoo123!",
		"boo", "Boo123", "Boo123!",
		"project", "Project123", "Project123!",

		// Default/Sample passwords
		"sample123", "Sample123", "Sample123!",
		"default123", "Default123", "Default123!",
		"user123", "User123", "User123!",
	}

	fmt.Println("Testing passwords against the bcrypt hash...")
	fmt.Println("Hash:", hash)
	fmt.Println("========================================")

	found := false
	for i, password := range testPasswords {
		err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
		if err == nil {
			fmt.Printf("🎉 MATCH FOUND! Password #%d: '%s'\n", i+1, password)
			fmt.Println("========================================")
			fmt.Printf("Username: john_doe\n")
			fmt.Printf("Password: %s\n", password)
			found = true
			break
		} else {
			fmt.Printf("❌ No match [%d/%d]: '%s'\n", i+1, len(testPasswords), password)
		}
	}

	if !found {
		fmt.Println("========================================")
		fmt.Println("❌ No matching password found in the test list.")
		fmt.Println("The original password might be:")
		fmt.Println("1. A custom password not in this list")
		fmt.Println("2. A randomly generated password")
		fmt.Println("3. A password with special characters or patterns not tested")
	}
}
