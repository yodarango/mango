import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateGame.css";

function CreateGame() {
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatars, setSelectedAvatars] = useState([]);
  const [gameName, setGameName] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [rows, setRows] = useState(5);
  const [columns, setColumns] = useState(5);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchAvatars();
  }, []);

  const fetchAvatars = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/avatars", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setAvatars(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching avatars:", error);
      setLoading(false);
    }
  };

  const handleAvatarToggle = (avatarId) => {
    if (selectedAvatars.includes(avatarId)) {
      setSelectedAvatars(selectedAvatars.filter((id) => id !== avatarId));
    } else {
      setSelectedAvatars([...selectedAvatars, avatarId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!gameName.trim()) {
      alert("Please enter a game name");
      return;
    }

    if (selectedAvatars.length === 0) {
      alert("Please select at least one avatar");
      return;
    }

    if (rows < 1 || rows > 26 || columns < 1 || columns > 26) {
      alert("Rows and columns must be between 1 and 26");
      return;
    }

    setCreating(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/games/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: gameName,
          thumbnail: thumbnail || "/src/assets/game-default.png",
          rows: parseInt(rows),
          columns: parseInt(columns),
          avatarIds: selectedAvatars,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(`Game created successfully! ${data.message}`);
        navigate(`/play/${data.gameId}`);
      } else {
        alert("Failed to create game");
      }
    } catch (error) {
      console.error("Error creating game:", error);
      alert("Error creating game");
    } finally {
      setCreating(false);
    }
  };

  const getElementColor = (element) => {
    const colors = {
      Fire: "#ff6b35",
      Water: "#4ecdc4",
      Earth: "#95b46a",
      Air: "#d4a5a5",
      Lightning: "#ffd700",
      Ice: "#87ceeb",
      Shadow: "#9b59b6",
    };
    return colors[element] || "#3a3a3a";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading avatars...</p>
      </div>
    );
  }

  return (
    <div className="create-game-container">
      <div className="create-game-header">
        <h1>
          <i className="fa-solid fa-chess-board"></i> Create Game
        </h1>
        <p className="create-game-subtitle">
          Set up a new game grid for your avatars
        </p>
      </div>

      <form className="game-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>
            <i className="fa-solid fa-gamepad"></i> Game Details
          </h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="gameName">
                <i className="fa-solid fa-tag"></i> Game Name
              </label>
              <input
                type="text"
                id="gameName"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="Enter game name"
                maxLength="100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="thumbnail">
                <i className="fa-solid fa-image"></i> Thumbnail URL (Optional)
              </label>
              <input
                type="text"
                id="thumbnail"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="Enter image URL"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="rows">
                <i className="fa-solid fa-grip-lines"></i> Rows (1-26)
              </label>
              <input
                type="number"
                id="rows"
                value={rows}
                onChange={(e) => setRows(e.target.value)}
                min="1"
                max="26"
              />
            </div>

            <div className="form-group">
              <label htmlFor="columns">
                <i className="fa-solid fa-grip-vertical"></i> Columns (1-26)
              </label>
              <input
                type="number"
                id="columns"
                value={columns}
                onChange={(e) => setColumns(e.target.value)}
                min="1"
                max="26"
              />
            </div>
          </div>

          <div className="grid-preview">
            <i className="fa-solid fa-table-cells"></i>
            <span>
              Grid Size: {rows} × {columns} = {rows * columns} cells
            </span>
          </div>
        </div>

        <div className="form-section">
          <h2>
            <i className="fa-solid fa-users"></i> Select Players
          </h2>

          <div className="avatars-grid">
            {avatars.map((avatar) => (
              <div
                key={avatar.id}
                className={`avatar-card ${
                  selectedAvatars.includes(avatar.id) ? "selected" : ""
                }`}
                onClick={() => handleAvatarToggle(avatar.id)}
                style={{
                  borderColor: selectedAvatars.includes(avatar.id)
                    ? getElementColor(avatar.element)
                    : "var(--charcoal-light)",
                }}
              >
                <div className="avatar-thumbnail">
                  <img src={avatar.thumbnail} alt={avatar.name} />
                </div>
                <div className="avatar-info">
                  <h3>{avatar.name}</h3>
                  <span
                    className="avatar-element"
                    style={{ color: getElementColor(avatar.element) }}
                  >
                    {avatar.element}
                  </span>
                </div>
                {selectedAvatars.includes(avatar.id) && (
                  <div className="selected-badge">
                    <i className="fa-solid fa-check-circle"></i>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="selected-count">
            <i className="fa-solid fa-user-check"></i>
            <span>{selectedAvatars.length} avatar(s) selected</span>
          </div>
        </div>

        <button type="submit" className="create-btn" disabled={creating}>
          {creating ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i> Creating Game...
            </>
          ) : (
            <>
              <i className="fa-solid fa-plus-circle"></i> Create Game
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default CreateGame;

