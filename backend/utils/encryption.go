package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"io"
	"os"
)

func EncryptMessage(message string) (string, error) {
	encryptionKey := os.Getenv("ENCRYPTION_KEY")
	if encryptionKey == "" {
		return "", errors.New("ENCRYPTION_KEY is not set in the environment variables")
	}

	block, err := aes.NewCipher([]byte(encryptionKey))
	if err != nil {
		return "", err
	}

	ciphertext := make([]byte, aes.BlockSize+len(message))
	iv := ciphertext[:aes.BlockSize]
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return "", err
	}

	stream := cipher.NewCTR(block, iv)
	stream.XORKeyStream(ciphertext[aes.BlockSize:], []byte(message))

	return hex.EncodeToString(ciphertext), nil
}

func DecryptMessage(encryptedMessage string) (string, error) {
	encryptionKey := os.Getenv("ENCRYPTION_KEY")
	if encryptionKey == "" {
		return "", errors.New("ENCRYPTION_KEY is not set in the environment variables")
	}

	ciphertext, err := hex.DecodeString(encryptedMessage)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher([]byte(encryptionKey))
	if err != nil {
		return "", err
	}

	if len(ciphertext) < aes.BlockSize {
		return "", errors.New("ciphertext too short")
	}

	iv := ciphertext[:aes.BlockSize]
	ciphertext = ciphertext[aes.BlockSize:]

	stream := cipher.NewCTR(block, iv)
	stream.XORKeyStream(ciphertext, ciphertext)

	return string(ciphertext), nil
}
