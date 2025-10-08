package services

import (
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

// Client struct to store connection and user info
type Client struct {
	Conn     *websocket.Conn
	Username string
	CoupleID string
}

var clients = make(map[*websocket.Conn]*Client)
var broadcast = make(chan Message)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// Message types
type MessageType string

const (
	ChatMessage MessageType = "chat_message"
	TypingStart MessageType = "typing_start"
	TypingStop  MessageType = "typing_stop"
	UserJoined  MessageType = "user_joined"
	UserLeft    MessageType = "user_left"
)

// Message struct
type Message struct {
	Type      MessageType `json:"type"`
	Sender    string      `json:"sender"`
	Content   string      `json:"content"`
	CoupleID  string      `json:"couple_id"`
	Timestamp int64       `json:"timestamp"`
}

// Handle WebSocket connections
func HandleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket Upgrade Error:", err)
		return
	}
	defer ws.Close()

	// Get user info from query parameters
	username := r.URL.Query().Get("username")
	coupleID := r.URL.Query().Get("couple_id")

	if username == "" || coupleID == "" {
		log.Println("Missing username or couple_id")
		return
	}

	// Create client
	client := &Client{
		Conn:     ws,
		Username: username,
		CoupleID: coupleID,
	}
	clients[ws] = client

	// Notify others that user joined
	joinMessage := Message{
		Type:      UserJoined,
		Sender:    username,
		CoupleID:  coupleID,
		Timestamp: time.Now().Unix(),
	}
	broadcast <- joinMessage

	log.Printf("User %s joined couple %s", username, coupleID)

	// Listen for messages
	for {
		var msg Message
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("WebSocket Read Error: %v", err)
			break
		}

		// Add metadata
		msg.Sender = username
		msg.CoupleID = coupleID
		msg.Timestamp = time.Now().Unix()

		// Broadcast message
		broadcast <- msg
	}

	// Clean up on disconnect
	delete(clients, ws)

	// Notify others that user left
	leftMessage := Message{
		Type:      UserLeft,
		Sender:    username,
		CoupleID:  coupleID,
		Timestamp: time.Now().Unix(),
	}
	broadcast <- leftMessage

	log.Printf("User %s left couple %s", username, coupleID)
}

// Broadcast messages to clients in the same couple
func HandleMessages() {
	for {
		msg := <-broadcast

		for client := range clients {
			// Only send to clients in the same couple
			if clients[client].CoupleID == msg.CoupleID {
				err := client.WriteJSON(msg)
				if err != nil {
					log.Printf("WebSocket Write Error: %v", err)
					client.Close()
					delete(clients, client)
				}
			}
		}
	}
}
