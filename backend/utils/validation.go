package utils

import "regexp"

// ValidateEmail validates the email format
func ValidateEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$`)
	return emailRegex.MatchString(email)
}

// ValidatePhoneNumber validates the phone number format
func ValidatePhoneNumber(phoneNumber string) bool {
	phoneRegex := regexp.MustCompile(`^\+?[1-9]\d{1,14}$`)
	return phoneRegex.MatchString(phoneNumber)
}

// ValidateGender validates the gender
func ValidateGender(gender string) bool {
	allowedGenders := map[string]bool{"male": true, "female": true, "other": true}
	return allowedGenders[gender]
}
