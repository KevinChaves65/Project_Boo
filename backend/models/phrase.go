package models

import (
	"context"
	"log"

	"github.com/KevinChaves65/Project_Boo/config"
	"go.mongodb.org/mongo-driver/bson"
)

// WordTheme represents different styling themes for words
type WordTheme struct {
	ID         string `json:"id" bson:"_id"`
	ThemeName  string `json:"theme_name" bson:"theme_name"`
	FontColor  string `json:"font_color" bson:"font_color"`
	FontFamily string `json:"font_family" bson:"font_family"`
}

// WordBank represents words/phrases saved by couples with themes
type WordBank struct {
	ID       string `json:"id" bson:"_id"`
	CoupleID string `json:"couple_id" bson:"couple_id"`
	WordName string `json:"word_name" bson:"word_name"`
	ThemeID  string `json:"theme_id" bson:"theme_id"`
}

// GetAllWordThemes retrieves all available themes
func GetAllWordThemes() ([]WordTheme, error) {
	collection := config.GetDB().Collection("word_themes")
	cursor, err := collection.Find(context.TODO(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.TODO())

	var themes []WordTheme
	if err = cursor.All(context.TODO(), &themes); err != nil {
		return nil, err
	}
	return themes, nil
}

// SaveWordToBank saves a word with theme to couple's word bank
func SaveWordToBank(wordBank WordBank) error {
	collection := config.GetDB().Collection("word_bank")
	_, err := collection.InsertOne(context.TODO(), wordBank)
	return err
}

// GetWordBankByCoupleID retrieves all words for a couple
func GetWordBankByCoupleID(coupleID string) ([]WordBank, error) {
	collection := config.GetDB().Collection("word_bank")
	cursor, err := collection.Find(context.TODO(), bson.M{"couple_id": coupleID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.TODO())

	var wordBank []WordBank
	if err = cursor.All(context.TODO(), &wordBank); err != nil {
		return nil, err
	}
	return wordBank, nil
}

// DeleteWordFromBank removes a word from couple's word bank
func DeleteWordFromBank(coupleID string, wordID string) error {
	collection := config.GetDB().Collection("word_bank")
	_, err := collection.DeleteOne(context.TODO(), bson.M{
		"_id":       wordID,
		"couple_id": coupleID,
	})
	return err
}

// UpdateWordTheme updates the theme of a word in the word bank
func UpdateWordTheme(coupleID string, wordID string, newThemeID string) error {
	collection := config.GetDB().Collection("word_bank")
	_, err := collection.UpdateOne(
		context.TODO(),
		bson.M{"_id": wordID, "couple_id": coupleID},
		bson.M{"$set": bson.M{"theme_id": newThemeID}},
	)
	return err
}

// InitializeDefaultThemes creates default themes if they don't exist
func InitializeDefaultThemes() error {
	collection := config.GetDB().Collection("word_themes")

	defaultThemes := []WordTheme{
		{ID: "romantic", ThemeName: "Romantic", FontColor: "#ff69b4", FontFamily: "cursive"},
		{ID: "standard", ThemeName: "Standard", FontColor: "#333333", FontFamily: "inherit"},
		{ID: "creative", ThemeName: "Creative", FontColor: "#ff6b35", FontFamily: "fantasy"},
		{ID: "fluent", ThemeName: "Fluent", FontColor: "#4a90e2", FontFamily: "serif"},
		{ID: "formal", ThemeName: "Formal", FontColor: "#2c3e50", FontFamily: "serif"},
		{ID: "playful", ThemeName: "Playful", FontColor: "#9b59b6", FontFamily: "comic sans ms"},
		{ID: "elegant", ThemeName: "Elegant", FontColor: "#34495e", FontFamily: "Georgia"},
	}

	for _, theme := range defaultThemes {
		// Check if theme already exists
		count, err := collection.CountDocuments(context.TODO(), bson.M{"_id": theme.ID})
		if err != nil {
			log.Printf("Error checking theme existence: %v", err)
			continue
		}

		// Insert only if it doesn't exist
		if count == 0 {
			_, err := collection.InsertOne(context.TODO(), theme)
			if err != nil {
				log.Printf("Error inserting theme %s: %v", theme.ThemeName, err)
			}
		}
	}

	return nil
}
