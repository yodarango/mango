package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
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
	Class    *int   `json:"class,omitempty"`
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
	XP            int    `json:"xp"`
	XPRequired    int    `json:"xpRequired"`
	IsLocked      bool   `json:"isLocked"`
	IsLockedBy    *int   `json:"isLockedBy,omitempty"`
	IsUnlockedFor *int   `json:"isUnlockedFor,omitempty"`
	BaseAttack    int    `json:"baseAttack,omitempty"`
	BaseDefense   int    `json:"baseDefense,omitempty"`
	BaseHealing   int    `json:"baseHealing,omitempty"`
}

type StoreItem struct {
	ID             int    `json:"id"`
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
	IsLocked       bool   `json:"isLocked"`
	IsLockedBy     *int   `json:"isLockedBy,omitempty"`
	IsUnlockedFor  *int   `json:"isUnlockedFor,omitempty"`
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
	ID            int             `json:"id"`
	Coins         int             `json:"coins"`
	AssignmentID  string          `json:"assignmentId"`
	UserID        int             `json:"userId"`
	Completed     bool            `json:"completed"`
	Name          string          `json:"name"`
	DueDate       time.Time       `json:"dueDate"`
	CoinsReceived int             `json:"coinsReceived"`
	Data          json.RawMessage `json:"data,omitempty"`
	RetakeCount   int             `json:"retakeCount"`
}

// QuizQuestion represents a standardized quiz question structure
type QuizQuestion struct {
	ID          string      `json:"id"`                    // Random alphanumeric string
	Type        string      `json:"type"`                  // "multiple" or "input"
	Question    string      `json:"question"`              // Question text
	Answer      interface{} `json:"answer"`                // Array for multiple choice, string for input
	Correct     *int        `json:"correct"`               // Index of correct answer (null for input)
	CoinsWorth  int         `json:"coins_worth"`           // Coins awarded for correct answer
	TimeAlloted int         `json:"time_alloted"`          // Time limit in seconds
	UserAnswer  interface{} `json:"user_answer,omitempty"` // User's submitted answer
	IsCorrect   *bool       `json:"is_correct,omitempty"`  // Whether user got it right
}

