import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import "./EditGame.css";

function EditGame() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [cells, setCells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [saving, setSaving] = useState(false);
  const [zoom, setZoom] = useState(100);
  const wsRef = useRef(null);
  const fetchGameRef = useRef(null);

  const fetchGame = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/games/${gameId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("EditGame - Fetched game data:", data);
      console.log("EditGame - Cells before update:", cells);
      console.log("EditGame - New cells:", data.cells);
      setGame(data.game);
      setCells(data.cells || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching game:", error);
      setLoading(false);
    }
  };

  // Keep fetchGameRef updated with the latest fetchGame function
  useEffect(() => {
    fetchGameRef.current = fetchGame;
  });

  useEffect(() => {
    if (gameId) {
      fetchGame();
      setupWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [gameId]);

  const setupWebSocket = () => {
    const token = localStorage.getItem("token");
    // In development, Vite proxy will handle the WebSocket connection
    // In production, use the actual host
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/ws?token=${token}`;

    console.log("Connecting to WebSocket:", wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected in EditGame");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);

        if (data.type === "game_update" && data.gameId === parseInt(gameId)) {
          // Refresh game data when updates occur using the ref
          if (fetchGameRef.current) {
            fetchGameRef.current();
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (gameId) {
          setupWebSocket();
        }
      }, 3000);
    };

    wsRef.current = ws;
  };

  const handleCellClick = (cell) => {
    setSelectedCell(cell);
    setEditingCell({
      id: cell.id,
      cellId: cell.cellId,
      name: cell.name || "",
      description: cell.description || "",
      background: cell.background || "#3a3a3a",
      active: cell.active,
      element: cell.element || "",
      occupiedBy: cell.occupiedBy || 0,
      status: cell.status || "",
    });
  };

  const closeModal = () => {
    setSelectedCell(null);
    setEditingCell(null);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 30));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const handleSaveCell = async () => {
    if (!editingCell) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/game-cells/${editingCell.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingCell.name,
          description: editingCell.description,
          background: editingCell.background,
          active: editingCell.active,
          element: editingCell.element,
          occupiedBy: editingCell.occupiedBy,
          status: editingCell.status,
        }),
      });

      if (response.ok) {
        // Update local state
        setCells(
          cells.map((c) =>
            c.id === editingCell.id ? { ...c, ...editingCell } : c
          )
        );
        alert("Cell updated successfully!");
        closeModal();
      } else {
        alert("Failed to update cell");
      }
    } catch (error) {
      console.error("Error updating cell:", error);
      alert("Error updating cell");
    } finally {
      setSaving(false);
    }
  };

  const getCellBackground = (cell) => {
    if (cell.background) {
      if (cell.background.startsWith("#")) {
        return { backgroundColor: cell.background };
      } else {
        return { backgroundImage: `url(${cell.background})` };
      }
    }
    return { backgroundColor: "#3a3a3a" };
  };

  const getElementColor = (element) => {
    const colors = {
      Electricity: "#ffd700",
      Air: "#d4a5a5",
      Metal: "#c0c0c0",
      Fire: "#ff6b35",
      Water: "#4ecdc4",
      Earth: "#95b46a",
      Time: "#9b59b6",
      Other: "#00ff41",
    };
    return colors[element] || "#00ff41";
  };

  const getRowLetter = (row) => {
    if (row < 26) {
      return String.fromCharCode(65 + row);
    } else {
      const firstLetter = String.fromCharCode(65 + Math.floor(row / 26) - 1);
      const secondLetter = String.fromCharCode(65 + (row % 26));
      return firstLetter + secondLetter;
    }
  };

  const generateGrid = () => {
    if (!game || cells.length === 0) return [];

    const grid = [];
    for (let row = 0; row < game.rows; row++) {
      const rowCells = [];
      for (let col = 1; col <= game.columns; col++) {
        const cellId = `${getRowLetter(row)}${col}`;
        const cell = cells.find((c) => c.cellId === cellId);
        rowCells.push(cell || { cellId, active: false });
      }
      grid.push(rowCells);
    }
    return grid;
  };

  if (loading) {
    return (
      <div className='loading-container'>
        <div className='loading-spinner'></div>
        <p>Loading game...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className='error-container'>
        <i className='fa-solid fa-exclamation-triangle'></i>
        <h2>Game Not Found</h2>
        <p>The game you're looking for doesn't exist.</p>
      </div>
    );
  }

  const grid = generateGrid();

  return (
    <div className='edit-game-container'>
      <div className='edit-game-header'>
        <h1>
          <i className='fa-solid fa-pen-to-square'></i> Edit: {game.name}
        </h1>
        <div className='game-info'>
          <span>
            <i className='fa-solid fa-table-cells'></i> {game.rows} ×{" "}
            {game.columns}
          </span>
          <span>
            <i className='fa-solid fa-cubes'></i> {cells.length} cells
          </span>
        </div>
        <p className='edit-hint'>
          <i className='fa-solid fa-info-circle'></i> Click any cell to edit its
          properties
        </p>

        {/* Zoom Controls */}
        <div className='zoom-controls'>
          <button onClick={handleZoomOut} className='zoom-btn'>
            <i className='fa-solid fa-minus'></i>
          </button>
          <button onClick={handleResetZoom} className='zoom-btn zoom-reset'>
            {zoom}%
          </button>
          <button onClick={handleZoomIn} className='zoom-btn'>
            <i className='fa-solid fa-plus'></i>
          </button>
        </div>
      </div>

      <div className='grid-wrapper'>
        <div
          className='grid-container'
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
          }}
        >
          {/* Column headers */}
          <div className='grid-header'>
            <div className='corner-cell'></div>
            {Array.from({ length: game.columns }, (_, i) => (
              <div key={i} className='column-header'>
                {i + 1}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          {grid.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className='grid-row'>
              <div className='row-header'>{getRowLetter(rowIndex)}</div>
              {row.map((cell, colIndex) => (
                <div
                  key={`${cell.id}-${cell.occupiedBy || "empty"}`}
                  className={`grid-cell ${
                    cell.active ? "active" : "inactive"
                  } ${cell.occupiedBy ? "occupied" : ""} editable`}
                  style={getCellBackground(cell)}
                  onClick={() => handleCellClick(cell)}
                >
                  <span className='cell-id'>{cell.cellId}</span>
                  {cell.element && (
                    <div
                      className='cell-element'
                      style={{ color: getElementColor(cell.element) }}
                    >
                      <i className='fa-solid fa-fire'></i>
                    </div>
                  )}
                  {cell.occupiedBy && (
                    <div className='occupied-marker'>
                      <i className='fa-solid fa-user'></i>
                    </div>
                  )}
                  <div className='edit-indicator'>
                    <i className='fa-solid fa-pen'></i>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Cell Modal */}
      {selectedCell && editingCell && (
        <>
          <div className='modal-overlay' onClick={closeModal}></div>
          <div className='edit-cell-modal'>
            <div className='modal-header'>
              <h2>
                <i className='fa-solid fa-pen-to-square'></i> Edit Cell{" "}
                {selectedCell.cellId}
              </h2>
              <button className='modal-close-btn' onClick={closeModal}>
                <i className='fa-solid fa-times'></i>
              </button>
            </div>
            <div className='modal-body'>
              <div className='form-group'>
                <label>
                  <i className='fa-solid fa-tag'></i> Name
                </label>
                <input
                  type='text'
                  value={editingCell.name}
                  onChange={(e) =>
                    setEditingCell({ ...editingCell, name: e.target.value })
                  }
                  placeholder='Enter cell name'
                />
              </div>

              <div className='form-group'>
                <label>
                  <i className='fa-solid fa-align-left'></i> Description
                </label>
                <textarea
                  value={editingCell.description}
                  onChange={(e) =>
                    setEditingCell({
                      ...editingCell,
                      description: e.target.value,
                    })
                  }
                  placeholder='Enter cell description'
                  rows='4'
                ></textarea>
              </div>

              <div className='form-group'>
                <label>
                  <i className='fa-solid fa-palette'></i> Background (Color or
                  Image URL)
                </label>
                <input
                  type='text'
                  value={editingCell.background}
                  onChange={(e) =>
                    setEditingCell({
                      ...editingCell,
                      background: e.target.value,
                    })
                  }
                  placeholder='#3a3a3a or https://...'
                />
              </div>

              <div className='form-group'>
                <label>
                  <i className='fa-solid fa-fire'></i> Element
                </label>
                <select
                  value={editingCell.element}
                  onChange={(e) =>
                    setEditingCell({ ...editingCell, element: e.target.value })
                  }
                >
                  <option value=''>None</option>
                  <option value='Electricity'>Electricity</option>
                  <option value='Air'>Air</option>
                  <option value='Metal'>Metal</option>
                  <option value='Fire'>Fire</option>
                  <option value='Water'>Water</option>
                  <option value='Earth'>Earth</option>
                  <option value='Time'>Time</option>
                  <option value='Other'>Other</option>
                </select>
              </div>

              <div className='form-row'>
                <div className='form-group checkbox-group'>
                  <label>
                    <input
                      type='checkbox'
                      checked={editingCell.active}
                      onChange={(e) =>
                        setEditingCell({
                          ...editingCell,
                          active: e.target.checked,
                        })
                      }
                    />
                    <span>
                      <i className='fa-solid fa-check-circle'></i> Active
                    </span>
                  </label>
                </div>

                <div className='form-group'>
                  <label>
                    <i className='fa-solid fa-user'></i> Occupied By (Avatar ID)
                  </label>
                  <input
                    type='number'
                    value={editingCell.occupiedBy}
                    onChange={(e) =>
                      setEditingCell({
                        ...editingCell,
                        occupiedBy: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder='0 for empty'
                  />
                </div>

                <div className='form-group'>
                  <label>
                    <i className='fa-solid fa-info-circle'></i> Status
                  </label>
                  <input
                    type='text'
                    value={editingCell.status}
                    onChange={(e) =>
                      setEditingCell({
                        ...editingCell,
                        status: e.target.value.slice(0, 20),
                      })
                    }
                    placeholder='Cell status (max 20 chars)'
                    maxLength={20}
                  />
                </div>
              </div>
            </div>

            <div className='modal-footer'>
              <button className='cancel-btn' onClick={closeModal}>
                <i className='fa-solid fa-times'></i> Cancel
              </button>
              <button
                className='save-btn'
                onClick={handleSaveCell}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <i className='fa-solid fa-spinner fa-spin'></i> Saving...
                  </>
                ) : (
                  <>
                    <i className='fa-solid fa-save'></i> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default EditGame;
