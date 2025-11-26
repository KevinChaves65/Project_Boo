package config

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Database

func ConnectDB() {
	mongoURI := os.Getenv("MONGO_URI")
	dbName := os.Getenv("DB_NAME")

	if dbName == "" {
		dbName = "auth_project"
	}

	if mongoURI == "" {
		log.Fatal("MONGO_URI missing")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatalf("❌ Mongo connection error: %v", err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("❌ Mongo ping failed: %v", err)
	}

	DB = client.Database(dbName)
	log.Println("✅ MongoDB connected successfully")
}

func GetDB() *mongo.Database {
	if DB == nil {
		log.Fatal("❌ Database connection is not established")
	}
	return DB
}
