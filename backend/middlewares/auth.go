package middlewares

import (
	"net/http"

	"github.com/KevinChaves65/Project_Boo/utils"
	"github.com/gin-gonic/gin"
)

func JWTAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization token required"})
			c.Abort()
			return
		}

		// Ensure the token has the "Bearer " prefix
		if len(token) < 7 || token[:7] != "Bearer " {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
			c.Abort()
			return
		}

		token = token[7:] // Remove "Bearer " prefix
		parsedToken, err := utils.ParseToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Extract claims from the token
		claims, ok := parsedToken.Claims.(*utils.Claims)
		if !ok || !parsedToken.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		// Store the username in the context
		c.Set("user", claims.Username)
		c.Next()
	}
}
