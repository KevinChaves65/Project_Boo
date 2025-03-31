package controllers

import (
	"encoding/json"
	"net/http"

	"github.com/KevinChaves65/Project_Boo/services"
)

func AddPhraseHandler(w http.ResponseWriter, r *http.Request) {
	var body struct {
		UserID string `json:"userId"`
		Text   string `json:"text"`
	}

	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil || len(body.Text) == 0 || len(body.Text) > 200 {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	phrase := services.AddPhrase(body.UserID, body.Text)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(phrase)
}

func GetPhrasesHandler(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("userId")
	if userId == "" {
		http.Error(w, "Missing userId", http.StatusBadRequest)
		return
	}

	phrases := services.GetPhrases(userId)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(phrases)
}

func DeletePhraseHandler(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	userId := r.URL.Query().Get("userId")

	if id == "" || userId == "" {
		http.Error(w, "Missing id or userId", http.StatusBadRequest)
		return
	}

	services.DeletePhrase(userId, id)
	w.WriteHeader(http.StatusNoContent)
}

func EditPhraseHandler(w http.ResponseWriter, r *http.Request) {
	var body struct {
		UserID string `json:"userId"`
		ID     string `json:"id"`
		Text   string `json:"text"`
	}

	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil || len(body.Text) == 0 || len(body.Text) > 200 {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	updated := services.EditPhrase(body.UserID, body.ID, body.Text)
	if updated == nil {
		http.Error(w, "Phrase not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updated)
}
