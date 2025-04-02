package main

import (
	"log"
	"net/http"

	"github.com/KevinChaves65/Project_Boo/routes"
	"github.com/KevinChaves65/Project_Boo/services"

	"github.com/gorilla/mux"
)

func main() {
	router := mux.NewRouter()
	routes.InitializeRoutes(router)

	go services.HandleMessages()

	log.Println("Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