type Game struct {
	ID               int        `json:"id"`
	Name             string     `json:"name"`
	Thumbnail        string     `json:"thumbnail"`
	Rows             int        `json:"rows"`
	Columns          int        `json:"columns"`
	CurrentTurnIndex int        `json:"currentTurnIndex"`
	TurnStartTime    *time.Time `json:"turnStartTime,omitempty"`
	TurnDuration     int        `json:"turnDuration"` // in seconds
	BattleID         *int       `json:"battleId,omitempty"`
	CreatedAt        time.Time  `json:"createdAt"`
	Avatars          []int      `json:"avatars,omitempty"` // Avatar IDs in turn order
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
	ID               int       `json:"id"`
	Name             string    `json:"name"`
	Reward           string    `json:"reward"`
	Winner           *int      `json:"winner,omitempty"`
	Date             time.Time `json:"date"`
	Status           string    `json:"status"`              // pending, in_progress, completed
	Attacker         *int      `json:"attacker,omitempty"`  // Asset ID of attacker
	Defender         *int      `json:"defender,omitempty"`  // Asset ID of defender
	AttackerAvatarID *int      `json:"attackerAvatarId,omitempty"` // Avatar ID of attacker
	DefenderAvatarID *int      `json:"defenderAvatarId,omitempty"` // Avatar ID of defender
	GameID           *int      `json:"gameId,omitempty"`    // Game ID this battle belongs to
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

	// Add xp column if it doesn't exist (migration)
	_, err = db.Exec(`ALTER TABLE assets ADD COLUMN xp INTEGER DEFAULT 0`)
	if err != nil {
		// Column might already exist, which is fine
		// SQLite will error if column exists, but we can ignore it
	}

	// Add xp_required column if it doesn't exist (migration)
	_, err = db.Exec(`ALTER TABLE assets ADD COLUMN xp_required INTEGER DEFAULT 100`)
	if err != nil {
		// Column might already exist, which is fine
		// SQLite will error if column exists, but we can ignore it
	}

	// Update all existing assets to have xp_required = 100 if NULL
	_, err = db.Exec(`UPDATE assets SET xp_required = 100 WHERE xp_required IS NULL`)
	if err != nil {
		// Log error but don't fail
		log.Printf("Warning: Could not update xp_required values: %v", err)
	}

	// Add is_locked_by column if it doesn't exist (migration)
	_, err = db.Exec(`ALTER TABLE assets ADD COLUMN is_locked_by INTEGER DEFAULT NULL`)
	if err != nil {
		// Column might already exist, which is fine
		// SQLite will error if column exists, but we can ignore it
	}

	// Add is_unlocked_for column if it doesn't exist (migration)
	_, err = db.Exec(`ALTER TABLE assets ADD COLUMN is_unlocked_for INTEGER DEFAULT NULL`)
	if err != nil {
		// Column might already exist, which is fine
		// SQLite will error if column exists, but we can ignore it
	}

	// Add base stat columns if they don't exist (migration)
	_, err = db.Exec(`ALTER TABLE assets ADD COLUMN base_attack INTEGER DEFAULT NULL`)
	if err != nil {
		// Column might already exist, which is fine
	}

	_, err = db.Exec(`ALTER TABLE assets ADD COLUMN base_defense INTEGER DEFAULT NULL`)
	if err != nil {
		// Column might already exist, which is fine
	}

	_, err = db.Exec(`ALTER TABLE assets ADD COLUMN base_healing INTEGER DEFAULT NULL`)
	if err != nil {
		// Column might already exist, which is fine
	}

	// Populate base stats for existing assets that don't have them
	// For existing assets, we'll reverse-calculate the base stats from current stats and level
	_, err = db.Exec(`UPDATE assets
		SET base_attack = CASE
			WHEN level = 1 THEN attack
			ELSE CAST(attack / (1.0 * level * level * level * level * level * level * level * level * level) AS INTEGER)
		END,
		base_defense = CASE
			WHEN level = 1 THEN defense
			ELSE CAST(defense / (1.0 * level * level * level * level * level * level * level * level * level) AS INTEGER)
		END,
		base_healing = CASE
			WHEN level = 1 THEN healing
			ELSE CAST(healing / (1.0 * level * level * level * level * level * level * level * level * level) AS INTEGER)
		END
		WHERE base_attack IS NULL OR base_defense IS NULL OR base_healing IS NULL`)
	if err != nil {
		log.Printf("Warning: Could not populate base stats: %v", err)
	}

	// Add is_locked column if it doesn't exist (migration)
	_, err = db.Exec(`ALTER TABLE assets ADD COLUMN is_locked INTEGER DEFAULT 0`)
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
		coins_received INTEGER DEFAULT 0,
		data TEXT,
		FOREIGN KEY (user_id) REFERENCES users(id)
	);`

	_, err = db.Exec(createAssignmentsTableSQL)
	if err != nil {
		log.Fatal(err)
	}

	// Add data column if it doesn't exist (for existing databases)
	_, err = db.Exec(`ALTER TABLE assignments ADD COLUMN data TEXT`)
	if err != nil && !strings.Contains(err.Error(), "duplicate column name") {
		log.Printf("Warning: Could not add data column: %v", err)
	}

	// Add retake_count column if it doesn't exist (for existing databases)
	_, err = db.Exec(`ALTER TABLE assignments ADD COLUMN retake_count INTEGER DEFAULT 0`)
	if err != nil && !strings.Contains(err.Error(), "duplicate column name") {
		log.Printf("Warning: Could not add retake_count column: %v", err)
	}

	createGamesTableSQL := `CREATE TABLE IF NOT EXISTS games (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		thumbnail TEXT,
		rows INTEGER NOT NULL,
		columns INTEGER NOT NULL,
		current_turn_index INTEGER DEFAULT 0,
		turn_start_time DATETIME,
		turn_duration INTEGER DEFAULT 20,
		battle_id INTEGER,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (battle_id) REFERENCES battles(id)
	);`

	_, err = db.Exec(createGamesTableSQL)
	if err != nil {
		log.Fatal(err)
	}

	// Add turn tracking columns if they don't exist (for existing databases)
	_, err = db.Exec(`ALTER TABLE games ADD COLUMN current_turn_index INTEGER DEFAULT 0`)
	if err != nil && !strings.Contains(err.Error(), "duplicate column name") {
		log.Printf("Warning: Could not add current_turn_index column: %v", err)
	}

	_, err = db.Exec(`ALTER TABLE games ADD COLUMN turn_start_time DATETIME`)
	if err != nil && !strings.Contains(err.Error(), "duplicate column name") {
		log.Printf("Warning: Could not add turn_start_time column: %v", err)
	}

	_, err = db.Exec(`ALTER TABLE games ADD COLUMN turn_duration INTEGER DEFAULT 20`)
	if err != nil && !strings.Contains(err.Error(), "duplicate column name") {
		log.Printf("Warning: Could not add turn_duration column: %v", err)
	}

	_, err = db.Exec(`ALTER TABLE games ADD COLUMN battle_id INTEGER`)
	if err != nil && !strings.Contains(err.Error(), "duplicate column name") {
		log.Printf("Warning: Could not add battle_id column: %v", err)
	}

	// Create game_avatars table for turn order
	createGameAvatarsTableSQL := `CREATE TABLE IF NOT EXISTS game_avatars (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		game_id INTEGER NOT NULL,
		avatar_id INTEGER NOT NULL,
		turn_order INTEGER NOT NULL,
		FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
		FOREIGN KEY (avatar_id) REFERENCES avatars(id)
	);`

	_, err = db.Exec(createGameAvatarsTableSQL)
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
		attacker INTEGER DEFAULT NULL,
		defender INTEGER DEFAULT NULL,
		FOREIGN KEY (winner) REFERENCES avatars(id),
		FOREIGN KEY (attacker) REFERENCES avatars(id),
		FOREIGN KEY (defender) REFERENCES avatars(id)
	);`

	_, err = db.Exec(createBattlesTableSQL)
	if err != nil {
		log.Fatal(err)
	}

	// Add attacker and defender columns to existing battles table (migration)
	_, err = db.Exec(`ALTER TABLE battles ADD COLUMN attacker INTEGER DEFAULT NULL`)
	if err != nil && !strings.Contains(err.Error(), "duplicate column name") {
		log.Printf("Warning: Could not add attacker column: %v", err)
	}

	_, err = db.Exec(`ALTER TABLE battles ADD COLUMN defender INTEGER DEFAULT NULL`)
	if err != nil && !strings.Contains(err.Error(), "duplicate column name") {
		log.Printf("Warning: Could not add defender column: %v", err)
	}

	// Add attacker_avatar_id and defender_avatar_id columns to battles table
	_, err = db.Exec(`ALTER TABLE battles ADD COLUMN attacker_avatar_id INTEGER DEFAULT NULL`)
	if err != nil && !strings.Contains(err.Error(), "duplicate column name") {
		log.Printf("Warning: Could not add attacker_avatar_id column: %v", err)
	}

	_, err = db.Exec(`ALTER TABLE battles ADD COLUMN defender_avatar_id INTEGER DEFAULT NULL`)
	if err != nil && !strings.Contains(err.Error(), "duplicate column name") {
		log.Printf("Warning: Could not add defender_avatar_id column: %v", err)
	}

	// Add game_id column to battles table
	_, err = db.Exec(`ALTER TABLE battles ADD COLUMN game_id INTEGER DEFAULT NULL`)
	if err != nil && !strings.Contains(err.Error(), "duplicate column name") {
		log.Printf("Warning: Could not add game_id column: %v", err)
	}

	// Create battle_questions table
	createBattleQuestionsTableSQL := `CREATE TABLE IF NOT EXISTS battle_questions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		battle_id INTEGER DEFAULT NULL,
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

	// Migrate battle_questions table to make battle_id nullable
	// Check if we need to migrate by checking the table schema
	var tableSchema string
	err = db.QueryRow(`SELECT sql FROM sqlite_master WHERE type='table' AND name='battle_questions'`).Scan(&tableSchema)
	if err == nil && strings.Contains(tableSchema, "battle_id INTEGER NOT NULL") {
		log.Println("Migrating battle_questions table to make battle_id nullable...")

		// Disable foreign keys temporarily
		_, err = db.Exec("PRAGMA foreign_keys = OFF;")
		if err != nil {
			log.Fatal("Failed to disable foreign keys:", err)
		}

		// SQLite doesn't support ALTER COLUMN, so we need to recreate the table
		_, err = db.Exec(`
			CREATE TABLE battle_questions_new (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				battle_id INTEGER DEFAULT NULL,
				question TEXT NOT NULL,
				answer TEXT NOT NULL,
				user_id INTEGER DEFAULT NULL,
				possible_points INTEGER NOT NULL,
				received_score INTEGER DEFAULT 0,
				time INTEGER NOT NULL,
				user_answer TEXT DEFAULT NULL,
				submitted_at DATETIME DEFAULT NULL
			)
		`)
		if err != nil {
			log.Fatal("Failed to create new battle_questions table:", err)
		}

		// Copy data from old table to new table
		_, err = db.Exec(`
			INSERT INTO battle_questions_new (id, battle_id, question, answer, user_id, possible_points, received_score, time, user_answer, submitted_at)
			SELECT id, battle_id, question, answer, user_id, possible_points, received_score, time, user_answer, submitted_at
			FROM battle_questions
		`)
		if err != nil {
			log.Fatal("Failed to copy data to new battle_questions table:", err)
		}

		// Drop old table
		_, err = db.Exec(`DROP TABLE battle_questions`)
		if err != nil {
			log.Fatal("Failed to drop old battle_questions table:", err)
		}

		// Rename new table to original name
		_, err = db.Exec(`ALTER TABLE battle_questions_new RENAME TO battle_questions`)
		if err != nil {
			log.Fatal("Failed to rename battle_questions_new table:", err)
		}

		log.Println("Migration completed successfully!")
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
				_, err = db.Exec(`INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, cost, ability, health, stamina, is_locked, base_attack, base_defense, base_healing)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					asset.AvatarID, asset.Status, asset.Type, asset.Name, asset.Thumbnail, asset.Attack, asset.Defense,
					asset.Healing, asset.Power, asset.Endurance, asset.Level, asset.Cost,
					asset.Ability, asset.Health, asset.Stamina, 0, asset.BaseAttack, asset.BaseDefense, asset.BaseHealing)
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
			mascot.BaseAttack = mascot.Attack
			mascot.BaseDefense = mascot.Defense
			mascot.BaseHealing = mascot.Healing
			mascot.Endurance = rand.Intn(50) + 50
			mascot.Level = rand.Intn(5) + 5 // Level 5-10
			mascot.Cost = mascot.Level * 20

			_, err = db.Exec(`INSERT INTO assets (avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, cost, ability, health, stamina, is_locked, base_attack, base_defense, base_healing)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				mascot.AvatarID, mascot.Status, mascot.Type, mascot.Name, mascot.Thumbnail, mascot.Attack, mascot.Defense,
				mascot.Healing, mascot.Power, mascot.Endurance, mascot.Level, mascot.Cost,
				mascot.Ability, mascot.Health, mascot.Stamina, 0, mascot.BaseAttack, mascot.BaseDefense, mascot.BaseHealing)
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
			_, err := db.Exec(`INSERT INTO assignments (coins, assignment_id, user_id, completed, name, due_date)
				VALUES (?, ?, ?, ?, ?, ?)`,
				120, "1000", userID, 0, "Numbers", dueDate)
			if err != nil {
				log.Printf("Error inserting assignment for user %d: %v", userID, err)
			}
		}
		log.Println("Inserted Numbers assignment records for users 4, 7, and 5")

		// Insert Subject Pronouns assignment for users 1, 2, 3, 6
		pronounUserIDs := []int{1, 2, 3, 6}
		pronounDueDate := time.Now().Add(7 * 24 * time.Hour) // Due in 7 days
		for _, userID := range pronounUserIDs {
			_, err := db.Exec(`INSERT INTO assignments (coins, assignment_id, user_id, completed, name, due_date)
				VALUES (?, ?, ?, ?, ?, ?)`,
				300, "2000", userID, 0, "Subject Pronouns", pronounDueDate)
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

	// Generate base stats
	baseAttack := rand.Intn(100) + 1
	baseDefense := rand.Intn(100) + 1
	baseHealing := rand.Intn(100) + 1

	return Asset{
		AvatarID:    avatarID,
		Status:      status,
		Type:        typeID,
		Name:        warriorNames[rand.Intn(len(warriorNames))],
		Thumbnail:   thumbnail,
		Attack:      baseAttack,
		Defense:     baseDefense,
		Healing:     baseHealing,
		BaseAttack:  baseAttack,
		BaseDefense: baseDefense,
		BaseHealing: baseHealing,
		Power:       rand.Intn(500) + 100,
		Endurance:   rand.Intn(100) + 1,
		Level:       level,
		Cost:        (level * 10) + rand.Intn(50),
		Ability:     abilities[rand.Intn(len(abilities))],
		Health:      maxHealth,
		Stamina:     maxStamina,
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

	rows, err := db.Query(`SELECT id, avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina, COALESCE(xp, 0), COALESCE(xp_required, 100), COALESCE(is_locked, 0), is_locked_by, is_unlocked_for
		FROM assets WHERE avatar_id = ? ORDER BY status, level DESC`, avatarID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var assets []Asset
	for rows.Next() {
		var asset Asset
		var isLockedInt int
		if err := rows.Scan(&asset.ID, &asset.AvatarID, &asset.Status, &asset.Type, &asset.Name, &asset.Thumbnail,
			&asset.Attack, &asset.Defense, &asset.Healing, &asset.Power,
			&asset.Endurance, &asset.Level, &asset.RequiredLevel, &asset.Cost, &asset.Ability,
			&asset.Health, &asset.Stamina, &asset.XP, &asset.XPRequired, &isLockedInt, &asset.IsLockedBy, &asset.IsUnlockedFor); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		asset.IsLocked = isLockedInt == 1
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
	var isLockedInt int
	err := db.QueryRow(`SELECT id, COALESCE(avatar_id, 0), status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina, COALESCE(xp, 0), COALESCE(xp_required, 100), COALESCE(is_locked, 0), COALESCE(is_locked_by, 0), COALESCE(is_unlocked_for, 0)
		FROM assets WHERE id = ?`, assetID).Scan(&asset.ID, &asset.AvatarID, &asset.Status, &asset.Type, &asset.Name, &asset.Thumbnail,
		&asset.Attack, &asset.Defense, &asset.Healing, &asset.Power,
		&asset.Endurance, &asset.Level, &asset.RequiredLevel, &asset.Cost, &asset.Ability,
		&asset.Health, &asset.Stamina, &asset.XP, &asset.XPRequired, &isLockedInt, &asset.IsLockedBy, &asset.IsUnlockedFor)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Asset not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	asset.IsLocked = isLockedInt == 1

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(asset)
}

// Get asset request details - returns asset with ownership context
func getAssetRequest(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	assetID := vars["id"]

	// Get asset details
	var asset Asset
	var isLockedInt int
	var avatarIDNullable *int
	var isLockedBy *int
	var isUnlockedFor *int

	err = db.QueryRow(`SELECT id, avatar_id, status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina, COALESCE(xp, 0), COALESCE(xp_required, 100), COALESCE(is_locked, 0), is_locked_by, is_unlocked_for
		FROM assets WHERE id = ?`, assetID).Scan(&asset.ID, &avatarIDNullable, &asset.Status, &asset.Type, &asset.Name, &asset.Thumbnail,
		&asset.Attack, &asset.Defense, &asset.Healing, &asset.Power,
		&asset.Endurance, &asset.Level, &asset.RequiredLevel, &asset.Cost, &asset.Ability,
		&asset.Health, &asset.Stamina, &asset.XP, &asset.XPRequired, &isLockedInt, &isLockedBy, &isUnlockedFor)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Asset not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	asset.IsLocked = isLockedInt == 1
	if avatarIDNullable != nil {
		asset.AvatarID = *avatarIDNullable
	}
	asset.IsLockedBy = isLockedBy
	asset.IsUnlockedFor = isUnlockedFor

	// Get current user's avatar ID
	var userAvatarID int
	err = db.QueryRow(`SELECT id FROM avatars WHERE user_id = ?`, claims.UserID).Scan(&userAvatarID)
	if err != nil {
		http.Error(w, "Could not find user avatar", http.StatusInternalServerError)
		return
	}

	// Determine the view type and get owner info if needed
	type AssetRequestResponse struct {
		Asset          Asset   `json:"asset"`
		ViewType       string  `json:"viewType"` // "approve_deny", "owned", "unlocked"
		OwnerName      *string `json:"ownerName,omitempty"`
		CanApprove     bool    `json:"canApprove"`
	}

	response := AssetRequestResponse{
		Asset:      asset,
		CanApprove: false,
	}

	// Case 1: Asset is locked by current user - show approve/deny form
	if isLockedBy != nil && *isLockedBy == userAvatarID {
		response.ViewType = "approve_deny"
		response.CanApprove = true
	} else if avatarIDNullable != nil && *avatarIDNullable > 0 {
		// Case 2: Asset belongs to someone - show owner info
		response.ViewType = "owned"

		// Get owner's avatar name
		var ownerName string
		err = db.QueryRow(`SELECT a.name FROM avatars a WHERE a.id = ?`, *avatarIDNullable).Scan(&ownerName)
		if err == nil {
			response.OwnerName = &ownerName
		}
	} else if avatarIDNullable == nil && (isLockedBy == nil || *isLockedBy == 0) {
		// Case 3: Asset is unlocked and available in store
		response.ViewType = "unlocked"
	} else {
		// Default case
		response.ViewType = "unlocked"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Request access to a clocked asset
func requestAssetAccess(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		AssetID int `json:"assetId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Get the asset details
	var asset Asset
	var isLockedInt int
	err = db.QueryRow(`SELECT id, COALESCE(avatar_id, 0), status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina, COALESCE(xp, 0), COALESCE(xp_required, 100), COALESCE(is_locked, 0), COALESCE(is_locked_by, 0), COALESCE(is_unlocked_for, 0)
		FROM assets WHERE id = ?`, req.AssetID).Scan(&asset.ID, &asset.AvatarID, &asset.Status, &asset.Type, &asset.Name, &asset.Thumbnail,
		&asset.Attack, &asset.Defense, &asset.Healing, &asset.Power,
		&asset.Endurance, &asset.Level, &asset.RequiredLevel, &asset.Cost, &asset.Ability,
		&asset.Health, &asset.Stamina, &asset.XP, &asset.XPRequired, &isLockedInt, &asset.IsLockedBy, &asset.IsUnlockedFor)

	if err != nil {
		fmt.Println(err)
		http.Error(w, "Asset not found", http.StatusNotFound)
		return
	}

	// Check if asset is locked by someone
	if asset.IsLockedBy == nil || *asset.IsLockedBy == 0 {
		http.Error(w, "Asset is not clocked by anyone", http.StatusBadRequest)
		return
	}

	// Get the requesting user's avatar name
	var requesterAvatarName string
	err = db.QueryRow(`SELECT a.name FROM avatars a WHERE a.user_id = ?`, claims.UserID).Scan(&requesterAvatarName)
	if err != nil {
		http.Error(w, "Could not find requester avatar", http.StatusInternalServerError)
		return
	}

	// Get the owner's user ID
	var ownerUserID int
	err = db.QueryRow(`SELECT a.user_id FROM avatars a WHERE a.id = ?`, *asset.IsLockedBy).Scan(&ownerUserID)
	if err != nil {
		http.Error(w, "Could not find asset owner", http.StatusInternalServerError)
		return
	}

	// Create notification for the owner
	title := "Asset Access Request"
	message := fmt.Sprintf("**%s** has requested access to purchase an asset from your kingdom **%s**.\n\n[View Asset Details](/assets/%d/request?requesterId=%d)",
		requesterAvatarName, asset.Name, asset.ID, claims.UserID)

	_, err = db.Exec("INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)",
		ownerUserID, title, message)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send WebSocket notification
	notifyUser(ownerUserID, "new_notification", map[string]interface{}{
		"title":   title,
		"message": message,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Access request sent successfully",
	})
}

