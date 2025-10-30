package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	_ "github.com/mattn/go-sqlite3"
)

type User struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Password string `json:"-"` // Never send password in JSON
	Role     string `json:"role"`
	Class 		int `json:"class"`
}

type Avatar struct {
	ID            int    `json:"id"`
	UserID        *int   `json:"userId,omitempty"`
	Name          string `json:"name"`
	AvatarName    string `json:"avatarName"`
	Thumbnail     string `json:"thumbnail"`
	Coins         int    `json:"coins"`
	Level         int    `json:"level"`
	RequiredLevel int    `json:"requiredLevel"`
	Element       string `json:"element"`
	SuperPower    string `json:"superPower"`
	Personality   string `json:"personality"`
	Weakness      string `json:"weakness"`
	AnimalAlly    string `json:"animalAlly"`
	Mascot        string `json:"mascot"`
	AssetCount    int    `json:"assetCount,omitempty"`
	TotalPower    int    `json:"totalPower,omitempty"`
	Rank          int    `json:"rank,omitempty"`
}

type Asset struct {
	ID            int    `json:"id"`
	AvatarID      int    `json:"avatarId"`
	Status        string `json:"status"` 
	Type          string `json:"type"` // this needs to change to what learngin they require like days of the week, months, etc) and just group them by name instead
	Name          string `json:"name"` // do not allow user to edit this 
	Thumbnail     string `json:"thumbnail"`
	Attack        int    `json:"attack"`
	Defense       int    `json:"defense"`
	Healing       int    `json:"healing"`
	Power         int    `json:"power"`
	Endurance     int    `json:"endurance"`
	Level         int    `json:"level"`
	RequiredLevel int    `json:"requiredLevel"`
	Cost          int    `json:"cost"`
	Ability       string `json:"ability"`
	Health        int    `json:"health"`
	Stamina       int    `json:"stamina"`
	Description   string `json:"description"`
}

type StoreItem struct {
	Type           string `json:"type"`
	Name           string `json:"name"`
	Thumbnail      string `json:"thumbnail"`
	Attack         int    `json:"attack"`
	Defense        int    `json:"defense"`
	Healing        int    `json:"healing"`
	Power          int    `json:"power"`
	Endurance      int    `json:"endurance"`
	Level          int    `json:"level"`
	RequiredLevel  int    `json:"requiredLevel"`
	Cost           int    `json:"cost"`
	Ability        string `json:"ability"`
	Health         int    `json:"health"`
	Stamina        int    `json:"stamina"`
	AvailableUnits int    `json:"availableUnits"`
	Description    string `json:"description"`
}

