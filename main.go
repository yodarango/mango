package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	_ "github.com/mattn/go-sqlite3"
)

type Avatar struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Coins       int    `json:"coins"`
	MainPower   string `json:"mainPower"`
	SuperPower  string `json:"superPower"`
	Personality string `json:"personality"`
	Weakness    string `json:"weakness"`
	AnimalAlly  string `json:"animalAlly"`
	Mascot      string `json:"mascot"`
}

type Asset struct {
	ID        int    `json:"id"`
	AvatarID  int    `json:"avatarId"`
	AssetType int    `json:"assetType"`
	Name      string `json:"name"`
	Attack    int    `json:"attack"`
	Defense   int    `json:"defense"`
	Healing   int    `json:"healing"`
	Power     int    `json:"power"`
	Endurance int    `json:"endurance"`
	Level     int    `json:"level"`
	Cost      int    `json:"cost"`
	Ability   string `json:"ability"`
	Health    int    `json:"health"`
	Stamina   int    `json:"stamina"`
}

var db *sql.DB

var (
	mainPowers    = []string{"Fire 🔥", "Water 💧", "Electricity ⚡️", "Earth 🌱", "Wind 🌬️", "Time 🕥", "Light 🌞", "Metal 🪨"}
	superPowers   = []string{"Flying", "Invisibility", "Super strength", "Reading minds", "Super speed", "Walking through walls"}
	personalities = []string{"Smart 🧠", "Athletic 🏃", "Creative 🖌️", "Popular 👔"}
	weaknesses    = []string{"Lazy", "Forgetful", "Clumsy", "Distrustful"}
	animalAllies  = []string{"Water animals 🦈", "Feline animals 🐺", "Big animals 🦏", "Air animals 🦅", "Reptiles 🐊", "Insects 🦂"}
	studentNames  = []string{"Carlos", "María", "Diego", "Sofia", "Miguel", "Isabella", "Alejandro", "Valentina", "Mateo", "Camila"}
	warriorNames  = []string{"Thunder", "Shadow", "Blaze", "Storm", "Frost", "Viper", "Phoenix", "Dragon", "Wolf", "Eagle", "Titan", "Raven", "Cobra", "Hawk", "Panther", "Bear", "Lion", "Serpent", "Falcon", "Tiger"}
	abilities     = []string{"Fire Strike", "Ice Shield", "Lightning Bolt", "Earthquake", "Tornado Spin", "Time Freeze", "Healing Light", "Metal Armor", "Poison Attack", "Speed Boost", "Strength Surge", "Mind Control", "Invisibility Cloak", "Flight", "Teleportation"}
)

func initDB() {
	var err error
	db, err = sql.Open("sqlite3", "./data.db")
	if err != nil {
		log.Fatal(err)
	}

	createAvatarsTableSQL := `CREATE TABLE IF NOT EXISTS avatars (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		coins INTEGER DEFAULT 0,
		main_power TEXT NOT NULL,
		super_power TEXT NOT NULL,
		personality TEXT NOT NULL,
		weakness TEXT NOT NULL,
		animal_ally TEXT NOT NULL,
		mascot TEXT NOT NULL
	);`

	_, err = db.Exec(createAvatarsTableSQL)
	if err != nil {
		log.Fatal(err)
	}

	createAssetsTableSQL := `CREATE TABLE IF NOT EXISTS assets (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		avatar_id INTEGER NOT NULL,
		asset_type INTEGER NOT NULL CHECK(asset_type <= 100),
		name TEXT NOT NULL,
		attack INTEGER NOT NULL CHECK(attack <= 100),
		defense INTEGER NOT NULL CHECK(defense <= 100),
		healing INTEGER NOT NULL CHECK(healing <= 100),
		power INTEGER NOT NULL,
		endurance INTEGER NOT NULL CHECK(endurance <= 100),
		level INTEGER NOT NULL CHECK(level <= 100),
		cost INTEGER NOT NULL,
		ability TEXT NOT NULL,
		health INTEGER NOT NULL,
		stamina INTEGER NOT NULL,
		FOREIGN KEY (avatar_id) REFERENCES avatars(id)
	);`

	_, err = db.Exec(createAssetsTableSQL)
	if err != nil {
		log.Fatal(err)
	}

	// Insert sample avatars if table is empty
	var count int
	db.QueryRow("SELECT COUNT(*) FROM avatars").Scan(&count)
	if count == 0 {
		rand.Seed(time.Now().UnixNano())
		for i := 0; i < 7; i++ {
			avatar := generateRandomAvatar(studentNames[i])
			result, err := db.Exec(`INSERT INTO avatars (name, coins, main_power, super_power, personality, weakness, animal_ally, mascot)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
				avatar.Name, avatar.Coins, avatar.MainPower, avatar.SuperPower,
				avatar.Personality, avatar.Weakness, avatar.AnimalAlly, avatar.Mascot)
			if err != nil {
				log.Fatal(err)
			}

			// Get the avatar ID
			avatarID, _ := result.LastInsertId()

			// Create 3 random warriors for this avatar
			for j := 0; j < 3; j++ {
				asset := generateRandomAsset(int(avatarID))
				_, err = db.Exec(`INSERT INTO assets (avatar_id, asset_type, name, attack, defense, healing, power, endurance, level, cost, ability, health, stamina)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					asset.AvatarID, asset.AssetType, asset.Name, asset.Attack, asset.Defense,
					asset.Healing, asset.Power, asset.Endurance, asset.Level, asset.Cost,
					asset.Ability, asset.Health, asset.Stamina)
				if err != nil {
					log.Fatal(err)
				}
			}
		}
	}
}

