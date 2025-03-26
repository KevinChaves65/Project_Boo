package config

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var db *mongo.Database

func ConnectDB() (*mongo.Client, error) {
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		log.Fatal("MONGO_URI is not set in the environment variables")
	}

	clientOptions := options.Client().ApplyURI(mongoURI).SetMaxPoolSize(20)
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := client.Ping(ctx, nil); err != nil {
		return nil, err
	}

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "auth_project" // Default database name if not specified
	}

	db = client.Database(dbName)
	log.Println("Connected to MongoDB successfully")
	return client, nil
}

func GetDB() *mongo.Database {
	if db == nil {
		log.Fatal("Database connection is not established")
	}
	return db
}
