package services

import (
	"sync"

	"github.com/KevinChaves65/Project_Boo/models"
	"github.com/google/uuid"
)

var wordBank = make(map[string][]models.Phrase) // key = userId
var mu sync.Mutex

func AddPhrase(userId string, text string) models.Phrase {
	mu.Lock()
	defer mu.Unlock()

	newPhrase := models.Phrase{
		ID:     uuid.New().String(),
		UserID: userId,
		Text:   text,
	}

	wordBank[userId] = append(wordBank[userId], newPhrase)
	return newPhrase
}

func GetPhrases(userId string) []models.Phrase {
	mu.Lock()
	defer mu.Unlock()

	return wordBank[userId]
}
func DeletePhrase(userId, id string) {
	mu.Lock()
	defer mu.Unlock()

	list := wordBank[userId]
	for i, p := range list {
		if p.ID == id {
			wordBank[userId] = append(list[:i], list[i+1:]...)
			break
		}
	}
}

func EditPhrase(userId, id, newText string) *models.Phrase {
	mu.Lock()
	defer mu.Unlock()

	list := wordBank[userId]
	for i, p := range list {
		if p.ID == id {
			wordBank[userId][i].Text = newText
			return &wordBank[userId][i]
		}
	}
	return nil
}
