package routes

import (
	"github.com/KevinChaves65/Project_Boo/controllers"

	"github.com/gorilla/mux"
)

// InitializeRoutes sets up all API routes
func InitializeRoutes(router *mux.Router) {
	router.HandleFunc("/ws", controllers.ChatHandler)
	router.HandleFunc("/wordbank", controllers.AddPhraseHandler).Methods("POST")
	router.HandleFunc("/wordbank", controllers.GetPhrasesHandler).Methods("GET")
	router.HandleFunc("/wordbank", controllers.DeletePhraseHandler).Methods("DELETE")
	router.HandleFunc("/wordbank", controllers.EditPhraseHandler).Methods("PUT")
}
