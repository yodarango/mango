.PHONY: help build run dev-backend dev-frontend docker-build docker-run docker-up docker-down clean

help:
	@echo "Available commands:"
	@echo "  make build         - Build the Go binary"
	@echo "  make run           - Run the Go server"
	@echo "  make dev-backend   - Run Go server in development"
	@echo "  make dev-frontend  - Run Vite dev server"
	@echo "  make docker-build  - Build Docker image"
	@echo "  make docker-run    - Run Docker container"
	@echo "  make docker-up     - Start with docker-compose"
	@echo "  make docker-down   - Stop docker-compose"
	@echo "  make clean         - Clean build artifacts"

build:
	go build -o server main.go

run: build
	./server

dev-backend:
	go run main.go

dev-frontend:
	cd frontend && npm run dev

docker-build:
	docker build -t spanish-quest .

docker-run:
	docker run -p 8080:8080 spanish-quest

docker-up:
	docker-compose up --build

docker-down:
	docker-compose down

clean:
	rm -f server
	rm -f *.db
	rm -rf frontend/dist
	rm -rf frontend/node_modules

