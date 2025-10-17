import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Games.css";

function Games() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [editingGame, setEditingGame] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    thumbnail: "",
  });

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch("/api/games");
      const data = await response.json();
      setGames(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching games:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (gameId, gameName) => {
    if (!confirm(`Are you sure you want to delete "${gameName}"? This will also delete all game cells.`)) {
      return;
    }

    setDeleting(gameId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/games/${gameId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setGames(games.filter((g) => g.id !== gameId));
      } else {
        alert("Failed to delete game");
      }
    } catch (error) {
      console.error("Error deleting game:", error);
      alert("Error deleting game");
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (game) => {
    navigate(`/admin/edit-game/${game.id}`);
  };

  const handlePlay = (game) => {
    navigate(`/play/${game.id}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="page games-page">
        <div className="loading-container">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Loading games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page games-page">
      <div className="games-header">
        <div className="header-content">
          <h1>
            <i className="fa-solid fa-chess-board"></i> Games Management
          </h1>
          <p className="subtitle">View, edit, and play all your created games</p>
        </div>
        <button
          className="create-game-btn"
          onClick={() => navigate("/admin/create-game")}
        >
          <i className="fa-solid fa-plus"></i> Create New Game
        </button>
      </div>

      {games.length === 0 ? (
        <div className="empty-state">
          <i className="fa-solid fa-chess-board"></i>
          <h2>No Games Yet</h2>
          <p>Create your first game to get started!</p>
          <button
            className="create-first-btn"
            onClick={() => navigate("/admin/create-game")}
          >
            <i className="fa-solid fa-plus"></i> Create Game
          </button>
        </div>
      ) : (
        <div className="games-grid">
          {games.map((game) => (
            <div key={game.id} className="game-card">
              <div className="game-thumbnail">
                {game.thumbnail ? (
                  <img src={game.thumbnail} alt={game.name} />
                ) : (
                  <div className="thumbnail-placeholder">
                    <i className="fa-solid fa-chess-board"></i>
                  </div>
                )}
              </div>

              <div className="game-info">
                <h3>{game.name}</h3>
                <div className="game-meta">
                  <div className="meta-item">
                    <i className="fa-solid fa-table-cells"></i>
                    <span>
                      {game.rows} × {game.columns} grid
                    </span>
                  </div>
                  <div className="meta-item">
                    <i className="fa-solid fa-calendar"></i>
                    <span>{formatDate(game.createdAt)}</span>
                  </div>
                  <div className="meta-item">
                    <i className="fa-solid fa-hashtag"></i>
                    <span>{game.rows * game.columns} cells</span>
                  </div>
                </div>
              </div>

              <div className="game-actions">
                <button
                  className="action-btn play-btn"
                  onClick={() => handlePlay(game)}
                  title="Play Game"
                >
                  <i className="fa-solid fa-play"></i>
                  <span>Play</span>
                </button>

                <button
                  className="action-btn edit-btn"
                  onClick={() => handleEdit(game)}
                  title="Edit Game"
                >
                  <i className="fa-solid fa-pen"></i>
                  <span>Edit</span>
                </button>

                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(game.id, game.name)}
                  disabled={deleting === game.id}
                  title="Delete Game"
                >
                  {deleting === game.id ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-trash"></i>
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Games;