// Approve asset access request
func approveAssetAccess(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	assetID := vars["id"]

	var req struct {
		RequesterID int `json:"requesterId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Get the asset and verify ownership
	var asset Asset
	var isLockedInt int
	err = db.QueryRow(`SELECT id, COALESCE(avatar_id, 0), status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina, COALESCE(xp, 0), COALESCE(xp_required, 100), COALESCE(is_locked, 0), COALESCE(is_locked_by, 0), COALESCE(is_unlocked_for, 0)
		FROM assets WHERE id = ?`, assetID).Scan(&asset.ID, &asset.AvatarID, &asset.Status, &asset.Type, &asset.Name, &asset.Thumbnail,
		&asset.Attack, &asset.Defense, &asset.Healing, &asset.Power,
		&asset.Endurance, &asset.Level, &asset.RequiredLevel, &asset.Cost, &asset.Ability,
		&asset.Health, &asset.Stamina, &asset.XP, &asset.XPRequired, &isLockedInt, &asset.IsLockedBy, &asset.IsUnlockedFor)

	if err != nil {
		http.Error(w, "Asset not found", http.StatusNotFound)
		return
	}

	// Verify the current user owns this asset (their avatar ID matches is_locked_by)
	var userAvatarID int
	err = db.QueryRow(`SELECT id FROM avatars WHERE user_id = ?`, claims.UserID).Scan(&userAvatarID)
	if err != nil {
		http.Error(w, "Could not find user avatar", http.StatusInternalServerError)
		return
	}

	if asset.IsLockedBy == nil || *asset.IsLockedBy != userAvatarID {
		http.Error(w, "You do not own this asset", http.StatusForbidden)
		return
	}

	// Get requester's avatar ID
	var requesterAvatarID int
	err = db.QueryRow(`SELECT id FROM avatars WHERE user_id = ?`, req.RequesterID).Scan(&requesterAvatarID)
	if err != nil {
		http.Error(w, "Could not find requester avatar", http.StatusInternalServerError)
		return
	}

	// Update asset to unlock for requester
	_, err = db.Exec(`UPDATE assets SET is_unlocked_for = ? WHERE id = ?`, requesterAvatarID, assetID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send notification to requester
	title := "Asset Access Approved"
	message := fmt.Sprintf("Your request to purchase **%s** has been approved! You can now purchase this asset from the store.", asset.Name)

	_, err = db.Exec("INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)",
		req.RequesterID, title, message)
	if err != nil {
		log.Printf("Error creating notification: %v", err)
	}

	// Send WebSocket notification
	notifyUser(req.RequesterID, "new_notification", map[string]interface{}{
		"title":   title,
		"message": message,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Access approved successfully",
	})
}

// Deny asset access request
func denyAssetAccess(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	assetID := vars["id"]

	var req struct {
		RequesterID int `json:"requesterId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Get the asset and verify ownership
	var asset Asset
	var isLockedInt int
	err = db.QueryRow(`SELECT id, COALESCE(avatar_id, 0), status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina, COALESCE(xp, 0), COALESCE(xp_required, 100), COALESCE(is_locked, 0), COALESCE(is_locked_by, 0), COALESCE(is_unlocked_for, 0)
		FROM assets WHERE id = ?`, assetID).Scan(&asset.ID, &asset.AvatarID, &asset.Status, &asset.Type, &asset.Name, &asset.Thumbnail,
		&asset.Attack, &asset.Defense, &asset.Healing, &asset.Power,
		&asset.Endurance, &asset.Level, &asset.RequiredLevel, &asset.Cost, &asset.Ability,
		&asset.Health, &asset.Stamina, &asset.XP, &asset.XPRequired, &isLockedInt, &asset.IsLockedBy, &asset.IsUnlockedFor)

	if err != nil {
		http.Error(w, "Asset not found", http.StatusNotFound)
		return
	}

	// Verify the current user owns this asset
	var userAvatarID int
	err = db.QueryRow(`SELECT id FROM avatars WHERE user_id = ?`, claims.UserID).Scan(&userAvatarID)
	if err != nil {
		http.Error(w, "Could not find user avatar", http.StatusInternalServerError)
		return
	}

	if asset.IsLockedBy == nil || *asset.IsLockedBy != userAvatarID {
		http.Error(w, "You do not own this asset", http.StatusForbidden)
		return
	}

	// Send notification to requester
	title := "Asset Access Denied"
	message := fmt.Sprintf("Your request to purchase **%s** has been denied.", asset.Name)

	_, err = db.Exec("INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)",
		req.RequesterID, title, message)
	if err != nil {
		log.Printf("Error creating notification: %v", err)
	}

	// Send WebSocket notification
	notifyUser(req.RequesterID, "new_notification", map[string]interface{}{
		"title":   title,
		"message": message,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Access denied",
	})
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
	var class sql.NullInt64
	err := db.QueryRow("SELECT id, name, role, class FROM users WHERE LOWER(name) = LOWER(?) AND password = ?", req.Name, req.Password).Scan(&user.ID, &user.Name, &user.Role, &class)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Convert sql.NullInt64 to *int
	if class.Valid {
		classValue := int(class.Int64)
		user.Class = &classValue
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
			// No expiration - token never expires
			IssuedAt: jwt.NewNumericDate(time.Now()),
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

	// Find an available asset of this name in the store
	// Priority: 1) Asset unlocked for this user, 2) Asset not locked by anyone
	var purchasedAssetID int
	var assetCost int
	var assetName string
	var isLockedBy *int
	var isUnlockedFor *int

	// First try to find an asset that is unlocked specifically for this user
	err = tx.QueryRow(`SELECT id, cost, name, is_locked_by, is_unlocked_for
		FROM assets
		WHERE name = ? AND avatar_id IS NULL AND status = 'store'
		AND (is_unlocked_for = ? OR is_unlocked_for IS NULL)
		LIMIT 1`, req.AssetName, avatarID).Scan(&purchasedAssetID, &assetCost, &assetName, &isLockedBy, &isUnlockedFor)

	if err == sql.ErrNoRows {
		// No asset unlocked for this user, try to find one that's not locked at all
		err = tx.QueryRow(`SELECT id, cost, name, is_locked_by, is_unlocked_for
			FROM assets
			WHERE name = ? AND avatar_id IS NULL AND status = 'store'
			AND (is_locked_by IS NULL OR is_locked_by = 0)
			LIMIT 1`, req.AssetName).Scan(&purchasedAssetID, &assetCost, &assetName, &isLockedBy, &isUnlockedFor)

		if err != nil {
			if err == sql.ErrNoRows {
				// Check if there are any assets of this name that are locked by others
				var lockedCount int
				tx.QueryRow(`SELECT COUNT(*) FROM assets WHERE name = ? AND avatar_id IS NULL AND status = 'store' AND is_locked_by != ?`, req.AssetName, avatarID).Scan(&lockedCount)

				if lockedCount > 0 {
					response := PurchaseResponse{
						Success: false,
						Message: "This asset is locked by another user. Request access to purchase it.",
						Coins:   coins,
					}
					w.Header().Set("Content-Type", "application/json")
					json.NewEncoder(w).Encode(response)
					return
				}

				http.Error(w, "Asset not found or out of stock", http.StatusNotFound)
			} else {
				http.Error(w, err.Error(), http.StatusInternalServerError)
			}
			return
		}
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
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

	// Deduct coins
	newCoins := coins - assetCost
	_, err = tx.Exec("UPDATE avatars SET coins = ? WHERE id = ?", newCoins, avatarID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update the asset: assign it to the avatar, change status to warrior, and reset clocking fields
	_, err = tx.Exec("UPDATE assets SET avatar_id = ?, status = 'warrior', is_locked_by = NULL, is_unlocked_for = NULL WHERE id = ?", avatarID, purchasedAssetID)
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
			MIN(id) as id,
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
			is_locked,
			MAX(is_locked_by) as is_locked_by,
			MAX(is_unlocked_for) as is_unlocked_for,
			COUNT(*) as available_units
		FROM assets
		WHERE status = 'store' AND avatar_id IS NULL
		GROUP BY name
		ORDER BY name`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var items []StoreItem
	for rows.Next() {
		var item StoreItem
		if err := rows.Scan(&item.ID, &item.Type, &item.Name, &item.Thumbnail, &item.Attack, &item.Defense, &item.Healing,
			&item.Power, &item.Endurance, &item.Level, &item.RequiredLevel, &item.Cost, &item.Ability,
			&item.Health, &item.Stamina, &item.IsLocked, &item.IsLockedBy, &item.IsUnlockedFor, &item.AvailableUnits); err != nil {
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
	rows, err := db.Query("SELECT id, name, role, class FROM users WHERE role = 'student' ORDER BY name")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var students []User
	for rows.Next() {
		var student User
		var class sql.NullInt64
		if err := rows.Scan(&student.ID, &student.Name, &student.Role, &class); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		// Convert sql.NullInt64 to *int
		if class.Valid {
			classValue := int(class.Int64)
			student.Class = &classValue
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

// Get streak for a user
func getStreak(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	userIDParam := vars["userId"]

	// Parse the userId parameter
	targetUserID, err := strconv.Atoi(userIDParam)
	if err != nil {
		http.Error(w, "Invalid userId parameter", http.StatusBadRequest)
		return
	}

	// Query all assignment_id = "1005" assignments ordered by due_date DESC
	rows, err := db.Query(`SELECT due_date, completed FROM assignments
		WHERE user_id = ? AND assignment_id = "1005"
		ORDER BY due_date DESC`, targetUserID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Collect all assignments
	type Assignment struct {
		DueDate   time.Time
		Completed bool
	}
	var assignments []Assignment

	for rows.Next() {
		var a Assignment
		var dueDate sql.NullTime
		var completed int

		err := rows.Scan(&dueDate, &completed)
		if err != nil {
			continue
		}

		if dueDate.Valid {
			a.DueDate = dueDate.Time
			a.Completed = completed == 1
			assignments = append(assignments, a)
		}
	}

	// If no assignments, streak is 0
	if len(assignments) == 0 {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"streak": "0 days"})
		return
	}

	// Count consecutive days from the most recent assignment until we hit an incomplete one
	streakDays := 0
	for _, assignment := range assignments {
		if !assignment.Completed {
			// Hit an incomplete assignment, stop counting
			break
		}
		streakDays++
	}

	// Format the response
	streakText := fmt.Sprintf("%d day", streakDays)
	if streakDays != 1 {
		streakText += "s"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"streak": streakText})
}

// Get user's assignments
func getAssignments(w http.ResponseWriter, r *http.Request) {

	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := db.Query(`SELECT id, coins, assignment_id, user_id, completed, name, due_date, coins_received, data, COALESCE(retake_count, 0)
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
		var coinsReceived sql.NullInt64
		var data sql.NullString
		var retakeCount sql.NullInt64
		if err := rows.Scan(&assignment.ID, &assignment.Coins, &assignment.AssignmentID,
			&assignment.UserID, &completed, &assignment.Name, &dueDate, &coinsReceived, &data, &retakeCount); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		assignment.Completed = completed == 1
		if dueDate.Valid {
			assignment.DueDate = dueDate.Time
		}
		if coinsReceived.Valid {
			assignment.CoinsReceived = int(coinsReceived.Int64)
		}
		if data.Valid && data.String != "" {
			assignment.Data = json.RawMessage(data.String)
		}
		if retakeCount.Valid {
			assignment.RetakeCount = int(retakeCount.Int64)
		}
		assignments = append(assignments, assignment)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(assignments)
}

// Create assignments for multiple users
func createAssignments(w http.ResponseWriter, r *http.Request) {
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
		Coins        int      `json:"coins"`
		AssignmentID string   `json:"assignmentId"`
		UserIDs      []int    `json:"userIds"`
		Name         string   `json:"name"`
		DueDate      string   `json:"dueDate"`
		Data         *string  `json:"data"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Coins <= 0 || req.AssignmentID == "" || req.Name == "" || req.DueDate == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	if len(req.UserIDs) == 0 {
		http.Error(w, "At least one user ID is required", http.StatusBadRequest)
		return
	}

	// Parse due date
	dueDate, err := time.Parse(time.RFC3339, req.DueDate)
	if err != nil {
		http.Error(w, "Invalid due date format", http.StatusBadRequest)
		return
	}

	// Start transaction
	tx, err := db.Begin()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// Insert assignment for each user
	for _, userID := range req.UserIDs {
		var dataValue interface{}
		if req.Data != nil && *req.Data != "" {
			dataValue = *req.Data
		} else {
			dataValue = nil
		}

		_, err := tx.Exec(`INSERT INTO assignments (coins, assignment_id, user_id, completed, name, due_date, coins_received, data)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			req.Coins, req.AssignmentID, userID, 0, req.Name, dueDate, 0, dataValue)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error creating assignment for user %d: %v", userID, err), http.StatusInternalServerError)
			return
		}
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": fmt.Sprintf("Successfully created assignments for %d students", len(req.UserIDs)),
	})
}