type LoginRequest struct {
	Name     string `json:"name"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type Claims struct {
	UserID int    `json:"userId"`
	Name   string `json:"name"`
	jwt.RegisteredClaims
}

type PurchaseRequest struct {
	AssetName string `json:"assetName"`
}

type PurchaseResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Coins   int    `json:"coins"`
}

type Notification struct {
	ID        int       `json:"id"`
	UserID    int       `json:"userId"`
	Title     string    `json:"title"`
	Message   string    `json:"message"`
	IsRead    bool      `json:"isRead"`
	CreatedAt time.Time `json:"createdAt"`
	ReadAt    *time.Time `json:"readAt,omitempty"`
}

type CreateNotificationRequest struct {
	UserIDs []int  `json:"userIds"` // Empty array or "all" means all students
	Title   string `json:"title"`
	Message string `json:"message"`
}

type Assignment struct {
	ID            int       `json:"id"`
	Coins         int       `json:"coins"`
	AssignmentID  string    `json:"assignmentId"`
	UserID        int       `json:"userId"`
	Completed     bool      `json:"completed"`
	Name          string    `json:"name"`
	DueDate       time.Time `json:"dueDate"`
	Path          string    `json:"path"`
	CoinsReceived int       `json:"coinsReceived"`
}

type Game struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Thumbnail string    `json:"thumbnail"`
	Rows      int       `json:"rows"`
	Columns   int       `json:"columns"`
	CreatedAt time.Time `json:"createdAt"`
}

type GameCell struct {
	ID          int    `json:"id"`
	GameID      int    `json:"gameId"`      // Foreign key to games table
	CellID      string `json:"cellId"`      // Chess-like ID (e.g., A1, B3, E5)
	Name        string `json:"name"`        // Display name for the cell
	Description string `json:"description"` // Description of what's in this cell
	Background  string `json:"background"`  // Color hex code or image URL
	Active      bool   `json:"active"`      // Whether the cell is active/playable
	Element     string `json:"element"`     // Terrain type or avatar element it belongs to
	OccupiedBy  int    `json:"occupiedBy"`  // Avatar ID of the player occupying this cell (0 if empty)
	Status      string `json:"status"`      // Status of the cell (max 20 chars)
}

type Battle struct {
	ID     int       `json:"id"`
	Name   string    `json:"name"`
	Reward string    `json:"reward"`
	Winner *int      `json:"winner,omitempty"`
	Date   time.Time `json:"date"`
	Status string    `json:"status"` // pending, in_progress, completed
}

type BattleQuestion struct {
	ID             int       `json:"id"`
	BattleID       int       `json:"battleId"`
	Question       string    `json:"question"`       // HTML content
	Answer         string    `json:"answer"`         // Correct answer
	UserID         *int      `json:"userId"`         // Avatar ID assigned to this question
	PossiblePoints int       `json:"possiblePoints"` // Maximum points for this question
	ReceivedScore  int       `json:"receivedScore"`  // Points awarded by admin
	Time           int       `json:"time"`           // Time to answer in seconds
	UserAnswer     *string   `json:"userAnswer"`     // User's submitted answer
	SubmittedAt    *string   `json:"submittedAt"`    // When user submitted
}

type CreateGameRequest struct {
	Name      string   `json:"name"`
	Thumbnail string   `json:"thumbnail"`
	Rows      int      `json:"rows"`
	Columns   int      `json:"columns"`
	AvatarIDs []int    `json:"avatarIds"` // Selected avatars for this game
}

var db *sql.DB
var jwtSecret = []byte("your-secret-key-change-this-in-production")

// WebSocket upgrader
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for development
	},
}

// WebSocket clients map (userID -> connection)
var clients = make(map[int]*websocket.Conn)
var clientsMutex sync.RWMutex

var (
	mainPowers    = []string{"Fire 🔥", "Water 💧", "Electricity ⚡️", "Earth 🌱", "Wind 🌬️", "Time 🕥", "Light 🌞", "Metal 🪨"}
	superPowers   = []string{"Flying", "Invisibility", "Super strength", "Reading minds", "Super speed", "Walking through walls"}
	personalities = []string{"Smart 🧠", "Athletic 🏃", "Creative 🖌️", "Popular 👔"}
	weaknesses    = []string{"Lazy", "Forgetful", "Clumsy", "Distrustful"}
	animalAllies  = []string{"Water animals 🦈", "Feline animals 🐺", "Big animals 🦏", "Air animals 🦅", "Reptiles 🐊", "Insects 🦂"}
	studentNames  = []string{"Carlos", "María", "Diego", "Sofia", "Miguel", "Isabella", "Alejandro", "Valentina", "Mateo", "Camila"}
	avatarNames   = []string{"El Fuego", "La Tormenta", "El Rayo", "La Tierra", "El Viento", "El Tiempo", "La Luz", "El Acero", "El Guardián", "La Sombra", "El Titán", "La Fénix", "El Dragón", "La Estrella", "El Conquistador", "La Reina", "El Guerrero", "La Valiente", "El Sabio", "La Mística"}
	warriorNames  = []string{"Thunder", "Shadow", "Blaze", "Storm", "Frost", "Viper", "Phoenix", "Dragon", "Wolf", "Eagle", "Titan", "Raven", "Cobra", "Hawk", "Panther", "Bear", "Lion", "Serpent", "Falcon", "Tiger"}
	abilities     = []string{"Fire Strike", "Ice Shield", "Lightning Bolt", "Earthquake", "Tornado Spin", "Time Freeze", "Healing Light", "Metal Armor", "Poison Attack", "Speed Boost", "Strength Surge", "Mind Control", "Invisibility Cloak", "Flight", "Teleportation"}
)

func initDB() {
	var err error

	// do not change this
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./data.db"
	}


	db, err = sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatal(err)
	}

	// Create users table
	createUsersTableSQL := `CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL UNIQUE,
		password TEXT NOT NULL,
		role TEXT NOT NULL
	);`

	_, err = db.Exec(createUsersTableSQL)
	if err != nil {
		log.Fatal(err)
	}

	createAvatarsTableSQL := `CREATE TABLE IF NOT EXISTS avatars (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER,
		name TEXT NOT NULL,
		avatar_name TEXT NOT NULL,
		thumbnail TEXT NOT NULL,
		coins INTEGER DEFAULT 0,
		level INTEGER DEFAULT 1,
		required_level INTEGER DEFAULT 0,
		element TEXT NOT NULL,
		super_power TEXT NOT NULL,
		personality TEXT NOT NULL,
		weakness TEXT NOT NULL,
		animal_ally TEXT NOT NULL,
		mascot TEXT NOT NULL,
		FOREIGN KEY (user_id) REFERENCES users(id)
	);`

	_, err = db.Exec(createAvatarsTableSQL)
	if err != nil {
		log.Fatal(err)
	}

	createAssetsTableSQL := `CREATE TABLE IF NOT EXISTS assets (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		avatar_id INTEGER,
		status TEXT NOT NULL,
		type TEXT CHECK(length(type) <= 10),
		name TEXT NOT NULL,
		thumbnail TEXT NOT NULL,
		attack INTEGER NOT NULL CHECK(attack <= 100),
		defense INTEGER NOT NULL CHECK(defense <= 100),
		healing INTEGER NOT NULL CHECK(healing <= 100),
		power INTEGER NOT NULL,
		endurance INTEGER NOT NULL CHECK(endurance <= 100),
		level INTEGER NOT NULL CHECK(level <= 100),
		required_level INTEGER DEFAULT 0,
		cost INTEGER NOT NULL,
		ability TEXT NOT NULL,
		health INTEGER NOT NULL,
		stamina INTEGER NOT NULL,
		description TEXT,
		FOREIGN KEY (avatar_id) REFERENCES avatars(id)
	);`

	_, err = db.Exec(createAssetsTableSQL)
	if err != nil {
		log.Fatal(err)
	}

	// Add type column if it doesn't exist (migration)
	_, err = db.Exec(`ALTER TABLE assets ADD COLUMN type TEXT CHECK(length(type) <= 10)`)
	if err != nil {
		// Column might already exist, which is fine
		// SQLite will error if column exists, but we can ignore it
	}

	// Remove available_units column if it exists (migration)
	// Note: SQLite doesn't support DROP COLUMN directly in older versions
	// We'll need to check if the column exists first
	var columnExists int
	err = db.QueryRow(`SELECT COUNT(*) FROM pragma_table_info('assets') WHERE name='available_units'`).Scan(&columnExists)
	if err == nil && columnExists > 0 {
		// SQLite doesn't support DROP COLUMN easily, so we need to recreate the table
		log.Println("Migrating assets table to remove available_units column...")

		// Create new table without available_units
		_, err = db.Exec(`CREATE TABLE assets_new (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			avatar_id INTEGER,
			status TEXT NOT NULL,
			type TEXT CHECK(length(type) <= 10),
			name TEXT NOT NULL,
			thumbnail TEXT NOT NULL,
			attack INTEGER NOT NULL CHECK(attack <= 100),
			defense INTEGER NOT NULL CHECK(defense <= 100),
			healing INTEGER NOT NULL CHECK(healing <= 100),
			power INTEGER NOT NULL,
			endurance INTEGER NOT NULL CHECK(endurance <= 100),
			level INTEGER NOT NULL CHECK(level <= 100),
			required_level INTEGER DEFAULT 0,
			cost INTEGER NOT NULL,
			ability TEXT NOT NULL,
			health INTEGER NOT NULL,
			stamina INTEGER NOT NULL,
			description TEXT,
			FOREIGN KEY (avatar_id) REFERENCES avatars(id)
		)`)
		if err != nil {
			log.Fatal(err)
		}

		// Copy data from old table to new table
		_, err = db.Exec(`INSERT INTO assets_new (id, avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina, description)
			SELECT id, avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina, description FROM assets`)
		if err != nil {
			log.Fatal(err)
		}

		// Drop old table
		_, err = db.Exec(`DROP TABLE assets`)
		if err != nil {
			log.Fatal(err)
		}

		// Rename new table to assets
		_, err = db.Exec(`ALTER TABLE assets_new RENAME TO assets`)
		if err != nil {
			log.Fatal(err)
		}

		log.Println("Migration completed successfully")
	}

	createNotificationsTableSQL := `CREATE TABLE IF NOT EXISTS notifications (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		title TEXT NOT NULL,
		message TEXT NOT NULL,
		is_read INTEGER DEFAULT 0,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		read_at DATETIME,
		FOREIGN KEY (user_id) REFERENCES users(id)
	);`

	_, err = db.Exec(createNotificationsTableSQL)
	if err != nil {
		log.Fatal(err)
	}

	createAssignmentsTableSQL := `CREATE TABLE IF NOT EXISTS assignments (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		coins INTEGER NOT NULL,
		assignment_id TEXT NOT NULL,
		user_id INTEGER NOT NULL,
		completed INTEGER DEFAULT 0,
		name TEXT NOT NULL,
		due_date DATETIME,
		path TEXT,
		coins_received INTEGER DEFAULT 0,
		FOREIGN KEY (user_id) REFERENCES users(id)
	);`

	_, err = db.Exec(createAssignmentsTableSQL)
	if err != nil {
		log.Fatal(err)
	}

	createGamesTableSQL := `CREATE TABLE IF NOT EXISTS games (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		thumbnail TEXT,
		rows INTEGER NOT NULL,
		columns INTEGER NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	_, err = db.Exec(createGamesTableSQL)
	if err != nil {
		log.Fatal(err)
	}

	createGameCellsTableSQL := `CREATE TABLE IF NOT EXISTS game_cells (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		game_id INTEGER NOT NULL,
		cell_id TEXT NOT NULL,
		name TEXT,
		description TEXT,
		background TEXT,
		active INTEGER DEFAULT 1,
		element TEXT,
		occupied_by INTEGER DEFAULT 0,
		status TEXT CHECK(length(status) <= 20),
		FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
	);`

	_, err = db.Exec(createGameCellsTableSQL)
	if err != nil {
		log.Fatal(err)
	}

	// Migration: Add new fields and remove old field from game_cells
	_, err = db.Exec(`ALTER TABLE game_cells ADD COLUMN occupied_by INTEGER DEFAULT 0`)
	if err != nil {
		// Column might already exist, which is fine
	}

	_, err = db.Exec(`ALTER TABLE game_cells ADD COLUMN status TEXT CHECK(length(status) <= 20)`)
	if err != nil {
		// Column might already exist, which is fine
	}

	// Check if is_occupied column exists and migrate data
	var gameCellsColumnExists int
	err = db.QueryRow(`SELECT COUNT(*) FROM pragma_table_info('game_cells') WHERE name='is_occupied'`).Scan(&gameCellsColumnExists)
	if err == nil && gameCellsColumnExists > 0 {
		log.Println("Migrating game_cells table to remove is_occupied column...")

		// Create new table without is_occupied
		_, err = db.Exec(`CREATE TABLE game_cells_new (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			game_id INTEGER NOT NULL,
			cell_id TEXT NOT NULL,
			name TEXT,
			description TEXT,
			background TEXT,
			active INTEGER DEFAULT 1,
			element TEXT,
			occupied_by INTEGER DEFAULT 0,
			status TEXT CHECK(length(status) <= 20),
			FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
		)`)
		if err != nil {
			log.Fatal(err)
		}

		// Copy data from old table to new table
		_, err = db.Exec(`INSERT INTO game_cells_new (id, game_id, cell_id, name, description, background, active, element, occupied_by, status)
			SELECT id, game_id, cell_id, name, description, background, active, element, occupied_by, status FROM game_cells`)
		if err != nil {
			log.Fatal(err)
		}

		// Drop old table
		_, err = db.Exec(`DROP TABLE game_cells`)
		if err != nil {
			log.Fatal(err)
		}

		// Rename new table to game_cells
		_, err = db.Exec(`ALTER TABLE game_cells_new RENAME TO game_cells`)
		if err != nil {
			log.Fatal(err)
		}

		log.Println("game_cells migration completed successfully")
	}

	// Create battles table
	createBattlesTableSQL := `CREATE TABLE IF NOT EXISTS battles (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		reward TEXT,
		winner INTEGER,
		date DATETIME DEFAULT CURRENT_TIMESTAMP,
		status TEXT DEFAULT 'pending',
		FOREIGN KEY (winner) REFERENCES avatars(id)
	);`

	_, err = db.Exec(createBattlesTableSQL)
	if err != nil {
		log.Fatal(err)
	}

	// Create battle_questions table
	createBattleQuestionsTableSQL := `CREATE TABLE IF NOT EXISTS battle_questions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		battle_id INTEGER NOT NULL,
		question TEXT NOT NULL,
		answer TEXT NOT NULL,
		user_id INTEGER DEFAULT NULL,
		possible_points INTEGER NOT NULL,
		received_score INTEGER DEFAULT 0,
		time INTEGER NOT NULL,
		user_answer TEXT DEFAULT NULL,
		submitted_at DATETIME DEFAULT NULL,
		FOREIGN KEY (battle_id) REFERENCES battles(id) ON DELETE CASCADE,
		FOREIGN KEY (user_id) REFERENCES avatars(id)
	);`

	_, err = db.Exec(createBattleQuestionsTableSQL)
	if err != nil {
		log.Fatal(err)
	}

	// Enable foreign keys
	_, err = db.Exec("PRAGMA foreign_keys = ON;")
	if err != nil {
		log.Fatal(err)
	}

	// Insert sample avatars if table is empty
	type AvatarData struct {
		Name        string
		Element     string
		SuperPower  string
		Personality string
		Weakness    string
		AnimalAlly  string
		Mascot      string
		MascotName  string
	}

	avatarData := []AvatarData{
		{"Eli", "Wind 🌬️", "Pass through walls", "Creative 🖌️", "Distractful", "Reptiles 🦎", "Crocodile 🐊", "Juni"},
		{"Anson", "Fire 🔥", "Super speed", "Smart 🧠", "Clumsy", "Big animals 🦏", "Rhino 🦏", "Judge"},
		{"Weston", "Electricity ⚡️", "Super strength", "Popular 😎", "Distractful", "Air animals 🦅", "Golden eagle 🦅", "Golden"},
		{"Dante", "Earth 🌱", "Read minds", "Athletic 💪", "Clumsy", "Air animals 🦅", "Golden eagle 🦅", "Nue Megumfushi"},
		{"Mica", "Metal 🪨", "Super strength", "Smart 🧠", "Forgetful", "Reptiles 🦎", "Komodo dragon 🐉", "Metal Man"},
		{"Kyler", "Water 💧", "Invisibility", "Creative 🖌️", "Lazy", "Insects 🦂", "Michigan Scorpions 🦂", "Scorpion Killer"},
		{"Mason", "Time 🕥", "Pass through walls", "Athletic 💪", "Forgetful", "Felines 🐱", "Attack 🐱", "KingsKrake"},
	}

	// Map element to image filename
	elementToImage := map[string]string{
		"Wind 🌬️":        "wind.webp",
		"Fire 🔥":         "fire.webp",
		"Electricity ⚡️": "electricity.webp",
		"Earth 🌱":        "earth.webp",
		"Metal 🪨":        "metal.webp",
		"Water 💧":        "water.webp",
		"Time 🕥":         "time.webp",
		"Light 🌞":        "light.webp",
	}

	var count int
	db.QueryRow("SELECT COUNT(*) FROM avatars").Scan(&count)
	if count == 0 {
		rand.Seed(time.Now().UnixNano())
		for i, data := range avatarData {
			imageFile := elementToImage[data.Element]
			thumbnail := fmt.Sprintf("/assets/avatars/%s", imageFile)
			level := rand.Intn(10) + 1

			result, err := db.Exec(`INSERT INTO avatars (name, avatar_name, thumbnail, coins, level, element, super_power, personality, weakness, animal_ally, mascot)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				data.Name, data.MascotName, thumbnail, 0, level, data.Element, data.SuperPower,
				data.Personality, data.Weakness, data.AnimalAlly, data.Mascot)
			if err != nil {
				log.Fatal(err)
			}

			// Get the avatar ID
			avatarID, _ := result.LastInsertId()
			_ = i // Suppress unused variable warning

			// Create 3 random warriors for this avatar
			for j := 0; j < 3; j++ {
				asset := generateRandomAsset(int(avatarID), "warrior")
				_, err = db.Exec(`INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, cost, ability, health, stamina)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					asset.AvatarID, asset.Status, asset.Type, asset.Name, asset.Thumbnail, asset.Attack, asset.Defense,
					asset.Healing, asset.Power, asset.Endurance, asset.Level, asset.Cost,
					asset.Ability, asset.Health, asset.Stamina)
				if err != nil {
					log.Fatal(err)
				}
			}

			// Create 1 mascot for this avatar
			mascot := generateRandomAsset(int(avatarID), "mascot")
			// Mascots have higher stats
			mascot.Attack = rand.Intn(50) + 50
			mascot.Defense = rand.Intn(50) + 50
			mascot.Healing = rand.Intn(50) + 50
			mascot.Endurance = rand.Intn(50) + 50
			mascot.Level = rand.Intn(5) + 5 // Level 5-10
			mascot.Cost = mascot.Level * 20

			_, err = db.Exec(`INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, cost, ability, health, stamina)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				mascot.AvatarID, mascot.Status, mascot.Type, mascot.Name, mascot.Thumbnail, mascot.Attack, mascot.Defense,
				mascot.Healing, mascot.Power, mascot.Endurance, mascot.Level, mascot.Cost,
				mascot.Ability, mascot.Health, mascot.Stamina)
			if err != nil {
				log.Fatal(err)
			}
		}
	}

	// Insert assignment records for users 4, 7, 5
	var assignmentCount int
	db.QueryRow("SELECT COUNT(*) FROM assignments").Scan(&assignmentCount)
	if assignmentCount == 0 {
		userIDs := []int{4, 7, 5}
		dueDate := time.Now().Add(7 * 24 * time.Hour) // Due in 7 days
		for _, userID := range userIDs {
			_, err := db.Exec(`INSERT INTO assignments (coins, assignment_id, user_id, completed, name, due_date, path)
				VALUES (?, ?, ?, ?, ?, ?, ?)`,
				120, "1000", userID, 0, "Numbers", dueDate, "/numbers")
			if err != nil {
				log.Printf("Error inserting assignment for user %d: %v", userID, err)
			}
		}
		log.Println("Inserted Numbers assignment records for users 4, 7, and 5")

		// Insert Subject Pronouns assignment for users 1, 2, 3, 6
		pronounUserIDs := []int{1, 2, 3, 6}
		pronounDueDate := time.Now().Add(7 * 24 * time.Hour) // Due in 7 days
		for _, userID := range pronounUserIDs {
			_, err := db.Exec(`INSERT INTO assignments (coins, assignment_id, user_id, completed, name, due_date, path)
				VALUES (?, ?, ?, ?, ?, ?, ?)`,
				120, "2000", userID, 0, "Subject Pronouns", pronounDueDate, "/subject-pronouns")
			if err != nil {
				log.Printf("Error inserting Subject Pronouns assignment for user %d: %v", userID, err)
			}
		}
		log.Println("Inserted Subject Pronouns assignment records for users 1, 2, 3, and 6")
	}
}

func generateRandomAvatar(name string) Avatar {
	animalAlly := animalAllies[rand.Intn(len(animalAllies))]
	// Generate a placeholder avatar image URL
	avatarNum := rand.Intn(70) + 1
	thumbnail := "https://i.pravatar.cc/300?img=" + fmt.Sprintf("%d", avatarNum)

	return Avatar{
		Name:        name,
		AvatarName:  avatarNames[rand.Intn(len(avatarNames))],
		Thumbnail:   thumbnail,
		Coins:       rand.Intn(100),
		Level:       rand.Intn(10) + 1, // Avatar level 1-10
		Element:     mainPowers[rand.Intn(len(mainPowers))],
		SuperPower:  superPowers[rand.Intn(len(superPowers))],
		Personality: personalities[rand.Intn(len(personalities))],
		Weakness:    weaknesses[rand.Intn(len(weaknesses))],
		AnimalAlly:  animalAlly,
		Mascot:      animalAlly,
	}
}

func generateRandomAsset(avatarID int, status string) Asset {
	level := rand.Intn(10) + 1
	maxHealth := 100
	maxStamina := 100

	// Generate a placeholder image URL
	imgNum := rand.Intn(70) + 1
	thumbnail := "https://i.pravatar.cc/300?img=" + fmt.Sprintf("%d", imgNum)

	// Generate a random type ID for grouping
	typeID := fmt.Sprintf("W%d", rand.Intn(1000))

	return Asset{
		AvatarID:  avatarID,
		Status:    status,
		Type:      typeID,
		Name:      warriorNames[rand.Intn(len(warriorNames))],
		Thumbnail: thumbnail,
		Attack:    rand.Intn(100) + 1,
		Defense:   rand.Intn(100) + 1,
		Healing:   rand.Intn(100) + 1,
		Power:     rand.Intn(500) + 100,
		Endurance: rand.Intn(100) + 1,
		Level:     level,
		Cost:      (level * 10) + rand.Intn(50),
		Ability:   abilities[rand.Intn(len(abilities))],
		Health:    maxHealth,
		Stamina:   maxStamina,
	}
}

func getAvatars(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query(`SELECT id, user_id, name, avatar_name, thumbnail, coins, level, element, super_power, personality, weakness, animal_ally, mascot
		FROM avatars ORDER BY id`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var avatars []Avatar
	for rows.Next() {
		var avatar Avatar
		if err := rows.Scan(&avatar.ID, &avatar.UserID, &avatar.Name, &avatar.AvatarName, &avatar.Thumbnail, &avatar.Coins, &avatar.Level, &avatar.Element,
			&avatar.SuperPower, &avatar.Personality, &avatar.Weakness,
			&avatar.AnimalAlly, &avatar.Mascot); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Get asset count
		var assetCount int
		db.QueryRow("SELECT COUNT(*) FROM assets WHERE avatar_id = ?", avatar.ID).Scan(&assetCount)
		avatar.AssetCount = assetCount

		// Calculate total power (avatar level + sum of all asset levels)
		var assetLevelSum int
		db.QueryRow("SELECT COALESCE(SUM(level), 0) FROM assets WHERE avatar_id = ?", avatar.ID).Scan(&assetLevelSum)
		avatar.TotalPower = avatar.Level + assetLevelSum

		avatars = append(avatars, avatar)
	}

	// Sort by total power (descending)
	for i := 0; i < len(avatars); i++ {
		for j := i + 1; j < len(avatars); j++ {
			if avatars[j].TotalPower > avatars[i].TotalPower {
				avatars[i], avatars[j] = avatars[j], avatars[i]
			}
		}
	}

	// Check if all avatars have the same power
	allSamePower := true
	if len(avatars) > 1 {
		firstPower := avatars[0].TotalPower
		for i := 1; i < len(avatars); i++ {
			if avatars[i].TotalPower != firstPower {
				allSamePower = false
				break
			}
		}
	}

	// Assign ranks only if there are different power levels
	if !allSamePower {
		for i := range avatars {
			avatars[i].Rank = i + 1
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(avatars)
}

func getAvatar(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var avatar Avatar
	err := db.QueryRow(`SELECT id, user_id, name, avatar_name, thumbnail, coins, level, element, super_power, personality, weakness, animal_ally, mascot
		FROM avatars WHERE id = ?`, id).Scan(&avatar.ID, &avatar.UserID, &avatar.Name, &avatar.AvatarName, &avatar.Thumbnail, &avatar.Coins, &avatar.Level, &avatar.Element,
		&avatar.SuperPower, &avatar.Personality, &avatar.Weakness, &avatar.AnimalAlly, &avatar.Mascot)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Avatar not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Get asset count
	var assetCount int
	db.QueryRow("SELECT COUNT(*) FROM assets WHERE avatar_id = ?", avatar.ID).Scan(&assetCount)
	avatar.AssetCount = assetCount

	// Calculate total power
	var assetLevelSum int
	db.QueryRow("SELECT COALESCE(SUM(level), 0) FROM assets WHERE avatar_id = ?", avatar.ID).Scan(&assetLevelSum)
	avatar.TotalPower = avatar.Level + assetLevelSum

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(avatar)
}

// Update an avatar (admin only)
func updateAvatar(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if user is admin
	var role string
	err = db.QueryRow("SELECT role FROM users WHERE id = ?", claims.UserID).Scan(&role)
	if err != nil || role != "admin" {
		http.Error(w, "Forbidden: Admin access required", http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	avatarID := vars["id"]

	var req Avatar
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Name == "" || req.AvatarName == "" {
		http.Error(w, "Name and AvatarName are required", http.StatusBadRequest)
		return
	}

	// Update avatar (excluding ID and user_id)
	_, err = db.Exec(`UPDATE avatars SET
		name = ?,
		avatar_name = ?,
		thumbnail = ?,
		coins = ?,
		level = ?,
		required_level = ?,
		element = ?,
		super_power = ?,
		personality = ?,
		weakness = ?,
		animal_ally = ?,
		mascot = ?
		WHERE id = ?`,
		req.Name, req.AvatarName, req.Thumbnail, req.Coins, req.Level, req.RequiredLevel,
		req.Element, req.SuperPower, req.Personality, req.Weakness, req.AnimalAlly, req.Mascot,
		avatarID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

func getAssets(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	avatarID := vars["id"]

	rows, err := db.Query(`SELECT id, avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina
		FROM assets WHERE avatar_id = ? ORDER BY status, level DESC`, avatarID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var assets []Asset
	for rows.Next() {
		var asset Asset
		if err := rows.Scan(&asset.ID, &asset.AvatarID, &asset.Status, &asset.Type, &asset.Name, &asset.Thumbnail,
			&asset.Attack, &asset.Defense, &asset.Healing, &asset.Power,
			&asset.Endurance, &asset.Level, &asset.RequiredLevel, &asset.Cost, &asset.Ability,
			&asset.Health, &asset.Stamina); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		assets = append(assets, asset)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(assets)
}

// Get a single asset by ID
func getAsset(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	assetID := vars["id"]

	var asset Asset
	err := db.QueryRow(`SELECT id, avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina
		FROM assets WHERE id = ?`, assetID).Scan(&asset.ID, &asset.AvatarID, &asset.Status, &asset.Type, &asset.Name, &asset.Thumbnail,
		&asset.Attack, &asset.Defense, &asset.Healing, &asset.Power,
		&asset.Endurance, &asset.Level, &asset.RequiredLevel, &asset.Cost, &asset.Ability,
		&asset.Health, &asset.Stamina)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Asset not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(asset)
}

func register(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	result, err := db.Exec("INSERT INTO users (name, password, role) VALUES (?, ?, ?)", req.Name, req.Password, "student")
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint failed") {
			http.Error(w, "User already exists", http.StatusConflict)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	userID, _ := result.LastInsertId()

	token, err := generateToken(int(userID), req.Name)
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	response := LoginResponse{
		Token: token,
		User: User{
			ID:   int(userID),
			Name: req.Name,
			Role: "student",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	var user User
	err := db.QueryRow("SELECT id, name, role FROM users WHERE LOWER(name) = LOWER(?) AND password = ?", req.Name, req.Password).Scan(&user.ID, &user.Name, &user.Role)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	token, err := generateToken(user.ID, user.Name)
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	response := LoginResponse{
		Token: token,
		User:  user,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func generateToken(userID int, name string) (string, error) {
	claims := Claims{
		UserID: userID,
		Name:   name,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func getUserFromToken(r *http.Request) (*Claims, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		log.Println("No authorization header found")
		return nil, fmt.Errorf("no authorization header")
	}

	tokenString := strings.Replace(authHeader, "Bearer ", "", 1)
	log.Printf("Token string (first 20 chars): %s...", tokenString[:min(20, len(tokenString))])

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		log.Printf("Error parsing token: %v", err)
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		log.Printf("Token valid for user ID: %d", claims.UserID)
		return claims, nil
	}

	log.Println("Invalid token claims")
	return nil, fmt.Errorf("invalid token")
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func purchaseAsset(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req PurchaseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Start transaction
	tx, err := db.Begin()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// Get user's avatar and coins
	var avatarID int
	var coins int
	err = tx.QueryRow("SELECT id, coins FROM avatars WHERE user_id = ?", claims.UserID).Scan(&avatarID, &coins)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "No avatar found for user", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Get asset details from the requested name
	var assetCost int
	var assetName string
	err = tx.QueryRow(`SELECT cost, name FROM assets WHERE name = ? AND avatar_id IS NULL AND status = 'store' LIMIT 1`, req.AssetName).Scan(&assetCost, &assetName)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Asset not found or out of stock", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Check if user has enough coins
	if coins < assetCost {
		response := PurchaseResponse{
			Success: false,
			Message: "Not enough coins",
			Coins:   coins,
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		return
	}

	// Find the first available asset of this name in the store
	var purchasedAssetID int
	err = tx.QueryRow(`SELECT id FROM assets WHERE name = ? AND avatar_id IS NULL AND status = 'store' LIMIT 1`, req.AssetName).Scan(&purchasedAssetID)
	if err != nil {
		if err == sql.ErrNoRows {
			response := PurchaseResponse{
				Success: false,
				Message: "Item is out of stock",
				Coins:   coins,
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(response)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Deduct coins
	newCoins := coins - assetCost
	_, err = tx.Exec("UPDATE avatars SET coins = ? WHERE id = ?", newCoins, avatarID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update the asset: assign it to the avatar and change status to warrior
	_, err = tx.Exec("UPDATE assets SET avatar_id = ?, status = 'warrior' WHERE id = ?", avatarID, purchasedAssetID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := PurchaseResponse{
		Success: true,
		Message: fmt.Sprintf("Successfully purchased %s", assetName),
		Coins:   newCoins,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func getStoreItems(w http.ResponseWriter, r *http.Request) {
	// Group by name and get one representative item per name with count
	rows, err := db.Query(`
		SELECT
			type,
			name,
			thumbnail,
			attack,
			defense,
			healing,
			power,
			endurance,
			level,
			required_level,
			cost,
			ability,
			health,
			stamina,
			COUNT(*) as available_units
		FROM assets
		WHERE status = 'store' AND avatar_id IS NULL
		GROUP BY name
		ORDER BY cost`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var items []StoreItem
	for rows.Next() {
		var item StoreItem
		if err := rows.Scan(&item.Type, &item.Name, &item.Thumbnail, &item.Attack, &item.Defense, &item.Healing,
			&item.Power, &item.Endurance, &item.Level, &item.RequiredLevel, &item.Cost, &item.Ability,
			&item.Health, &item.Stamina, &item.AvailableUnits); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		items = append(items, item)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

// Get all students (for admin)
func getStudents(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, name, role FROM users WHERE role = 'student' ORDER BY name")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var students []User
	for rows.Next() {
		var student User
		if err := rows.Scan(&student.ID, &student.Name, &student.Role); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		students = append(students, student)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(students)
}

// Create notifications (admin only)
func createNotifications(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if user is admin
	var role string
	err = db.QueryRow("SELECT role FROM users WHERE id = ?", claims.UserID).Scan(&role)
	if err != nil || role != "admin" {
		http.Error(w, "Forbidden: Admin access required", http.StatusForbidden)
		return
	}

	var req CreateNotificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Get target user IDs
	var targetUserIDs []int
	if len(req.UserIDs) == 0 {
		// Send to all students
		rows, err := db.Query("SELECT id FROM users WHERE role = 'student'")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var userID int
			if err := rows.Scan(&userID); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			targetUserIDs = append(targetUserIDs, userID)
		}
	} else {
		targetUserIDs = req.UserIDs
	}

	// Create notifications for each user
	for _, userID := range targetUserIDs {
		_, err := db.Exec("INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)",
			userID, req.Title, req.Message)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Send WebSocket notification
		notifyUser(userID, "new_notification", map[string]interface{}{
			"title":   req.Title,
			"message": req.Message,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": fmt.Sprintf("Notification sent to %d student(s)", len(targetUserIDs)),
		"count":   len(targetUserIDs),
	})
}

// Get user's notifications
func getNotifications(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := db.Query(`SELECT id, user_id, title, message, is_read, created_at, read_at
		FROM notifications WHERE user_id = ? ORDER BY created_at DESC`, claims.UserID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var notifications []Notification
	for rows.Next() {
		var notif Notification
		var isRead int
		var readAt sql.NullTime
		if err := rows.Scan(&notif.ID, &notif.UserID, &notif.Title, &notif.Message,
			&isRead, &notif.CreatedAt, &readAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		notif.IsRead = isRead == 1
		if readAt.Valid {
			notif.ReadAt = &readAt.Time
		}
		notifications = append(notifications, notif)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notifications)
}

// Get unread notification count
func getUnreadCount(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0", claims.UserID).Scan(&count)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int{"count": count})
}

// Get user's assignments
func getAssignments(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := db.Query(`SELECT id, coins, assignment_id, user_id, completed, name, due_date, path, coins_received
		FROM assignments WHERE user_id = ? ORDER BY due_date ASC`, claims.UserID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var assignments []Assignment
	for rows.Next() {
		var assignment Assignment
		var completed int
		var dueDate sql.NullTime
		var path sql.NullString
		var coinsReceived sql.NullInt64
		if err := rows.Scan(&assignment.ID, &assignment.Coins, &assignment.AssignmentID,
			&assignment.UserID, &completed, &assignment.Name, &dueDate, &path, &coinsReceived); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		assignment.Completed = completed == 1
		if dueDate.Valid {
			assignment.DueDate = dueDate.Time
		}
		if path.Valid {
			assignment.Path = path.String
		}
		if coinsReceived.Valid {
			assignment.CoinsReceived = int(coinsReceived.Int64)
		}
		assignments = append(assignments, assignment)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(assignments)
}

// Submit assignment and award coins
func submitAssignment(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		AssignmentID  string `json:"assignmentId"`
		CoinsReceived int    `json:"coinsReceived"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Start transaction
	tx, err := db.Begin()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// Get user's avatar ID
	var avatarID int
	err = tx.QueryRow("SELECT id FROM avatars WHERE user_id = ?", claims.UserID).Scan(&avatarID)
	if err != nil {
		http.Error(w, "Avatar not found", http.StatusNotFound)
		return
	}

	// Get current avatar coins
	var currentCoins int
	err = tx.QueryRow("SELECT coins FROM avatars WHERE id = ?", avatarID).Scan(&currentCoins)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update assignment as completed and set coins_received
	_, err = tx.Exec(`UPDATE assignments SET completed = 1, coins_received = ?
		WHERE assignment_id = ? AND user_id = ?`, req.CoinsReceived, req.AssignmentID, claims.UserID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Add coins to avatar
	newCoins := currentCoins + req.CoinsReceived
	_, err = tx.Exec("UPDATE avatars SET coins = ? WHERE id = ?", newCoins, avatarID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"success": true,
		"message": "Assignment submitted successfully",
		"coins":   newCoins,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Mark notification as read
func markNotificationRead(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	notifID := vars["id"]

	// Verify notification belongs to user
	var userID int
	err = db.QueryRow("SELECT user_id FROM notifications WHERE id = ?", notifID).Scan(&userID)
	if err != nil {
		http.Error(w, "Notification not found", http.StatusNotFound)
		return
	}

	if userID != claims.UserID {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	// Mark as read
	_, err = db.Exec("UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE id = ?", notifID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// Get all notifications with user info (admin only)
func getAllNotifications(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if user is admin
	var role string
	err = db.QueryRow("SELECT role FROM users WHERE id = ?", claims.UserID).Scan(&role)
	if err != nil || role != "admin" {
		http.Error(w, "Forbidden: Admin access required", http.StatusForbidden)
		return
	}

	type NotificationWithUser struct {
		ID        int        `json:"id"`
		UserID    int        `json:"userId"`
		UserName  string     `json:"userName"`
		Title     string     `json:"title"`
		Message   string     `json:"message"`
		IsRead    bool       `json:"isRead"`
		CreatedAt time.Time  `json:"createdAt"`
		ReadAt    *time.Time `json:"readAt,omitempty"`
	}

	rows, err := db.Query(`
		SELECT n.id, n.user_id, u.name, n.title, n.message, n.is_read, n.created_at, n.read_at
		FROM notifications n
		JOIN users u ON n.user_id = u.id
		ORDER BY n.created_at DESC
	`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var notifications []NotificationWithUser
	for rows.Next() {
		var notif NotificationWithUser
		var isRead int
		var readAt sql.NullTime
		if err := rows.Scan(&notif.ID, &notif.UserID, &notif.UserName, &notif.Title, &notif.Message,
			&isRead, &notif.CreatedAt, &readAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		notif.IsRead = isRead == 1
		if readAt.Valid {
			notif.ReadAt = &readAt.Time
		}
		notifications = append(notifications, notif)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notifications)
}

// Delete notification (admin only)
func deleteNotification(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if user is admin
	var role string
	err = db.QueryRow("SELECT role FROM users WHERE id = ?", claims.UserID).Scan(&role)
	if err != nil || role != "admin" {
		http.Error(w, "Forbidden: Admin access required", http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	notifID := vars["id"]

	result, err := db.Exec("DELETE FROM notifications WHERE id = ?", notifID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Notification not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// Create a new game with grid cells
func createGame(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if user is admin
	var role string
	err = db.QueryRow("SELECT role FROM users WHERE id = ?", claims.UserID).Scan(&role)
	if err != nil || role != "admin" {
		http.Error(w, "Forbidden: Admin access required", http.StatusForbidden)
		return
	}

	var req CreateGameRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Validate input
	if req.Rows < 1 || req.Rows > 100 || req.Columns < 1 || req.Columns > 100 {
		http.Error(w, "Rows and columns must be between 1 and 100", http.StatusBadRequest)
		return
	}

	// Create game
	result, err := db.Exec("INSERT INTO games (name, thumbnail, rows, columns) VALUES (?, ?, ?, ?)",
		req.Name, req.Thumbnail, req.Rows, req.Columns)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	gameID, _ := result.LastInsertId()

	// Generate grid cells (chess-like notation: A1, A2, B1, B2, etc.)
	// For rows > 26, use AA, AB, AC... (like Excel columns)
	for row := 0; row < req.Rows; row++ {
		var rowLetter string
		if row < 26 {
			rowLetter = string(rune('A' + row))
		} else {
			// For rows 26-51: AA, AB, AC... AZ
			// For rows 52-77: BA, BB, BC... BZ
			// etc.
			firstLetter := rune('A' + (row / 26) - 1)
			secondLetter := rune('A' + (row % 26))
			rowLetter = string(firstLetter) + string(secondLetter)
		}

		for col := 1; col <= req.Columns; col++ {
			cellID := fmt.Sprintf("%s%d", rowLetter, col)
			_, err := db.Exec(`INSERT INTO game_cells (game_id, cell_id, name, background, active, occupied_by)
				VALUES (?, ?, ?, ?, 1, 0)`,
				gameID, cellID, cellID, "#3a3a3a") // Default charcoal background
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"gameId":  gameID,
		"message": fmt.Sprintf("Game created with %d cells", req.Rows*req.Columns),
	})
}

// Get all games
func getGames(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, name, thumbnail, rows, columns, created_at FROM games ORDER BY created_at DESC")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var games []Game
	for rows.Next() {
		var game Game
		if err := rows.Scan(&game.ID, &game.Name, &game.Thumbnail, &game.Rows, &game.Columns, &game.CreatedAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		games = append(games, game)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(games)
}

// Get a specific game with all its cells
func getGame(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	gameID := vars["id"]

	var game Game
	err := db.QueryRow("SELECT id, name, thumbnail, rows, columns, created_at FROM games WHERE id = ?", gameID).
		Scan(&game.ID, &game.Name, &game.Thumbnail, &game.Rows, &game.Columns, &game.CreatedAt)
	if err != nil {
		http.Error(w, "Game not found", http.StatusNotFound)
		return
	}

	// Get all cells for this game
	rows, err := db.Query(`SELECT id, game_id, cell_id, name, description, background, active, element, occupied_by, status
		FROM game_cells WHERE game_id = ? ORDER BY cell_id`, gameID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var cells []GameCell
	for rows.Next() {
		var cell GameCell
		var active int
		var name, description, background, element, status sql.NullString
		var occupiedBy sql.NullInt64
		if err := rows.Scan(&cell.ID, &cell.GameID, &cell.CellID, &name, &description, &background,
			&active, &element, &occupiedBy, &status); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		cell.Active = active == 1
		if occupiedBy.Valid {
			cell.OccupiedBy = int(occupiedBy.Int64)
		}
		if name.Valid {
			cell.Name = name.String
		}
		if description.Valid {
			cell.Description = description.String
		}
		if background.Valid {
			cell.Background = background.String
		}
		if element.Valid {
			cell.Element = element.String
		}
		if status.Valid {
			cell.Status = status.String
		}
		cells = append(cells, cell)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"game":  game,
		"cells": cells,
	})
}

// Delete a game (cascades to delete all cells)
func deleteGame(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if user is admin
	var role string
	err = db.QueryRow("SELECT role FROM users WHERE id = ?", claims.UserID).Scan(&role)
	if err != nil || role != "admin" {
		http.Error(w, "Forbidden: Admin access required", http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	gameID := vars["id"]

	result, err := db.Exec("DELETE FROM games WHERE id = ?", gameID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Game not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// Update a game (name and thumbnail)
func updateGame(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if user is admin
	var role string
	err = db.QueryRow("SELECT role FROM users WHERE id = ?", claims.UserID).Scan(&role)
	if err != nil || role != "admin" {
		http.Error(w, "Forbidden: Admin access required", http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	gameID := vars["id"]

	var req struct {
		Name      string `json:"name"`
		Thumbnail string `json:"thumbnail"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Update game
	_, err = db.Exec(`UPDATE games SET name = ?, thumbnail = ? WHERE id = ?`,
		req.Name, req.Thumbnail, gameID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// Update a game cell
func updateGameCell(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if user is admin
	var role string
	err = db.QueryRow("SELECT role FROM users WHERE id = ?", claims.UserID).Scan(&role)
	if err != nil || role != "admin" {
		http.Error(w, "Forbidden: Admin access required", http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	cellID := vars["id"]

	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Background  string `json:"background"`
		Active      bool   `json:"active"`
		Element     string `json:"element"`
		OccupiedBy  int    `json:"occupiedBy"`
		Status      string `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Update cell
	activeInt := 0
	if req.Active {
		activeInt = 1
	}

	// Get the game_id for this cell
	var gameID int
	err = db.QueryRow("SELECT game_id FROM game_cells WHERE id = ?", cellID).Scan(&gameID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = db.Exec(`UPDATE game_cells
		SET name = ?, description = ?, background = ?, active = ?, element = ?, occupied_by = ?, status = ?
		WHERE id = ?`,
		req.Name, req.Description, req.Background, activeInt, req.Element, req.OccupiedBy, req.Status, cellID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Broadcast game update to all connected users
	broadcastGameUpdate(gameID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// Place warrior on cell (for players)
func placeWarriorOnCell(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	cellID := vars["id"]

	var req struct {
		WarriorID int `json:"warriorId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Verify the warrior belongs to the user's avatar
	var avatarID int
	err = db.QueryRow("SELECT id FROM avatars WHERE user_id = ?", claims.UserID).Scan(&avatarID)
	if err != nil {
		http.Error(w, "No avatar found for user", http.StatusNotFound)
		return
	}

	// Verify the warrior belongs to this avatar
	var warriorAvatarID int
	var warriorStatus string
	err = db.QueryRow("SELECT avatar_id, status FROM assets WHERE id = ?", req.WarriorID).Scan(&warriorAvatarID, &warriorStatus)
	if err != nil {
		http.Error(w, "Warrior not found", http.StatusNotFound)
		return
	}

	if warriorAvatarID != avatarID {
		http.Error(w, "This warrior does not belong to you", http.StatusForbidden)
		return
	}

	if warriorStatus != "warrior" {
		http.Error(w, "This asset is not a warrior", http.StatusBadRequest)
		return
	}

	// Check if cell is active and not occupied
	var cellActive int
	var cellOccupiedBy sql.NullInt64
	var gameID int
	err = db.QueryRow("SELECT active, occupied_by, game_id FROM game_cells WHERE id = ?", cellID).Scan(&cellActive, &cellOccupiedBy, &gameID)
	if err != nil {
		http.Error(w, "Cell not found", http.StatusNotFound)
		return
	}

	if cellActive != 1 {
		http.Error(w, "This cell is not active", http.StatusBadRequest)
		return
	}

	if cellOccupiedBy.Valid && cellOccupiedBy.Int64 != 0 {
		http.Error(w, "This cell is already occupied", http.StatusBadRequest)
		return
	}

	// Place warrior on cell
	_, err = db.Exec(`UPDATE game_cells SET occupied_by = ?, status = ? WHERE id = ?`,
		req.WarriorID, "warrior", cellID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Broadcast game update to all connected users
	broadcastGameUpdate(gameID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// Move warrior from one cell to another (for players)
func moveWarrior(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		FromCellID int `json:"fromCellId"`
		ToCellID   int `json:"toCellId"`
		WarriorID  int `json:"warriorId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Verify the warrior belongs to the user's avatar
	var avatarID int
	err = db.QueryRow("SELECT id FROM avatars WHERE user_id = ?", claims.UserID).Scan(&avatarID)
	if err != nil {
		http.Error(w, "No avatar found for user", http.StatusNotFound)
		return
	}

	// Verify the warrior belongs to this avatar
	var warriorAvatarID int
	err = db.QueryRow("SELECT avatar_id FROM assets WHERE id = ?", req.WarriorID).Scan(&warriorAvatarID)
	if err != nil {
		http.Error(w, "Warrior not found", http.StatusNotFound)
		return
	}

	if warriorAvatarID != avatarID {
		http.Error(w, "This warrior does not belong to you", http.StatusForbidden)
		return
	}

	// Verify the from cell has this warrior
	var fromCellOccupiedBy sql.NullInt64
	var fromGameID int
	err = db.QueryRow("SELECT occupied_by, game_id FROM game_cells WHERE id = ?", req.FromCellID).Scan(&fromCellOccupiedBy, &fromGameID)
	if err != nil {
		http.Error(w, "From cell not found", http.StatusNotFound)
		return
	}

	if !fromCellOccupiedBy.Valid || int(fromCellOccupiedBy.Int64) != req.WarriorID {
		http.Error(w, "Warrior is not in the from cell", http.StatusBadRequest)
		return
	}

	// Check if destination cell is active and not occupied
	var toCellActive int
	var toCellOccupiedBy sql.NullInt64
	var toGameID int
	err = db.QueryRow("SELECT active, occupied_by, game_id FROM game_cells WHERE id = ?", req.ToCellID).Scan(&toCellActive, &toCellOccupiedBy, &toGameID)
	if err != nil {
		http.Error(w, "Destination cell not found", http.StatusNotFound)
		return
	}

	if toCellActive != 1 {
		http.Error(w, "Destination cell is not active", http.StatusBadRequest)
		return
	}

	if toCellOccupiedBy.Valid && toCellOccupiedBy.Int64 != 0 {
		http.Error(w, "Destination cell is already occupied", http.StatusBadRequest)
		return
	}

	// Verify both cells are in the same game
	if fromGameID != toGameID {
		http.Error(w, "Cells must be in the same game", http.StatusBadRequest)
		return
	}

	// Clear the from cell
	_, err = db.Exec(`UPDATE game_cells SET occupied_by = NULL, status = '' WHERE id = ?`, req.FromCellID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Place warrior on destination cell
	_, err = db.Exec(`UPDATE game_cells SET occupied_by = ?, status = ? WHERE id = ?`,
		req.WarriorID, "warrior", req.ToCellID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Broadcast game update to all connected users
	broadcastGameUpdate(fromGameID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// Create a new battle with questions
func createBattle(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if user is admin
	var role string
	err = db.QueryRow("SELECT role FROM users WHERE id = ?", claims.UserID).Scan(&role)
	if err != nil || role != "admin" {
		http.Error(w, "Forbidden: Admin access required", http.StatusForbidden)
		return
	}

	var req struct {
		Name      string `json:"name"`
		Reward    string `json:"reward"`
		Questions []struct {
			Question       string `json:"question"`
			Answer         string `json:"answer"`
			PossiblePoints int    `json:"possiblePoints"`
			Time           int    `json:"time"`
		} `json:"questions"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Create battle
	result, err := db.Exec("INSERT INTO battles (name, reward, status) VALUES (?, ?, 'pending')",
		req.Name, req.Reward)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	battleID, _ := result.LastInsertId()

	// Create questions
	for _, q := range req.Questions {
		_, err := db.Exec(`INSERT INTO battle_questions
			(battle_id, question, answer, possible_points, time)
			VALUES (?, ?, ?, ?, ?)`,
			battleID, q.Question, q.Answer, q.PossiblePoints, q.Time)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"battleId": battleID,
	})
}

// Get all battles
func getBattles(w http.ResponseWriter, r *http.Request) {
	_, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := db.Query("SELECT id, name, reward, winner, date, status FROM battles ORDER BY date DESC")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var battles []Battle
	for rows.Next() {
		var b Battle
		err := rows.Scan(&b.ID, &b.Name, &b.Reward, &b.Winner, &b.Date, &b.Status)
		if err != nil {
			continue
		}
		battles = append(battles, b)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(battles)
}

// Get a specific battle with questions
func getBattle(w http.ResponseWriter, r *http.Request) {
	_, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	battleID := vars["id"]

	var battle Battle
	err = db.QueryRow("SELECT id, name, reward, winner, date, status FROM battles WHERE id = ?", battleID).
		Scan(&battle.ID, &battle.Name, &battle.Reward, &battle.Winner, &battle.Date, &battle.Status)
	if err != nil {
		http.Error(w, "Battle not found", http.StatusNotFound)
		return
	}

	// Get questions
	rows, err := db.Query(`SELECT id, battle_id, question, answer, user_id, possible_points,
		received_score, time, user_answer, submitted_at FROM battle_questions WHERE battle_id = ?`, battleID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var questions []BattleQuestion
	for rows.Next() {
		var q BattleQuestion
		err := rows.Scan(&q.ID, &q.BattleID, &q.Question, &q.Answer, &q.UserID,
			&q.PossiblePoints, &q.ReceivedScore, &q.Time, &q.UserAnswer, &q.SubmittedAt)
		if err != nil {
			continue
		}
		questions = append(questions, q)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"battle":    battle,
		"questions": questions,
	})
}

// Assign questions to avatars
func assignQuestions(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if user is admin
	var role string
	err = db.QueryRow("SELECT role FROM users WHERE id = ?", claims.UserID).Scan(&role)
	if err != nil || role != "admin" {
		http.Error(w, "Forbidden: Admin access required", http.StatusForbidden)
		return
	}

	var req struct {
		Assignments []struct {
			QuestionID int `json:"questionId"`
			AvatarID   int `json:"avatarId"`
		} `json:"assignments"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Update question assignments
	for _, a := range req.Assignments {
		_, err := db.Exec("UPDATE battle_questions SET user_id = ? WHERE id = ?",
			a.AvatarID, a.QuestionID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// Start battle (change status to in_progress)
func startBattle(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if user is admin
	var role string
	err = db.QueryRow("SELECT role FROM users WHERE id = ?", claims.UserID).Scan(&role)
	if err != nil || role != "admin" {
		http.Error(w, "Forbidden: Admin access required", http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	battleID := vars["id"]

	_, err = db.Exec("UPDATE battles SET status = 'in_progress' WHERE id = ?", battleID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// Stop battle (change status to completed)
func stopBattle(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if user is admin
	var role string
	err = db.QueryRow("SELECT role FROM users WHERE id = ?", claims.UserID).Scan(&role)
	if err != nil || role != "admin" {
		http.Error(w, "Forbidden: Admin access required", http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	battleID := vars["id"]

	_, err = db.Exec("UPDATE battles SET status = 'completed' WHERE id = ?", battleID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// Submit answer (for students)
func submitAnswer(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		QuestionID int    `json:"questionId"`
		Answer     string `json:"answer"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Get user's avatar ID
	var avatarID int
	err = db.QueryRow("SELECT id FROM avatars WHERE user_id = ?", claims.UserID).Scan(&avatarID)
	if err != nil {
		http.Error(w, "Avatar not found", http.StatusNotFound)
		return
	}

	// Submit answer
	_, err = db.Exec(`UPDATE battle_questions
		SET user_answer = ?, submitted_at = CURRENT_TIMESTAMP
		WHERE id = ? AND user_id = ?`,
		req.Answer, req.QuestionID, avatarID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// Grade answers (admin)
func gradeAnswers(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if user is admin
	var role string
	err = db.QueryRow("SELECT role FROM users WHERE id = ?", claims.UserID).Scan(&role)
	if err != nil || role != "admin" {
		http.Error(w, "Forbidden: Admin access required", http.StatusForbidden)
		return
	}

	var req struct {
		Grades []struct {
			QuestionID    int `json:"questionId"`
			ReceivedScore int `json:"receivedScore"`
		} `json:"grades"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Update scores
	for _, g := range req.Grades {
		_, err := db.Exec("UPDATE battle_questions SET received_score = ? WHERE id = ?",
			g.ReceivedScore, g.QuestionID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// Update a battle
func updateBattle(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if user is admin
	var role string
	err = db.QueryRow("SELECT role FROM users WHERE id = ?", claims.UserID).Scan(&role)
	if err != nil || role != "admin" {
		http.Error(w, "Forbidden: Admin access required", http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	battleID := vars["id"]

	var req struct {
		Name      string `json:"name"`
		Reward    string `json:"reward"`
		Questions []struct {
			ID             *int   `json:"id"`
			Question       string `json:"question"`
			Answer         string `json:"answer"`
			PossiblePoints int    `json:"possiblePoints"`
			Time           int    `json:"time"`
		} `json:"questions"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Update battle details
	_, err = db.Exec("UPDATE battles SET name = ?, reward = ? WHERE id = ?",
		req.Name, req.Reward, battleID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get existing question IDs
	rows, err := db.Query("SELECT id FROM battle_questions WHERE battle_id = ?", battleID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	existingIDs := make(map[int]bool)
	for rows.Next() {
		var id int
		rows.Scan(&id)
		existingIDs[id] = true
	}
	rows.Close()

	// Track which questions are in the update
	updatedIDs := make(map[int]bool)

	// Update or insert questions
	for _, q := range req.Questions {
		if q.ID != nil && *q.ID > 0 {
			// Update existing question
			_, err := db.Exec(`UPDATE battle_questions
				SET question = ?, answer = ?, possible_points = ?, time = ?
				WHERE id = ? AND battle_id = ?`,
				q.Question, q.Answer, q.PossiblePoints, q.Time, *q.ID, battleID)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			updatedIDs[*q.ID] = true
		} else {
			// Insert new question
			_, err := db.Exec(`INSERT INTO battle_questions
				(battle_id, question, answer, possible_points, time)
				VALUES (?, ?, ?, ?, ?)`,
				battleID, q.Question, q.Answer, q.PossiblePoints, q.Time)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}
	}

	// Delete questions that were removed
	for id := range existingIDs {
		if !updatedIDs[id] {
			_, err := db.Exec("DELETE FROM battle_questions WHERE id = ?", id)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// WebSocket handler
func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	// Get token from query parameter (WebSocket can't use Authorization header in browser)
	tokenString := r.URL.Query().Get("token")
	if tokenString == "" {
		log.Println("No token provided in WebSocket connection")
		http.Error(w, "Unauthorized: No token provided", http.StatusUnauthorized)
		return
	}

	// Parse and validate token
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		log.Println("Invalid token in WebSocket connection:", err)
		http.Error(w, "Unauthorized: Invalid token", http.StatusUnauthorized)
		return
	}

	claims, ok := token.Claims.(*Claims)
	if !ok {
		log.Println("Invalid claims in WebSocket token")
		http.Error(w, "Unauthorized: Invalid claims", http.StatusUnauthorized)
		return
	}

	// Upgrade connection
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}

	// Store connection
	clientsMutex.Lock()
	clients[claims.UserID] = conn
	clientsMutex.Unlock()

	log.Printf("WebSocket connected: User %d", claims.UserID)

	// Clean up on disconnect
	defer func() {
		clientsMutex.Lock()
		delete(clients, claims.UserID)
		clientsMutex.Unlock()
		conn.Close()
		log.Printf("WebSocket disconnected: User %d", claims.UserID)
	}()

	// Keep connection alive
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			break
		}
	}
}

// Broadcast notification to specific user
func notifyUser(userID int, notificationType string, data interface{}) {
	clientsMutex.RLock()
	conn, exists := clients[userID]
	clientsMutex.RUnlock()

	if !exists {
		return
	}

	message := map[string]interface{}{
		"type": notificationType,
		"data": data,
	}

	err := conn.WriteJSON(message)
	if err != nil {
		log.Printf("Error sending notification to user %d: %v", userID, err)
		clientsMutex.Lock()
		delete(clients, userID)
		clientsMutex.Unlock()
	}
}

// Broadcast to multiple users
func notifyUsers(userIDs []int, notificationType string, data interface{}) {
	for _, userID := range userIDs {
		notifyUser(userID, notificationType, data)
	}
}

// Broadcast game update to all connected users
func broadcastGameUpdate(gameID int) {
	clientsMutex.RLock()
	defer clientsMutex.RUnlock()

	message := map[string]interface{}{
		"type":   "game_update",
		"gameId": gameID,
	}

	messageJSON, err := json.Marshal(message)
	if err != nil {
		log.Println("Error marshaling game update:", err)
		return
	}

	for userID, conn := range clients {
		err := conn.WriteMessage(websocket.TextMessage, messageJSON)
		if err != nil {
			log.Printf("Error sending game update to user %d: %v", userID, err)
		}
	}
}

func main() {
	// Load environment variables from .env file
	godotenv.Load(".env")

	initDB()
	defer db.Close()

	router := mux.NewRouter()

	// API routes
	api := router.PathPrefix("/api").Subrouter()
	api.HandleFunc("/register", register).Methods("POST")
	api.HandleFunc("/login", login).Methods("POST")
	api.HandleFunc("/avatars", getAvatars).Methods("GET")
	api.HandleFunc("/avatars/{id}", getAvatar).Methods("GET")
	api.HandleFunc("/avatars/{id}", updateAvatar).Methods("PUT")
	api.HandleFunc("/avatars/{id}/assets", getAssets).Methods("GET")
	api.HandleFunc("/assets/{id}", getAsset).Methods("GET")
	api.HandleFunc("/store", getStoreItems).Methods("GET")
	api.HandleFunc("/store/purchase", purchaseAsset).Methods("POST")
	api.HandleFunc("/students", getStudents).Methods("GET")
	api.HandleFunc("/notifications", getNotifications).Methods("GET")
	api.HandleFunc("/notifications/unread-count", getUnreadCount).Methods("GET")
	api.HandleFunc("/notifications/create", createNotifications).Methods("POST")
	api.HandleFunc("/notifications/{id}/read", markNotificationRead).Methods("PUT")
	api.HandleFunc("/notifications/admin/all", getAllNotifications).Methods("GET")
	api.HandleFunc("/notifications/{id}", deleteNotification).Methods("DELETE")
	api.HandleFunc("/assignments", getAssignments).Methods("GET")
	api.HandleFunc("/assignments/submit", submitAssignment).Methods("POST")
	api.HandleFunc("/ws", handleWebSocket)
	api.HandleFunc("/games", getGames).Methods("GET")
	api.HandleFunc("/games/create", createGame).Methods("POST")
	api.HandleFunc("/games/{id}", getGame).Methods("GET")
	api.HandleFunc("/games/{id}", updateGame).Methods("PUT")
	api.HandleFunc("/games/{id}", deleteGame).Methods("DELETE")
	api.HandleFunc("/game-cells/{id}", updateGameCell).Methods("PUT")
	api.HandleFunc("/game-cells/{id}/place-warrior", placeWarriorOnCell).Methods("POST")
	api.HandleFunc("/game-cells/move-warrior", moveWarrior).Methods("POST")

	// Battle routes
	api.HandleFunc("/battles", getBattles).Methods("GET")
	api.HandleFunc("/battles/create", createBattle).Methods("POST")
	api.HandleFunc("/battles/{id}", getBattle).Methods("GET")
	api.HandleFunc("/battles/{id}", updateBattle).Methods("PUT")
	api.HandleFunc("/battles/{id}/assign", assignQuestions).Methods("POST")
	api.HandleFunc("/battles/{id}/start", startBattle).Methods("POST")
	api.HandleFunc("/battles/{id}/stop", stopBattle).Methods("POST")
	api.HandleFunc("/battles/submit-answer", submitAnswer).Methods("POST")
	api.HandleFunc("/battles/grade", gradeAnswers).Methods("POST")

	// Serve static files from the frontend build
	staticPath := os.Getenv("STATIC_PATH")
	if staticPath == "" {
		staticPath = "frontend/dist" // Default to production path
	}
	spa := spaHandler{staticPath: staticPath, indexPath: "index.html"}
	router.PathPrefix("/").Handler(spa)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8010"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}

// spaHandler implements the http.Handler interface for serving a SPA
type spaHandler struct {
	staticPath string
	indexPath  string
}

func (h spaHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	path := h.staticPath + r.URL.Path

	// Check if file exists
	if _, err := os.Stat(path); os.IsNotExist(err) {
		// File does not exist, serve index.html
		http.ServeFile(w, r, h.staticPath+"/"+h.indexPath)
		return
	}

	// Serve the file
	http.FileServer(http.Dir(h.staticPath)).ServeHTTP(w, r)
}