func generateRandomAvatar(name string) Avatar {
	animalAlly := animalAllies[rand.Intn(len(animalAllies))]
	return Avatar{
		Name:        name,
		Coins:       rand.Intn(100),
		MainPower:   mainPowers[rand.Intn(len(mainPowers))],
		SuperPower:  superPowers[rand.Intn(len(superPowers))],
		Personality: personalities[rand.Intn(len(personalities))],
		Weakness:    weaknesses[rand.Intn(len(weaknesses))],
		AnimalAlly:  animalAlly,
		Mascot:      animalAlly,
	}
}

func generateRandomAsset(avatarID int) Asset {
	level := rand.Intn(10) + 1
	maxHealth := 100
	maxStamina := 100

	return Asset{
		AvatarID:  avatarID,
		AssetType: rand.Intn(100) + 1,
		Name:      warriorNames[rand.Intn(len(warriorNames))],
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
	rows, err := db.Query(`SELECT id, name, coins, main_power, super_power, personality, weakness, animal_ally, mascot
		FROM avatars ORDER BY id`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var avatars []Avatar
	for rows.Next() {
		var avatar Avatar
		if err := rows.Scan(&avatar.ID, &avatar.Name, &avatar.Coins, &avatar.MainPower,
			&avatar.SuperPower, &avatar.Personality, &avatar.Weakness,
			&avatar.AnimalAlly, &avatar.Mascot); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		avatars = append(avatars, avatar)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(avatars)
}

func getAvatar(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var avatar Avatar
	err := db.QueryRow(`SELECT id, name, coins, main_power, super_power, personality, weakness, animal_ally, mascot
		FROM avatars WHERE id = ?`, id).Scan(&avatar.ID, &avatar.Name, &avatar.Coins, &avatar.MainPower,
		&avatar.SuperPower, &avatar.Personality, &avatar.Weakness, &avatar.AnimalAlly, &avatar.Mascot)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Avatar not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(avatar)
}

func getAssets(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	avatarID := vars["id"]

	rows, err := db.Query(`SELECT id, avatar_id, asset_type, name, attack, defense, healing, power, endurance, level, cost, ability, health, stamina
		FROM assets WHERE avatar_id = ? ORDER BY level DESC`, avatarID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var assets []Asset
	for rows.Next() {
		var asset Asset
		if err := rows.Scan(&asset.ID, &asset.AvatarID, &asset.AssetType, &asset.Name,
			&asset.Attack, &asset.Defense, &asset.Healing, &asset.Power,
			&asset.Endurance, &asset.Level, &asset.Cost, &asset.Ability,
			&asset.Health, &asset.Stamina); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		assets = append(assets, asset)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(assets)
}

func main() {
	initDB()
	defer db.Close()

	router := mux.NewRouter()

	// API routes
	api := router.PathPrefix("/api").Subrouter()
	api.HandleFunc("/avatars", getAvatars).Methods("GET")
	api.HandleFunc("/avatars/{id}", getAvatar).Methods("GET")
	api.HandleFunc("/avatars/{id}/assets", getAssets).Methods("GET")

	// Serve static files from the frontend build
	spa := spaHandler{staticPath: "frontend/dist", indexPath: "index.html"}
	router.PathPrefix("/").Handler(spa)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
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