// Create daily vocabulary assignments
func createDailyVocabAssignments(w http.ResponseWriter, r *http.Request) {
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
		ClassNum  int    `json:"classNum"`
		WordCount int    `json:"wordCount"`
		WordWorth int    `json:"wordWorth"`
		WordType  string `json:"wordType"`
		Name      string `json:"name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Validate input
	if req.ClassNum != 2 && req.ClassNum != 3 {
		http.Error(w, "Invalid class number. Must be 2 or 3", http.StatusBadRequest)
		return
	}

	if req.WordType != "nouns" && req.WordType != "verbs" {
		http.Error(w, "Invalid word type. Must be 'nouns' or 'verbs'", http.StatusBadRequest)
		return
	}

	if req.WordCount < 1 || req.WordCount > 100 {
		http.Error(w, "Word count must be between 1 and 100", http.StatusBadRequest)
		return
	}

	// Determine vocab file path
	classFolder := "II"
	if req.ClassNum == 3 {
		classFolder = "III"
	}
	vocabFilePath := fmt.Sprintf("class_content/%s/daily_vocab_%s.json", classFolder, req.WordType)

	// Read vocab file
	vocabData, err := os.ReadFile(vocabFilePath)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error reading vocab file: %v", err), http.StatusInternalServerError)
		return
	}

	var vocabWords []map[string]interface{}
	if err := json.Unmarshal(vocabData, &vocabWords); err != nil {
		http.Error(w, fmt.Sprintf("Error parsing vocab file: %v", err), http.StatusInternalServerError)
		return
	}

	// Find the starting index (first word with used: null)
	startIndex := -1
	for i, word := range vocabWords {
		if word["used"] == nil {
			startIndex = i
			break
		}
	}

	if startIndex == -1 {
		http.Error(w, "No unused words available in vocab file", http.StatusBadRequest)
		return
	}

	// Check if we have enough words
	if startIndex+req.WordCount > len(vocabWords) {
		http.Error(w, fmt.Sprintf("Not enough unused words. Only %d words available", len(vocabWords)-startIndex), http.StatusBadRequest)
		return
	}

	// Get the words to use
	wordsToUse := vocabWords[startIndex : startIndex+req.WordCount]

	// Generate quiz data using standardized QuizQuestion struct
	quizData := make([]QuizQuestion, 0, req.WordCount)
	for _, word := range wordsToUse {
		engWord := word["eng"].(string)
		spaWord := word["spa"].(string)

		// Generate random alphanumeric ID
		questionID := generateRandomID(8)

		quizData = append(quizData, QuizQuestion{
			ID:          questionID,
			Type:        "input",
			Question:    fmt.Sprintf("How do you say '%s' in Spanish?", engWord),
			Answer:      spaWord, // String for input type
			Correct:     nil,     // Null for input type
			CoinsWorth:  req.WordWorth,
			TimeAlloted: 20,
		})
	}

	// Convert quiz data to JSON
	quizDataJSON, err := json.Marshal(quizData)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error creating quiz data: %v", err), http.StatusInternalServerError)
		return
	}

	// Get students in the class
	rows, err := db.Query("SELECT id FROM users WHERE class = ? AND role = 'student'", req.ClassNum)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error fetching students: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var studentIDs []int
	for rows.Next() {
		var studentID int
		if err := rows.Scan(&studentID); err != nil {
			http.Error(w, fmt.Sprintf("Error reading student data: %v", err), http.StatusInternalServerError)
			return
		}
		studentIDs = append(studentIDs, studentID)
	}

	if len(studentIDs) == 0 {
		http.Error(w, "No students found in the selected class", http.StatusBadRequest)
		return
	}

	// Set due date to today at 3pm
	now := time.Now()
	dueDate := time.Date(now.Year(), now.Month(), now.Day(), 15, 0, 0, 0, now.Location())

	// Calculate total coins
	totalCoins := req.WordCount * req.WordWorth

	// Start transaction
	tx, err := db.Begin()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// Insert assignment for each student
	for _, studentID := range studentIDs {
		_, err := tx.Exec(`INSERT INTO assignments (coins, assignment_id, user_id, completed, name, due_date, coins_received, data)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			totalCoins, "1005", studentID, 0, req.Name, dueDate, 0, string(quizDataJSON))
		if err != nil {
			http.Error(w, fmt.Sprintf("Error creating assignment for student %d: %v", studentID, err), http.StatusInternalServerError)
			return
		}
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update vocab file with today's date
	todayDate := now.Format("Jan 2, 2006")
	for i := startIndex; i < startIndex+req.WordCount; i++ {
		vocabWords[i]["used"] = todayDate
	}

	// Write updated vocab file
	updatedVocabData, err := json.MarshalIndent(vocabWords, "", "  ")
	if err != nil {
		// Log error but don't fail the request since assignments were created
		fmt.Printf("Error marshaling updated vocab data: %v\n", err)
	} else {
		if err := os.WriteFile(vocabFilePath, updatedVocabData, 0644); err != nil {
			// Log error but don't fail the request since assignments were created
			fmt.Printf("Error writing updated vocab file: %v\n", err)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":            true,
		"assignmentsCreated": len(studentIDs),
		"wordsUsed":          req.WordCount,
	})
}

// Helper function to generate random alphanumeric ID
func generateRandomID(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}

