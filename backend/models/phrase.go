package models

type Phrase struct {
	ID     string `json:"id"`
	UserID string `json:"userId"`
	Text   string `json:"text"`
}
