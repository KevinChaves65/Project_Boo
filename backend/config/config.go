package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Database

func ConnectDB() (*mongo.Client, error) {
	mongoURI := os.Getenv("MONGO_URI")
	dbName := os.Getenv("DB_NAME")

	// Debug logs (safe – does not expose secrets)
	log.Println("MONGO_URI exists:", mongoURI != "")
	log.Println("DB_NAME:", dbName)

	if mongoURI == "" {
		return nil, fmt.Errorf(" MONGO_URI is not set in environment variables")
	}

	if dbName == "" {
		dbName = "auth_project"
		log.Println(" DB_NAME not provided, using default:", dbName)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	clientOptions := options.Client().
		ApplyURI(mongoURI).
		SetMaxPoolSize(20).
		SetServerSelectionTimeout(10 * time.Second)

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, fmt.Errorf("Mongo connection error: %w", err)
	}

	// Ping to confirm live connection
	if err := client.Ping(ctx, nil); err != nil {
		return nil, fmt.Errorf("Mongo ping failed: %w", err)
	}

	DB = client.Database(dbName)
	log.Println("Connected to MongoDB successfully!")

	return client, nil
}

func GetDB() *mongo.Database {
	if DB == nil {
		log.Fatal("Database connection is not established")
	}
	return DB
}