// Get single assignment by assignment_id for student
func getStudentAssignment(w http.ResponseWriter, r *http.Request) {
	_, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	assignmentID := vars["assignmentId"] // This is the assignment_id (e.g., "1005"), not the database id

	var assignment Assignment
	var completed int
	var dueDate sql.NullTime
	var coinsReceived sql.NullInt64
	var data sql.NullString
	var retakeCount sql.NullInt64

	// Fetch assignment by assignment_id and user_id
	err = db.QueryRow(`SELECT id, coins, assignment_id, user_id, completed, name, due_date, coins_received, data, COALESCE(retake_count, 0)
		FROM assignments WHERE id = ?`, assignmentID).Scan(&assignment.ID, &assignment.Coins, &assignment.AssignmentID,
		&assignment.UserID, &completed, &assignment.Name, &dueDate, &coinsReceived, &data, &retakeCount)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Assignment not found or access denied", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	assignment.Completed = completed == 1
	if dueDate.Valid {
		assignment.DueDate = dueDate.Time
	}
	if coinsReceived.Valid {
		assignment.CoinsReceived = int(coinsReceived.Int64)
	}
	if data.Valid && data.String != "" {
		assignment.Data = json.RawMessage(data.String)
	}
	if retakeCount.Valid {
		assignment.RetakeCount = int(retakeCount.Int64)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(assignment)
}

// Get all assignments (admin only)
func getAllAssignments(w http.ResponseWriter, r *http.Request) {
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

	rows, err := db.Query(`SELECT id, coins, assignment_id, user_id, completed, name, due_date, coins_received, data, COALESCE(retake_count, 0)
		FROM assignments ORDER BY due_date DESC`)
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
		var coinsReceived sql.NullInt64
		var data sql.NullString
		var retakeCount sql.NullInt64
		if err := rows.Scan(&assignment.ID, &assignment.Coins, &assignment.AssignmentID,
			&assignment.UserID, &completed, &assignment.Name, &dueDate, &coinsReceived, &data, &retakeCount); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		assignment.Completed = completed == 1
		if dueDate.Valid {
			assignment.DueDate = dueDate.Time
		}
		if coinsReceived.Valid {
			assignment.CoinsReceived = int(coinsReceived.Int64)
		}
		if data.Valid && data.String != "" {
			assignment.Data = json.RawMessage(data.String)
		}
		if retakeCount.Valid {
			assignment.RetakeCount = int(retakeCount.Int64)
		}
		assignments = append(assignments, assignment)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(assignments)
}

// Get assignment by ID (admin only)
func getAssignmentByID(w http.ResponseWriter, r *http.Request) {
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
	id := vars["id"]

	var assignment Assignment
	var completed int
	var dueDate sql.NullTime
	var coinsReceived sql.NullInt64
	var data sql.NullString
	var retakeCount sql.NullInt64

	err = db.QueryRow(`SELECT id, coins, assignment_id, user_id, completed, name, due_date, coins_received, data, COALESCE(retake_count, 0)
		FROM assignments WHERE id = ?`, id).Scan(&assignment.ID, &assignment.Coins, &assignment.AssignmentID,
		&assignment.UserID, &completed, &assignment.Name, &dueDate, &coinsReceived, &data, &retakeCount)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Assignment not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	assignment.Completed = completed == 1
	if dueDate.Valid {
		assignment.DueDate = dueDate.Time
	}
	if coinsReceived.Valid {
		assignment.CoinsReceived = int(coinsReceived.Int64)
	}
	if data.Valid && data.String != "" {
		assignment.Data = json.RawMessage(data.String)
	}
	if retakeCount.Valid {
		assignment.RetakeCount = int(retakeCount.Int64)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(assignment)
}

// Update assignment (admin only)
func updateAssignment(w http.ResponseWriter, r *http.Request) {
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
	id := vars["id"]

	var req struct {
		Name    string  `json:"name"`
		Coins   int     `json:"coins"`
		DueDate string  `json:"dueDate"`
		Data    *string `json:"data"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Parse due date
	dueDate, err := time.Parse(time.RFC3339, req.DueDate)
	if err != nil {
		http.Error(w, "Invalid due date format", http.StatusBadRequest)
		return
	}

	var dataValue interface{}
	if req.Data != nil && *req.Data != "" {
		dataValue = *req.Data
	} else {
		dataValue = nil
	}

	_, err = db.Exec(`UPDATE assignments SET name = ?, coins = ?, due_date = ?, data = ?
		WHERE id = ?`, req.Name, req.Coins, dueDate, dataValue, id)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// Bulk update assignment due dates (admin only)
func bulkUpdateAssignmentDueDates(w http.ResponseWriter, r *http.Request) {
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
		AssignmentIDs []int  `json:"assignmentIds"`
		DueDate       string `json:"dueDate"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if len(req.AssignmentIDs) == 0 {
		http.Error(w, "No assignment IDs provided", http.StatusBadRequest)
		return
	}

	// Parse due date
	dueDate, err := time.Parse(time.RFC3339, req.DueDate)
	if err != nil {
		http.Error(w, "Invalid due date format", http.StatusBadRequest)
		return
	}

	// Build query with placeholders
	placeholders := make([]string, len(req.AssignmentIDs))
	args := make([]interface{}, len(req.AssignmentIDs)+1)
	args[0] = dueDate

	for i, id := range req.AssignmentIDs {
		placeholders[i] = "?"
		args[i+1] = id
	}

	query := fmt.Sprintf("UPDATE assignments SET due_date = ? WHERE id IN (%s)",
		strings.Join(placeholders, ","))

	result, err := db.Exec(query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":      true,
		"rowsAffected": rowsAffected,
	})
}

// Delete assignment (admin only)
func deleteAssignment(w http.ResponseWriter, r *http.Request) {
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
	id := vars["id"]

	_, err = db.Exec("DELETE FROM assignments WHERE id = ?", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// Submit assignment and award coins
func submitAssignment(w http.ResponseWriter, r *http.Request) {
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		AssignmentID  int                      `json:"assignmentId"` // This is the database ID
		CoinsReceived int                      `json:"coinsReceived"`
		UserAnswers   []map[string]interface{} `json:"userAnswers,omitempty"`
		AssetID       *int                     `json:"assetId,omitempty"`
		XPGain        int                      `json:"xpGain,omitempty"`
		IsRetake      bool                     `json:"isRetake,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	log.Printf("Submit assignment request: user_id=%d, assignment_db_id=%d, coins=%d, asset_id=%v, xp_gain=%d, is_retake=%v",
		claims.UserID, req.AssignmentID, req.CoinsReceived, req.AssetID, req.XPGain, req.IsRetake)

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

	// Use the assignment database ID directly (no need to query)
	assignmentDBID := req.AssignmentID

	// Check if this is a retake and get assignment info
	var assignmentIDStr string
	var completed int
	var retakeCount sql.NullInt64
	err = tx.QueryRow(`SELECT assignment_id, completed, COALESCE(retake_count, 0) FROM assignments WHERE id = ?`,
		assignmentDBID).Scan(&assignmentIDStr, &completed, &retakeCount)
	if err != nil {
		http.Error(w, "Assignment not found", http.StatusNotFound)
		return
	}

	// Frontend already applies 20% reduction for retakes, so just use the values as-is
	actualCoinsReceived := req.CoinsReceived
	actualXPGain := req.XPGain
	if req.IsRetake && assignmentIDStr == "1005" {
		log.Printf("Retake detected for assignment 1005: using frontend-calculated rewards (coins: %d, xp: %d)",
			actualCoinsReceived, actualXPGain)
	}

	// If userAnswers are provided, update the assignment data with user answers
	if req.UserAnswers != nil && len(req.UserAnswers) > 0 {
		// Get current assignment data
		var currentData sql.NullString
		err = tx.QueryRow(`SELECT data FROM assignments WHERE id = ?`,
			assignmentDBID).Scan(&currentData)
		if err != nil {
			http.Error(w, "Assignment not found", http.StatusNotFound)
			return
		}

		// Parse existing data (quiz questions)
		var quizData []QuizQuestion
		if currentData.Valid && currentData.String != "" {
			if err := json.Unmarshal([]byte(currentData.String), &quizData); err != nil {
				http.Error(w, "Error parsing assignment data", http.StatusInternalServerError)
				return
			}
		}

		// Add user_answer and is_correct fields to each question
		for i := range quizData {
			// Find matching user answer by question ID
			for _, userAnswer := range req.UserAnswers {
				if userAnswerID, ok := userAnswer["questionId"]; ok {
					if quizData[i].ID == userAnswerID {
						quizData[i].UserAnswer = userAnswer["userAnswer"]
						if isCorrect, ok := userAnswer["isCorrect"].(bool); ok {
							quizData[i].IsCorrect = &isCorrect
						}
						break
					}
				}
			}
		}

		// Convert back to JSON
		updatedData, err := json.Marshal(quizData)
		if err != nil {
			http.Error(w, "Error encoding updated data", http.StatusInternalServerError)
			return
		}

		// Update assignment with new data, mark as completed, and set coins_received
		// If it's a retake, increment retake_count
		if req.IsRetake {
			newRetakeCount := 0
			if retakeCount.Valid {
				newRetakeCount = int(retakeCount.Int64) + 1
			} else {
				newRetakeCount = 1
			}
			_, err = tx.Exec(`UPDATE assignments SET completed = 1, coins_received = ?, data = ?, retake_count = ?
				WHERE id = ?`, actualCoinsReceived, string(updatedData), newRetakeCount, assignmentDBID)
		} else {
			_, err = tx.Exec(`UPDATE assignments SET completed = 1, coins_received = ?, data = ?
				WHERE id = ?`, actualCoinsReceived, string(updatedData), assignmentDBID)
		}
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		// No user answers provided, just mark as completed
		// If it's a retake, increment retake_count
		if req.IsRetake {
			newRetakeCount := 0
			if retakeCount.Valid {
				newRetakeCount = int(retakeCount.Int64) + 1
			} else {
				newRetakeCount = 1
			}
			_, err = tx.Exec(`UPDATE assignments SET completed = 1, coins_received = ?, retake_count = ?
				WHERE id = ?`, actualCoinsReceived, newRetakeCount, assignmentDBID)
		} else {
			_, err = tx.Exec(`UPDATE assignments SET completed = 1, coins_received = ?
				WHERE id = ?`, actualCoinsReceived, assignmentDBID)
		}
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Add coins to avatar (use actual coins after retake reduction)
	newCoins := currentCoins + actualCoinsReceived
	_, err = tx.Exec("UPDATE avatars SET coins = ? WHERE id = ?", newCoins, avatarID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Handle asset XP update if asset was selected (use actual XP after retake reduction)
	var assetLeveledUp bool
	var assetData map[string]interface{}
	if req.AssetID != nil && actualXPGain > 0 {
		// Get current asset data including base stats
		var currentXP, xpRequired, level, attack, defense, healing, cost int
		var baseAttack, baseDefense, baseHealing sql.NullInt64
		var name, thumbnail string
		err = tx.QueryRow(`SELECT COALESCE(xp, 0), COALESCE(xp_required, 100), level, attack, defense, healing, cost, name, thumbnail, base_attack, base_defense, base_healing
			FROM assets WHERE id = ? AND avatar_id = ?`, *req.AssetID, avatarID).Scan(&currentXP, &xpRequired, &level, &attack, &defense, &healing, &cost, &name, &thumbnail, &baseAttack, &baseDefense, &baseHealing)
		if err != nil {
			// Asset not found or doesn't belong to user - just log and continue
			log.Printf("Warning: Asset %d not found or doesn't belong to avatar %d: %v", *req.AssetID, avatarID, err)
		} else {
			// If base stats are not set, use current stats as base (for legacy assets)
			if !baseAttack.Valid {
				baseAttack.Int64 = int64(attack)
				baseAttack.Valid = true
			}
			if !baseDefense.Valid {
				baseDefense.Int64 = int64(defense)
				baseDefense.Valid = true
			}
			if !baseHealing.Valid {
				baseHealing.Int64 = int64(healing)
				baseHealing.Valid = true
			}

			// Add XP (use actual XP after retake reduction)
			newXP := currentXP + actualXPGain

			// Check if leveled up
			if newXP >= xpRequired {
				assetLeveledUp = true
				newLevel := level + 1

				// Calculate overage XP
				overageXP := newXP - xpRequired

				// NEW ALGORITHM: Linear progression with 3000 point cap
				// Each level adds a fixed amount of points, distributed evenly across 100 levels
				// Max gain per stat = 3000 points over 100 levels = 30 points per level
				pointsPerLevel := 30.0

				// Calculate new stats: base + (points per level * (level - 1))
				// Level 1 = base stats, Level 2 = base + 30, Level 3 = base + 60, etc.
				// At level 100: base + (30 * 99) = base + 2970 (just under 3000 cap)
				newAttack := int(baseAttack.Int64) + int(pointsPerLevel*float64(newLevel-1))
				newDefense := int(baseDefense.Int64) + int(pointsPerLevel*float64(newLevel-1))
				newHealing := int(baseHealing.Int64) + int(pointsPerLevel*float64(newLevel-1))

				// Ensure we don't exceed the 3000 point cap
				maxIncrease := 3000
				if newAttack > int(baseAttack.Int64)+maxIncrease {
					newAttack = int(baseAttack.Int64) + maxIncrease
				}
				if newDefense > int(baseDefense.Int64)+maxIncrease {
					newDefense = int(baseDefense.Int64) + maxIncrease
				}
				if newHealing > int(baseHealing.Int64)+maxIncrease {
					newHealing = int(baseHealing.Int64) + maxIncrease
				}

				newCost := cost * newLevel

				// Update asset with new level and stats, and ensure base stats are saved
				_, err = tx.Exec(`UPDATE assets SET level = ?, attack = ?, defense = ?, healing = ?, cost = ?, xp = ?, base_attack = ?, base_defense = ?, base_healing = ?
					WHERE id = ?`, newLevel, newAttack, newDefense, newHealing, newCost, overageXP, int(baseAttack.Int64), int(baseDefense.Int64), int(baseHealing.Int64), *req.AssetID)
				if err != nil {
					http.Error(w, fmt.Sprintf("Error leveling up asset: %v", err), http.StatusInternalServerError)
					return
				}

				// Prepare asset data for response
				assetData = map[string]interface{}{
					"name":       name,
					"thumbnail":  thumbnail,
					"oldLevel":   level,
					"newLevel":   newLevel,
					"oldAttack":  attack,
					"newAttack":  newAttack,
					"oldDefense": defense,
					"newDefense": newDefense,
					"oldHealing": healing,
					"newHealing": newHealing,
					"xpGained":   actualXPGain,
				}
			} else {
				// Just update XP and ensure base stats are saved
				_, err = tx.Exec(`UPDATE assets SET xp = ?, base_attack = ?, base_defense = ?, base_healing = ? WHERE id = ?`,
					newXP, int(baseAttack.Int64), int(baseDefense.Int64), int(baseHealing.Int64), *req.AssetID)
				if err != nil {
					http.Error(w, fmt.Sprintf("Error updating asset XP: %v", err), http.StatusInternalServerError)
					return
				}

				// Prepare asset data for response (no level up)
				assetData = map[string]interface{}{
					"name":      name,
					"thumbnail": thumbnail,
					"xpGained":  actualXPGain,
				}
			}
		}
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"success":        true,
		"message":        "Assignment submitted successfully",
		"coins":          newCoins,
		"assetLeveledUp": assetLeveledUp,
		"assetData":      assetData,
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

	// Create game with turn tracking initialized
	result, err := db.Exec("INSERT INTO games (name, thumbnail, rows, columns, current_turn_index, turn_start_time, turn_duration) VALUES (?, ?, ?, ?, 0, datetime('now'), 20)",
		req.Name, req.Thumbnail, req.Rows, req.Columns)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	gameID, _ := result.LastInsertId()

	// Store avatar IDs in turn order
	for i, avatarID := range req.AvatarIDs {
		_, err := db.Exec(`INSERT INTO game_avatars (game_id, avatar_id, turn_order) VALUES (?, ?, ?)`,
			gameID, avatarID, i)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

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
	var turnStartTime sql.NullTime
	var battleID sql.NullInt64
	err := db.QueryRow("SELECT id, name, thumbnail, rows, columns, current_turn_index, turn_start_time, turn_duration, battle_id, created_at FROM games WHERE id = ?", gameID).
		Scan(&game.ID, &game.Name, &game.Thumbnail, &game.Rows, &game.Columns, &game.CurrentTurnIndex, &turnStartTime, &game.TurnDuration, &battleID, &game.CreatedAt)
	if err != nil {
		http.Error(w, "Game not found", http.StatusNotFound)
		return
	}

	if turnStartTime.Valid {
		game.TurnStartTime = &turnStartTime.Time
	}

	if battleID.Valid {
		battleIDInt := int(battleID.Int64)
		game.BattleID = &battleIDInt
	}

	// Get avatar IDs in turn order
	avatarRows, err := db.Query(`SELECT avatar_id FROM game_avatars WHERE game_id = ? ORDER BY turn_order`, gameID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer avatarRows.Close()

	var avatars []int
	for avatarRows.Next() {
		var avatarID int
		if err := avatarRows.Scan(&avatarID); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		avatars = append(avatars, avatarID)
	}
	game.Avatars = avatars

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

	// Get battle details if game has a battle linked
	var battleResponse map[string]interface{}
	if game.BattleID != nil {
		var b Battle
		err = db.QueryRow("SELECT id, name, reward, winner, date, status, attacker, defender, attacker_avatar_id, defender_avatar_id FROM battles WHERE id = ?", *game.BattleID).
			Scan(&b.ID, &b.Name, &b.Reward, &b.Winner, &b.Date, &b.Status, &b.Attacker, &b.Defender, &b.AttackerAvatarID, &b.DefenderAvatarID)
		if err == nil {
			battleResponse = map[string]interface{}{
				"id":               b.ID,
				"name":             b.Name,
				"reward":           b.Reward,
				"winner":           b.Winner,
				"date":             b.Date,
				"status":           b.Status,
				"attacker":         b.Attacker,
				"defender":         b.Defender,
				"attackerAvatarId": b.AttackerAvatarID,
				"defenderAvatarId": b.DefenderAvatarID,
			}

			// Get attacker question
			if b.AttackerAvatarID != nil {
				var q BattleQuestion
				var submittedAt sql.NullTime
				var userAnswer sql.NullString
				err = db.QueryRow(`SELECT id, battle_id, question, answer, user_id, possible_points, received_score, time, user_answer, submitted_at
					FROM battle_questions
					WHERE user_id = ? AND battle_id = ?
					ORDER BY id ASC
					LIMIT 1`, *b.AttackerAvatarID, b.ID).
					Scan(&q.ID, &q.BattleID, &q.Question, &q.Answer, &q.UserID,
						&q.PossiblePoints, &q.ReceivedScore, &q.Time, &userAnswer, &submittedAt)
				if err == nil {
					if userAnswer.Valid {
						q.UserAnswer = &userAnswer.String
					}
					if submittedAt.Valid {
						submittedAtStr := submittedAt.Time.Format(time.RFC3339)
						q.SubmittedAt = &submittedAtStr
					}
					battleResponse["attackerQuestion"] = q
				}
			}

			// Get defender question
			if b.DefenderAvatarID != nil {
				var q BattleQuestion
				var submittedAt sql.NullTime
				var userAnswer sql.NullString
				err = db.QueryRow(`SELECT id, battle_id, question, answer, user_id, possible_points, received_score, time, user_answer, submitted_at
					FROM battle_questions
					WHERE user_id = ? AND battle_id = ?
					ORDER BY id ASC
					LIMIT 1`, *b.DefenderAvatarID, b.ID).
					Scan(&q.ID, &q.BattleID, &q.Question, &q.Answer, &q.UserID,
						&q.PossiblePoints, &q.ReceivedScore, &q.Time, &userAnswer, &submittedAt)
				if err == nil {
					if userAnswer.Valid {
						q.UserAnswer = &userAnswer.String
					}
					if submittedAt.Valid {
						submittedAtStr := submittedAt.Time.Format(time.RFC3339)
						q.SubmittedAt = &submittedAtStr
					}
					battleResponse["defenderQuestion"] = q
				}
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"game":   game,
		"cells":  cells,
		"battle": battleResponse,
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

// Advance to next turn (automatically called when timer expires or manually by admin)
func advanceTurn(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	gameID := vars["id"]

	// Get current turn info including turn start time and duration
	var currentTurnIndex, avatarCount, turnDuration int
	var turnStartTime *time.Time
	err := db.QueryRow("SELECT current_turn_index, turn_start_time, turn_duration FROM games WHERE id = ?", gameID).Scan(&currentTurnIndex, &turnStartTime, &turnDuration)
	if err != nil {
		http.Error(w, "Game not found", http.StatusNotFound)
		return
	}

	// Validate that enough time has elapsed before advancing
	// This prevents race conditions where multiple clients try to advance simultaneously
	if turnStartTime != nil {
		elapsed := time.Since(*turnStartTime).Seconds()
		// Only advance if at least 90% of the turn duration has elapsed (18 seconds for a 20-second turn)
		// This prevents premature advances while allowing advances when timer shows 0
		minElapsed := float64(turnDuration) * 0.90
		if elapsed < minElapsed {
			// Turn is not ready to advance yet - silently return success to avoid errors
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": true,
				"message": "Turn not ready to advance yet",
				"elapsed": elapsed,
				"required": minElapsed,
			})
			return
		}
	}

	// Get total number of avatars in this game
	err = db.QueryRow("SELECT COUNT(*) FROM game_avatars WHERE game_id = ?", gameID).Scan(&avatarCount)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if avatarCount == 0 {
		http.Error(w, "No avatars in game", http.StatusBadRequest)
		return
	}

	// Calculate next turn index (wrap around)
	nextTurnIndex := (currentTurnIndex + 1) % avatarCount

	// Update game with new turn
	_, err = db.Exec(`UPDATE games SET current_turn_index = ?, turn_start_time = datetime('now') WHERE id = ?`,
		nextTurnIndex, gameID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Broadcast game update
	gameIDInt, _ := strconv.Atoi(gameID)
	broadcastGameUpdate(gameIDInt)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":       true,
		"newTurnIndex":  nextTurnIndex,
		"turnStartTime": time.Now(),
	})
}

// Set turn to a specific avatar (admin only)
func setTurn(w http.ResponseWriter, r *http.Request) {
	// Check if user is admin
	claims, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var role string
	err = db.QueryRow("SELECT role FROM users WHERE id = ?", claims.UserID).Scan(&role)
	if err != nil || role != "admin" {
		http.Error(w, "Forbidden: Admin access required", http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	gameID := vars["id"]

	var req struct {
		AvatarID int `json:"avatarId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Find the turn order index for this avatar in this game
	var turnOrder int
	err = db.QueryRow(`SELECT turn_order FROM game_avatars WHERE game_id = ? AND avatar_id = ?`,
		gameID, req.AvatarID).Scan(&turnOrder)
	if err != nil {
		http.Error(w, "Avatar not found in this game", http.StatusNotFound)
		return
	}

	// Update game to set the current turn to this avatar
	_, err = db.Exec(`UPDATE games SET current_turn_index = ?, turn_start_time = datetime('now') WHERE id = ?`,
		turnOrder, gameID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Broadcast game update
	gameIDInt, _ := strconv.Atoi(gameID)
	broadcastGameUpdate(gameIDInt)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":       true,
		"newTurnIndex":  turnOrder,
		"turnStartTime": time.Now(),
	})
}

// Create a new battle with questions
func createBattle(w http.ResponseWriter, r *http.Request) {
	_, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Allow any authenticated user to create battles (for attack scenarios)

	var req struct {
		Name             string  `json:"name"`
		Reward           string  `json:"reward"`
		Status           *string `json:"status"`            // Optional status (defaults to 'pending')
		Attacker         *int    `json:"attacker"`          // Asset ID of attacker
		Defender         *int    `json:"defender"`          // Asset ID of defender
		AttackerAvatarID *int    `json:"attackerAvatarId"`  // Avatar ID of attacker
		DefenderAvatarID *int    `json:"defenderAvatarId"`  // Avatar ID of defender
		GameID           *int    `json:"gameId"`            // Optional game ID to link battle to game
		Questions        []struct {
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

	// Default status to 'pending' if not provided
	status := "pending"
	if req.Status != nil && *req.Status != "" {
		status = *req.Status
	}

	// Create battle
	result, err := db.Exec("INSERT INTO battles (name, reward, status, attacker, defender, attacker_avatar_id, defender_avatar_id, game_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
		req.Name, req.Reward, status, req.Attacker, req.Defender, req.AttackerAvatarID, req.DefenderAvatarID, req.GameID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	battleID, _ := result.LastInsertId()

	// Link battle to game if gameId is provided
	if req.GameID != nil {
		_, err = db.Exec("UPDATE games SET battle_id = ? WHERE id = ?", battleID, *req.GameID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Create questions (optional - only if provided)
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

	rows, err := db.Query("SELECT id, name, reward, winner, date, status, attacker, defender, attacker_avatar_id, defender_avatar_id, game_id FROM battles ORDER BY date DESC")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var battles []Battle
	for rows.Next() {
		var b Battle
		err := rows.Scan(&b.ID, &b.Name, &b.Reward, &b.Winner, &b.Date, &b.Status, &b.Attacker, &b.Defender, &b.AttackerAvatarID, &b.DefenderAvatarID, &b.GameID)
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
	err = db.QueryRow("SELECT id, name, reward, winner, date, status, attacker, defender, attacker_avatar_id, defender_avatar_id, game_id FROM battles WHERE id = ?", battleID).
		Scan(&battle.ID, &battle.Name, &battle.Reward, &battle.Winner, &battle.Date, &battle.Status, &battle.Attacker, &battle.Defender, &battle.AttackerAvatarID, &battle.DefenderAvatarID, &battle.GameID)
	if err != nil {
		http.Error(w, "Battle not found", http.StatusNotFound)
		return
	}

	// Get attacker asset
	var attackerAsset *Asset
	var attackerAvatarID int
	if battle.Attacker != nil {
		var asset Asset
		var isLockedInt int
		err = db.QueryRow(`SELECT id, COALESCE(avatar_id, 0), status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina, COALESCE(xp, 0), COALESCE(xp_required, 100), COALESCE(is_locked, 0), COALESCE(is_locked_by, 0), COALESCE(is_unlocked_for, 0)
			FROM assets WHERE id = ?`, *battle.Attacker).Scan(&asset.ID, &asset.AvatarID, &asset.Status, &asset.Type, &asset.Name, &asset.Thumbnail,
			&asset.Attack, &asset.Defense, &asset.Healing, &asset.Power,
			&asset.Endurance, &asset.Level, &asset.RequiredLevel, &asset.Cost, &asset.Ability,
			&asset.Health, &asset.Stamina, &asset.XP, &asset.XPRequired, &isLockedInt, &asset.IsLockedBy, &asset.IsUnlockedFor)
		if err == nil {
			asset.IsLocked = isLockedInt == 1
			attackerAsset = &asset
			attackerAvatarID = asset.AvatarID
		}
	}

	// Get defender asset
	var defenderAsset *Asset
	var defenderAvatarID int
	if battle.Defender != nil {
		var asset Asset
		var isLockedInt int
		err = db.QueryRow(`SELECT id, COALESCE(avatar_id, 0), status, type, name, thumbnail, attack, defense, healing, power, endurance, level, required_level, cost, ability, health, stamina, COALESCE(xp, 0), COALESCE(xp_required, 100), COALESCE(is_locked, 0), COALESCE(is_locked_by, 0), COALESCE(is_unlocked_for, 0)
			FROM assets WHERE id = ?`, *battle.Defender).Scan(&asset.ID, &asset.AvatarID, &asset.Status, &asset.Type, &asset.Name, &asset.Thumbnail,
			&asset.Attack, &asset.Defense, &asset.Healing, &asset.Power,
			&asset.Endurance, &asset.Level, &asset.RequiredLevel, &asset.Cost, &asset.Ability,
			&asset.Health, &asset.Stamina, &asset.XP, &asset.XPRequired, &isLockedInt, &asset.IsLockedBy, &asset.IsUnlockedFor)
		if err == nil {
			asset.IsLocked = isLockedInt == 1
			defenderAsset = &asset
			defenderAvatarID = asset.AvatarID
		}
	}

	// Get attacker's question for this battle
	var attackerQuestion *BattleQuestion
	if attackerAvatarID > 0 {
		var q BattleQuestion
		var submittedAt sql.NullTime
		var userAnswer sql.NullString
		err = db.QueryRow(`SELECT id, battle_id, question, answer, user_id, possible_points, received_score, time, user_answer, submitted_at
			FROM battle_questions
			WHERE user_id = ? AND battle_id = ?
			ORDER BY id ASC
			LIMIT 1`, attackerAvatarID, battleID).
			Scan(&q.ID, &q.BattleID, &q.Question, &q.Answer, &q.UserID,
				&q.PossiblePoints, &q.ReceivedScore, &q.Time, &userAnswer, &submittedAt)
		if err == nil {
			if userAnswer.Valid {
				q.UserAnswer = &userAnswer.String
			}
			if submittedAt.Valid {
				submittedAtStr := submittedAt.Time.Format(time.RFC3339)
				q.SubmittedAt = &submittedAtStr
			}
			attackerQuestion = &q
		}
	}

	// Get defender's question for this battle
	var defenderQuestion *BattleQuestion
	if defenderAvatarID > 0 {
		var q BattleQuestion
		var submittedAt sql.NullTime
		var userAnswer sql.NullString
		err = db.QueryRow(`SELECT id, battle_id, question, answer, user_id, possible_points, received_score, time, user_answer, submitted_at
			FROM battle_questions
			WHERE user_id = ? AND battle_id = ?
			ORDER BY id ASC
			LIMIT 1`, defenderAvatarID, battleID).
			Scan(&q.ID, &q.BattleID, &q.Question, &q.Answer, &q.UserID,
				&q.PossiblePoints, &q.ReceivedScore, &q.Time, &userAnswer, &submittedAt)
		if err == nil {
			if userAnswer.Valid {
				q.UserAnswer = &userAnswer.String
			}
			if submittedAt.Valid {
				submittedAtStr := submittedAt.Time.Format(time.RFC3339)
				q.SubmittedAt = &submittedAtStr
			}
			defenderQuestion = &q
		}
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
		"battle":           battle,
		"attackerAsset":    attackerAsset,
		"defenderAsset":    defenderAsset,
		"attackerQuestion": attackerQuestion,
		"defenderQuestion": defenderQuestion,
		"questions":        questions,
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

// Get unanswered question for a user
func getUnansweredQuestion(w http.ResponseWriter, r *http.Request) {
	_, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	userID := vars["userId"]

	var question BattleQuestion
	err = db.QueryRow(`SELECT id, battle_id, question, answer, user_id, possible_points, received_score, time, user_answer, submitted_at
		FROM battle_questions
		WHERE user_id = ? AND submitted_at IS NULL
		ORDER BY id ASC
		LIMIT 1`, userID).
		Scan(&question.ID, &question.BattleID, &question.Question, &question.Answer, &question.UserID,
			&question.PossiblePoints, &question.ReceivedScore, &question.Time, &question.UserAnswer, &question.SubmittedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{"question": nil})
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"question": question})
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
		BattleID   int    `json:"battleId"`
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

	// Do not automatically complete the battle - admin will do it manually
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// Process battle calculations
func processBattle(battleID, attackerAssetID, defenderAssetID, attackerAvatarID, defenderAvatarID int, attackerQuestion, defenderQuestion *BattleQuestion) {
	// Get attacker and defender assets
	var attackerAsset, defenderAsset Asset
	db.QueryRow("SELECT id, attack, defense, health, stamina FROM assets WHERE id = ?", attackerAssetID).
		Scan(&attackerAsset.ID, &attackerAsset.Attack, &attackerAsset.Defense, &attackerAsset.Health, &attackerAsset.Stamina)
	db.QueryRow("SELECT id, attack, defense, health, stamina FROM assets WHERE id = ?", defenderAssetID).
		Scan(&defenderAsset.ID, &defenderAsset.Attack, &defenderAsset.Defense, &defenderAsset.Health, &defenderAsset.Stamina)

	// Check if answers are correct (case-insensitive comparison)
	attackerCorrect := false
	defenderCorrect := false
	if attackerQuestion.UserAnswer != nil {
		attackerCorrect = strings.ToLower(*attackerQuestion.UserAnswer) == strings.ToLower(attackerQuestion.Answer)
	}
	if defenderQuestion.UserAnswer != nil {
		defenderCorrect = strings.ToLower(*defenderQuestion.UserAnswer) == strings.ToLower(defenderQuestion.Answer)
	}

	// Calculate damage points: (attacker.attack / defender.defense) * 100
	damagePoints := float64(attackerAsset.Attack) / float64(defenderAsset.Defense) * 100.0

	// Apply battle logic
	newDefenderHealth := defenderAsset.Health
	newAttackerStamina := attackerAsset.Stamina

	if attackerCorrect && defenderCorrect {
		// Both right: defender takes half damage points
		newDefenderHealth = defenderAsset.Health - int(damagePoints/2.0)
	} else if attackerCorrect && !defenderCorrect {
		// Attacker right, defender wrong: defender takes full damage points
		newDefenderHealth = defenderAsset.Health - int(damagePoints)
	} else if !attackerCorrect && defenderCorrect {
		// Attacker wrong, defender right: attacker loses 25 stamina points, no damage to defender
		newAttackerStamina = attackerAsset.Stamina - 25
	} else {
		// Both wrong: defender takes 25 health points, attacker loses 25 stamina points
		newDefenderHealth = defenderAsset.Health - 25
		newAttackerStamina = attackerAsset.Stamina - 25
	}

	// Ensure values don't go below 0
	if newDefenderHealth < 0 {
		newDefenderHealth = 0
	}
	if newAttackerStamina < 0 {
		newAttackerStamina = 0
	}

	// Update defender asset in database
	db.Exec("UPDATE assets SET health = ? WHERE id = ?", newDefenderHealth, defenderAssetID)

	// Check if defender health is <= 0 and mark as "rip"
	if newDefenderHealth <= 0 {
		log.Printf("Defender asset %d has health <= 0, marking as 'rip'", defenderAssetID)
		db.Exec("UPDATE assets SET status = 'rip' WHERE id = ?", defenderAssetID)
		// Clear the defender from any game cell they occupy
		db.Exec("UPDATE game_cells SET occupied_by = NULL, status = 'active' WHERE occupied_by = ?", defenderAssetID)
	}

	// Update attacker asset in database
	db.Exec("UPDATE assets SET stamina = ? WHERE id = ?", newAttackerStamina, attackerAssetID)

	// Check if attacker health is <= 0 and mark as "rip" (in case attacker already had low health)
	var attackerHealth int
	db.QueryRow("SELECT health FROM assets WHERE id = ?", attackerAssetID).Scan(&attackerHealth)
	if attackerHealth <= 0 {
		log.Printf("Attacker asset %d has health <= 0, marking as 'rip'", attackerAssetID)
		db.Exec("UPDATE assets SET status = 'rip' WHERE id = ?", attackerAssetID)
		// Clear the attacker from any game cell they occupy
		db.Exec("UPDATE game_cells SET occupied_by = NULL, status = 'active' WHERE occupied_by = ?", attackerAssetID)
	}

	// Mark battle as complete
	db.Exec("UPDATE battles SET status = 'completed' WHERE id = ?", battleID)

	// Clear battle_id from game so it resumes
	db.Exec("UPDATE games SET battle_id = NULL WHERE battle_id = ?", battleID)
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

// Upload store images and compress them
func uploadStoreImages(w http.ResponseWriter, r *http.Request) {
	// Parse multipart form (max 50MB)
	err := r.ParseMultipartForm(50 << 20)
	if err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	// Get folder path
	folderPath := r.FormValue("folderPath")
	if folderPath == "" {
		http.Error(w, "Folder path is required", http.StatusBadRequest)
		return
	}

	// Get uploaded files
	files := r.MultipartForm.File["images"]
	if len(files) == 0 {
		http.Error(w, "No images uploaded", http.StatusBadRequest)
		return
	}

	// Build target directory path
	targetDir := filepath.Join("frontend", "src", "assets", "store", folderPath)

	// Create directory if it doesn't exist
	err = os.MkdirAll(targetDir, 0755)
	if err != nil {
		http.Error(w, "Failed to create directory: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Save uploaded files
	var savedFiles []string
	for _, fileHeader := range files {
		// Open uploaded file
		file, err := fileHeader.Open()
		if err != nil {
			http.Error(w, "Failed to open uploaded file: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer file.Close()

		// Create destination file
		destPath := filepath.Join(targetDir, fileHeader.Filename)
		destFile, err := os.Create(destPath)
		if err != nil {
			http.Error(w, "Failed to create file: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer destFile.Close()

		// Copy file content
		_, err = io.Copy(destFile, file)
		if err != nil {
			http.Error(w, "Failed to save file: "+err.Error(), http.StatusInternalServerError)
			return
		}

		savedFiles = append(savedFiles, fileHeader.Filename)
	}

	// Run compress_images.sh script
	scriptPath := "./compress_images.sh"
	cmd := exec.Command("bash", scriptPath)
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("Compression script error: %s\nOutput: %s", err.Error(), string(output))
		http.Error(w, "Failed to compress images: "+err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("Compression output: %s", string(output))

	// Return success with saved filenames (converted to .webp)
	webpFiles := make([]string, len(savedFiles))
	for i, filename := range savedFiles {
		// Remove original extension and add .webp
		ext := filepath.Ext(filename)
		baseName := strings.TrimSuffix(filename, ext)
		webpFiles[i] = baseName + ".webp"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"files":   webpFiles,
		"message": "Images uploaded and compressed successfully",
	})
}

// Insert store items into database
func insertStoreItems(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Files     []string `json:"files"`
		Type      string   `json:"type"`
		Folder    string   `json:"folder"`
		AdhFrom   int      `json:"adhFrom"`
		AdhPlus   int      `json:"adhPlus"`
		IsLocked  int      `json:"isLocked"`
		Cost      int      `json:"cost"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if len(req.Files) == 0 {
		http.Error(w, "Files array is required", http.StatusBadRequest)
		return
	}
	if req.Type == "" {
		http.Error(w, "Type is required", http.StatusBadRequest)
		return
	}
	if req.Folder == "" {
		http.Error(w, "Folder is required", http.StatusBadRequest)
		return
	}

	// Convert files array to JSON string
	filesJSON, err := json.Marshal(req.Files)
	if err != nil {
		http.Error(w, "Failed to encode files", http.StatusInternalServerError)
		return
	}

	// Run insert_store_items.sh script
	scriptPath := "./insert_store_items.sh"
	cmd := exec.Command("bash", scriptPath,
		"--files", string(filesJSON),
		"--type", req.Type,
		"--folder", req.Folder,
		"--adh-from", fmt.Sprintf("%d", req.AdhFrom),
		"--adh-plus", fmt.Sprintf("%d", req.AdhPlus),
		"--is-locked", fmt.Sprintf("%d", req.IsLocked),
		"--cost", fmt.Sprintf("%d", req.Cost),
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("Insert script error: %s\nOutput: %s", err.Error(), string(output))
		http.Error(w, "Failed to insert items: "+err.Error()+"\nOutput: "+string(output), http.StatusInternalServerError)
		return
	}

	log.Printf("Insert output: %s", string(output))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Store items inserted successfully",
	})
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

// Assign question to battle
func assignQuestionToBattle(w http.ResponseWriter, r *http.Request) {
	_, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		BattleID int `json:"battleId"`
		UserID   int `json:"userId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Find first question for this user without a battle_id assigned
	var questionID int
	err = db.QueryRow(`SELECT id FROM battle_questions
		WHERE user_id = ? AND battle_id IS NULL
		ORDER BY id ASC
		LIMIT 1`, req.UserID).Scan(&questionID)
	if err != nil {
		http.Error(w, "No available question found for user", http.StatusNotFound)
		return
	}

	// Assign the battle_id to this question
	_, err = db.Exec(`UPDATE battle_questions SET battle_id = ? WHERE id = ?`, req.BattleID, questionID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// Complete battle manually (admin only)
func completeBattle(w http.ResponseWriter, r *http.Request) {
	_, err := getUserFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		BattleID int `json:"battleId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Get battle info
	var attackerAvatarID, defenderAvatarID int
	var attackerAssetID, defenderAssetID int
	err = db.QueryRow("SELECT attacker_avatar_id, defender_avatar_id, attacker, defender FROM battles WHERE id = ?", req.BattleID).
		Scan(&attackerAvatarID, &defenderAvatarID, &attackerAssetID, &defenderAssetID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get both questions
	var attackerQuestion, defenderQuestion BattleQuestion
	var attackerSubmittedAt, defenderSubmittedAt sql.NullTime
	var attackerUserAnswer, defenderUserAnswer sql.NullString

	err = db.QueryRow(`SELECT id, question, answer, user_answer, submitted_at
		FROM battle_questions
		WHERE battle_id = ? AND user_id = ?`, req.BattleID, attackerAvatarID).
		Scan(&attackerQuestion.ID, &attackerQuestion.Question, &attackerQuestion.Answer, &attackerUserAnswer, &attackerSubmittedAt)
	if err == nil {
		if attackerUserAnswer.Valid {
			attackerQuestion.UserAnswer = &attackerUserAnswer.String
		}
		if attackerSubmittedAt.Valid {
			submittedAtStr := attackerSubmittedAt.Time.Format(time.RFC3339)
			attackerQuestion.SubmittedAt = &submittedAtStr
		}
	}

	err = db.QueryRow(`SELECT id, question, answer, user_answer, submitted_at
		FROM battle_questions
		WHERE battle_id = ? AND user_id = ?`, req.BattleID, defenderAvatarID).
		Scan(&defenderQuestion.ID, &defenderQuestion.Question, &defenderQuestion.Answer, &defenderUserAnswer, &defenderSubmittedAt)
	if err == nil {
		if defenderUserAnswer.Valid {
			defenderQuestion.UserAnswer = &defenderUserAnswer.String
		}
		if defenderSubmittedAt.Valid {
			submittedAtStr := defenderSubmittedAt.Time.Format(time.RFC3339)
			defenderQuestion.SubmittedAt = &submittedAtStr
		}
	}

	// Process battle
	processBattle(req.BattleID, attackerAssetID, defenderAssetID, attackerAvatarID, defenderAvatarID, &attackerQuestion, &defenderQuestion)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
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
	api.HandleFunc("/assets/request-access", requestAssetAccess).Methods("POST")
	api.HandleFunc("/assets/{id}/request", getAssetRequest).Methods("GET")
	api.HandleFunc("/assets/{id}/approve", approveAssetAccess).Methods("POST")
	api.HandleFunc("/assets/{id}/deny", denyAssetAccess).Methods("POST")
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
	api.HandleFunc("/streak/{userId}", getStreak).Methods("GET")
	api.HandleFunc("/assignments", getAssignments).Methods("GET")
	api.HandleFunc("/assignments/submit", submitAssignment).Methods("POST")
	api.HandleFunc("/assignments/create", createAssignments).Methods("POST")
	api.HandleFunc("/assignments/daily-vocab", createDailyVocabAssignments).Methods("POST")
	api.HandleFunc("/assignments/student/{assignmentId}", getStudentAssignment).Methods("GET")
	api.HandleFunc("/assignments/admin/all", getAllAssignments).Methods("GET")
	api.HandleFunc("/assignments/admin/{id}", getAssignmentByID).Methods("GET")
	api.HandleFunc("/assignments/bulk-update-due-dates", bulkUpdateAssignmentDueDates).Methods("PUT")
	api.HandleFunc("/assignments/{id}", updateAssignment).Methods("PUT")
	api.HandleFunc("/assignments/{id}", deleteAssignment).Methods("DELETE")
	api.HandleFunc("/ws", handleWebSocket)
	api.HandleFunc("/games", getGames).Methods("GET")
	api.HandleFunc("/games/create", createGame).Methods("POST")
	api.HandleFunc("/games/{id}", getGame).Methods("GET")
	api.HandleFunc("/games/{id}", updateGame).Methods("PUT")
	api.HandleFunc("/games/{id}", deleteGame).Methods("DELETE")
	api.HandleFunc("/games/{id}/advance-turn", advanceTurn).Methods("POST")
	api.HandleFunc("/games/{id}/set-turn", setTurn).Methods("POST")
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
	api.HandleFunc("/battles/questions/unanswered/{userId}", getUnansweredQuestion).Methods("GET")
	api.HandleFunc("/battles/assign-question", assignQuestionToBattle).Methods("POST")
	api.HandleFunc("/battles/complete", completeBattle).Methods("POST")

	// Admin store management routes
	api.HandleFunc("/admin/upload-store-images", uploadStoreImages).Methods("POST")
	api.HandleFunc("/admin/insert-store-items", insertStoreItems).Methods("POST")

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
