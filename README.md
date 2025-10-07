# Spanish Quest - Avatar Gallery

A full-stack application for creating and displaying student game avatars with unique powers, personalities, and abilities.

## Tech Stack

- **Backend**: Go with Gorilla Mux router
- **Database**: SQLite3
- **Frontend**: React 18 with Vite
- **Routing**: React Router DOM v6
- **Containerization**: Docker

## Features

- Randomly generated student avatars with unique attributes
- SQLite database for avatar persistence
- Beautiful gradient UI with responsive design
- RESTful API with Go
- Dockerized application ready to deploy

## Project Structure

```
.
├── main.go                 # Go server
├── go.mod                  # Go dependencies
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Docker Compose configuration
└── frontend/
    ├── src/
    │   ├── main.jsx        # React entry point
    │   ├── App.jsx         # Main app component
    │   └── pages/          # Page components
    ├── index.html
    ├── vite.config.js      # Vite configuration
    └── package.json        # Node dependencies
```

## Running with Docker (Recommended)

### Build and run with Docker Compose:

```bash
docker-compose up --build
```

The application will be available at `http://localhost:8080`

### Build and run with Docker:

```bash
# Build the image
docker build -t spanish-quest .

# Run the container
docker run -p 8080:8080 spanish-quest
```

## Running Locally (Development)

### Prerequisites

- Go 1.21 or higher
- Node.js 20 or higher
- SQLite3

### Backend Setup

```bash
# Install Go dependencies
go mod download

# Run the Go server
go run main.go
```

The server will start on `http://localhost:8080`

### Frontend Setup (in a separate terminal)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The Vite dev server will start on `http://localhost:5173` with API proxy to the Go backend.

### Build Frontend for Production

```bash
cd frontend
npm run build
```

This creates a `frontend/dist` directory that the Go server will serve.

## Avatar Attributes

Each avatar is randomly generated with the following attributes:

### Main Powers

- Fire 🔥, Water 💧, Electricity ⚡️, Earth 🌱, Wind 🌬️, Time 🕥, Light 🌞, Metal 🪨

### Super Powers

- Flying, Invisibility, Super strength, Reading minds, Super speed, Walking through walls

### Personalities

- Smart 🧠, Athletic 🏃, Creative 🖌️, Popular 👔

### Weaknesses

- Lazy, Forgetful, Clumsy, Distrustful

### Animal Allies & Mascots

- Water animals 🦈, Feline animals 🐺, Big animals 🦏, Air animals 🦅, Reptiles 🐊, Insects 🦂

## API Endpoints

- `GET /api/avatars` - Get all avatars with their complete attributes

## Routes

- `/` - Avatar gallery displaying all student avatars

## Database

The application uses SQLite with the following schema:

```sql
CREATE TABLE avatars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    coins INTEGER DEFAULT 0,
    main_power TEXT NOT NULL,
    super_power TEXT NOT NULL,
    personality TEXT NOT NULL,
    weakness TEXT NOT NULL,
    animal_ally TEXT NOT NULL,
    mascot TEXT NOT NULL
);
```

The database file (`data.db`) is created automatically on first run with 7 randomly generated avatars.

## Development Notes

- The Go server serves both the API (`/api/*`) and the React SPA
- In development, run both the Go server and Vite dev server separately
- In production (Docker), the built React app is served by the Go server
- The SPA handler ensures React Router works correctly with direct URL access

## License

MIT
