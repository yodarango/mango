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
  const [assetThumbnails, setAssetThumbnails] = useState({}); // Store asset thumbnails by ID
  const [wsConnected, setWsConnected] = useState(false);
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

      // Fetch thumbnails for occupied cells
      const occupiedCells = (data.cells || []).filter((c) => c.occupiedBy);
      const uniqueAssetIds = [
        ...new Set(occupiedCells.map((c) => c.occupiedBy)),
      ];

      // Fetch asset details for thumbnails
      const thumbnailPromises = uniqueAssetIds.map(async (assetId) => {
        try {
          const response = await fetch(`/api/assets/${assetId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const asset = await response.json();
            return {
              id: assetId,
              thumbnail: asset.thumbnail,
              name: asset.name,
            };
          }
        } catch (err) {
          console.error(`Error fetching asset ${assetId}:`, err);
        }
        return null;
      });

      const thumbnails = await Promise.all(thumbnailPromises);
      const thumbnailMap = {};
      thumbnails.forEach((t) => {
        if (t) thumbnailMap[t.id] = t;
      });
      setAssetThumbnails(thumbnailMap);
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
      setWsConnected(true);
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
      setWsConnected(false);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setWsConnected(false);
      // Don't auto-reconnect, let user manually reconnect via button
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

  const handleZoomChange = (e) => {
    setZoom(parseInt(e.target.value));
  };

  const toggleWebSocket = () => {
    if (wsConnected && wsRef.current) {
      // Disconnect
      wsRef.current.close();
      setWsConnected(false);
    } else {
      // Connect
      setupWebSocket();
    }
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

        {/* Zoom Slider */}
        <div className='zoom-slider-wrapper'>
          <div className='zoom-label'>{zoom}%</div>
          <input
            type='range'
            min='30'
            max='200'
            value={zoom}
            onChange={handleZoomChange}
            className='zoom-slider-horizontal'
          />
          <button
            className={`ws-status-btn ${
              wsConnected ? "connected" : "disconnected"
            }`}
            onClick={toggleWebSocket}
            title={
              wsConnected
                ? "Connected - Click to disconnect"
                : "Disconnected - Click to connect"
            }
          ></button>
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
                  {cell.occupiedBy &&
                    (() => {
                      const asset = assetThumbnails[cell.occupiedBy];
                      if (asset && asset.thumbnail) {
                        return (
                          <div className='occupied-marker'>
                            <img
                              src={asset.thumbnail}
                              alt={asset.name}
                              className='warrior-thumbnail'
                            />
                          </div>
                        );
                      }
                      // Fallback to icon if asset not loaded yet
                      return (
                        <div className='occupied-marker'>
                          <i className='fa-solid fa-user'></i>
                        </div>
                      );
                    })()}
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
