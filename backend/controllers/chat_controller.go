package controllers

import (
	"net/http"

	"github.com/KevinChaves65/Project_Boo/services"
)

// WebSocket handler function
func ChatHandler(w http.ResponseWriter, r *http.Request) {
	services.HandleConnections(w, r)
}
