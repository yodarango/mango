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
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
	_ "github.com/mattn/go-sqlite3"
)

type User struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Password string `json:"-"` // Never send password in JSON
	Role     string `json:"role"`
}

type Avatar struct {
	ID          int    `json:"id"`
	UserID      *int   `json:"userId,omitempty"`
	Name        string `json:"name"`
	AvatarName  string `json:"avatarName"`
	Thumbnail   string `json:"thumbnail"`
	Coins       int    `json:"coins"`
	Level       int    `json:"level"`
	Element     string `json:"element"`
	SuperPower  string `json:"superPower"`
	Personality string `json:"personality"`
	Weakness    string `json:"weakness"`
	AnimalAlly  string `json:"animalAlly"`
	Mascot      string `json:"mascot"`
	AssetCount  int    `json:"assetCount,omitempty"`
	TotalPower  int    `json:"totalPower,omitempty"`
	Rank        int    `json:"rank,omitempty"`
}

type Asset struct {
	ID        int    `json:"id"`
	AvatarID  int    `json:"avatarId"`
	AssetType string `json:"assetType"`
	Name      string `json:"name"`
	Thumbnail string `json:"thumbnail"`
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
	AssetID int `json:"assetId"`
}

type PurchaseResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Coins   int    `json:"coins"`
}

var db *sql.DB
var jwtSecret = []byte("your-secret-key-change-this-in-production")

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
	db, err = sql.Open("sqlite3", "./data.db")
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
		asset_type TEXT NOT NULL,
		name TEXT NOT NULL,
		thumbnail TEXT NOT NULL,
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
			thumbnail := fmt.Sprintf("/src/assets/avatars/%s", imageFile)
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
				_, err = db.Exec(`INSERT INTO assets (avatar_id, asset_type, name, thumbnail, attack, defense, healing, power, endurance, level, cost, ability, health, stamina)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					asset.AvatarID, asset.AssetType, asset.Name, asset.Thumbnail, asset.Attack, asset.Defense,
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

			_, err = db.Exec(`INSERT INTO assets (avatar_id, asset_type, name, thumbnail, attack, defense, healing, power, endurance, level, cost, ability, health, stamina)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				mascot.AvatarID, mascot.AssetType, mascot.Name, mascot.Thumbnail, mascot.Attack, mascot.Defense,
				mascot.Healing, mascot.Power, mascot.Endurance, mascot.Level, mascot.Cost,
				mascot.Ability, mascot.Health, mascot.Stamina)
			if err != nil {
				log.Fatal(err)
			}
		}
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

func generateRandomAsset(avatarID int, assetType string) Asset {
	level := rand.Intn(10) + 1
	maxHealth := 100
	maxStamina := 100

	// Generate a placeholder image URL
	imgNum := rand.Intn(70) + 1
	thumbnail := "https://i.pravatar.cc/300?img=" + fmt.Sprintf("%d", imgNum)

	return Asset{
		AvatarID:  avatarID,
		AssetType: assetType,
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
	rows, err := db.Query(`SELECT id, name, avatar_name, thumbnail, coins, level, element, super_power, personality, weakness, animal_ally, mascot
		FROM avatars ORDER BY id`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var avatars []Avatar
	for rows.Next() {
		var avatar Avatar
		if err := rows.Scan(&avatar.ID, &avatar.Name, &avatar.AvatarName, &avatar.Thumbnail, &avatar.Coins, &avatar.Level, &avatar.Element,
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
	err := db.QueryRow(`SELECT id, name, avatar_name, thumbnail, coins, level, element, super_power, personality, weakness, animal_ally, mascot
		FROM avatars WHERE id = ?`, id).Scan(&avatar.ID, &avatar.Name, &avatar.AvatarName, &avatar.Thumbnail, &avatar.Coins, &avatar.Level, &avatar.Element,
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

func getAssets(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	avatarID := vars["id"]

	rows, err := db.Query(`SELECT id, avatar_id, asset_type, name, thumbnail, attack, defense, healing, power, endurance, level, cost, ability, health, stamina
		FROM assets WHERE avatar_id = ? ORDER BY asset_type, level DESC`, avatarID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var assets []Asset
	for rows.Next() {
		var asset Asset
		if err := rows.Scan(&asset.ID, &asset.AvatarID, &asset.AssetType, &asset.Name, &asset.Thumbnail,
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
	err := db.QueryRow("SELECT id, name, role FROM users WHERE name = ? AND password = ?", req.Name, req.Password).Scan(&user.ID, &user.Name, &user.Role)
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
		return nil, fmt.Errorf("no authorization header")
	}

	tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
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

	// Get asset details
	var assetCost int
	var assetName string
	err = tx.QueryRow("SELECT cost, name FROM assets WHERE id = ? AND avatar_id IS NULL AND asset_type = 'store'", req.AssetID).Scan(&assetCost, &assetName)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Asset not found or not available for purchase", http.StatusNotFound)
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

	// Deduct coins
	newCoins := coins - assetCost
	_, err = tx.Exec("UPDATE avatars SET coins = ? WHERE id = ?", newCoins, avatarID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Assign asset to user's avatar
	_, err = tx.Exec("UPDATE assets SET avatar_id = ? WHERE id = ?", avatarID, req.AssetID)
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
	rows, err := db.Query(`SELECT id, name, thumbnail, attack, defense, healing, power, endurance, level, cost, ability, health, stamina, asset_type
		FROM assets WHERE asset_type = 'store' AND avatar_id IS NULL ORDER BY cost`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var items []Asset
	for rows.Next() {
		var item Asset
		if err := rows.Scan(&item.ID, &item.Name, &item.Thumbnail, &item.Attack, &item.Defense, &item.Healing,
			&item.Power, &item.Endurance, &item.Level, &item.Cost, &item.Ability, &item.Health, &item.Stamina, &item.AssetType); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		items = append(items, item)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

func main() {
	initDB()
	defer db.Close()

	router := mux.NewRouter()

	// API routes
	api := router.PathPrefix("/api").Subrouter()
	api.HandleFunc("/register", register).Methods("POST")
	api.HandleFunc("/login", login).Methods("POST")
	api.HandleFunc("/avatars", getAvatars).Methods("GET")
	api.HandleFunc("/avatars/{id}", getAvatar).Methods("GET")
	api.HandleFunc("/avatars/{id}/assets", getAssets).Methods("GET")
	api.HandleFunc("/store", getStoreItems).Methods("GET")
	api.HandleFunc("/store/purchase", purchaseAsset).Methods("POST")

	// Serve static files from the frontend build
	spa := spaHandler{staticPath: "frontend/dist", indexPath: "index.html"}
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

