FROM golang:1.24-alpine AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o server .

FROM alpine:latest

WORKDIR /root/

COPY --from=build /app/server .

EXPOSE 8080

# Run the binary
CMD ["./server"]