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
  const [avatarsMap, setAvatarsMap] = useState({}); // Map of avatarId -> avatar data
  const pollingIntervalRef = useRef(null);

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

      // Fetch all avatars for turn control
      const avatarsResponse = await fetch("/api/avatars", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (avatarsResponse.ok) {
        const allAvatars = await avatarsResponse.json();
        const avatarMap = {};
        allAvatars.forEach((avatar) => {
          avatarMap[avatar.id] = avatar;
        });
        setAvatarsMap(avatarMap);
      }

      // Fetch thumbnails for occupied cells
      const occupiedCells = (data.cells || []).filter((c) => c.occupiedBy);
      const uniqueAssetIds = [
        ...new Set(occupiedCells.map((c) => c.occupiedBy)),
      ];

      // Fetch asset details for thumbnails and avatars
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
              avatarId: asset.avatarId,
            };
          }
        } catch (err) {
          console.error(`Error fetching asset ${assetId}:`, err);
        }
        return null;
      });

      const thumbnails = await Promise.all(thumbnailPromises);
      const thumbnailMap = {};
      const uniqueAvatarIds = new Set();
      thumbnails.forEach((t) => {
        if (t) {
          thumbnailMap[t.id] = t;
          uniqueAvatarIds.add(t.avatarId);
        }
      });
      setAssetThumbnails(thumbnailMap);

      // Fetch avatar data for element colors
      const avatarPromises = Array.from(uniqueAvatarIds).map(
        async (avatarId) => {
          try {
            const response = await fetch(`/api/avatars/${avatarId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
              return await response.json();
            }
          } catch (err) {
            console.error(`Error fetching avatar ${avatarId}:`, err);
          }
          return null;
        }
      );

      const avatars = await Promise.all(avatarPromises);
      const avatarMap = {};
      avatars.forEach((avatar) => {
        if (avatar) avatarMap[avatar.id] = avatar;
      });
      setAvatarsMap(avatarMap);
    } catch (error) {
      console.error("Error fetching game:", error);
      setLoading(false);
    }
  };

  // Initial load and setup polling
  useEffect(() => {
    if (gameId) {
      fetchGame();

      // Start polling every 800ms
      pollingIntervalRef.current = setInterval(() => {
        fetchGame();
      }, 800);
    }

    // Cleanup: stop polling when component unmounts
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [gameId]);

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

  const handleSetTurn = async (avatarId) => {
    if (
      !confirm(
        `Set turn to ${avatarsMap[avatarId]?.avatarName || "this avatar"}?`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/games/${gameId}/set-turn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatarId }),
      });

      if (response.ok) {
        alert("Turn updated successfully!");
        await fetchGame(); // Refresh game data
      } else {
        const errorText = await response.text();
        alert(`Failed to set turn: ${errorText}`);
      }
    } catch (error) {
      console.error("Error setting turn:", error);
      alert("Error setting turn");
    }
  };

  const getCellBackground = (cell) => {
    // If cell is occupied, use the avatar's element color with 50% opacity
    if (cell.occupiedBy) {
      const asset = assetThumbnails[cell.occupiedBy];
      if (asset && avatarsMap[asset.avatarId]) {
        const avatar = avatarsMap[asset.avatarId];
        const elementColor = getElementColor(avatar.element);
        // Convert hex to rgba with 50% opacity
        const hex = elementColor.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return { backgroundColor: `rgba(${r}, ${g}, ${b}, 0.5)` };
      }
    }

    // Otherwise use the cell's background
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
    if (element.includes("Metal")) return "#2c2c2c";
    if (element.includes("Electricity")) return "#ffd700";
    if (element.includes("Wind")) return "#9b59b6";
    if (element.includes("Water")) return "#4a90e2";
    if (element.includes("Fire")) return "#e74c3c";
    if (element.includes("Earth")) return "#27ae60";
    if (element.includes("Time")) return "#ff8c42";
    if (element.includes("Light")) return "#f0f0f0";
    return "#667eea";
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

        {/* Turn Control Section */}
        {game && game.avatars && game.avatars.length > 0 && (
          <div className='turn-control-section'>
            <h3>
              <i className='fa-solid fa-clock'></i> Turn Control
            </h3>
            <p className='turn-hint'>
              Click an avatar to set their turn (useful for recovering from turn
              issues)
            </p>
            <div className='avatar-turn-list'>
              {game.avatars.map((avatarId, index) => {
                const avatar = avatarsMap[avatarId];
                const isCurrentTurn = game.currentTurnIndex === index;
                return (
                  <div
                    key={avatarId}
                    className={`avatar-turn-item ${
                      isCurrentTurn ? "current-turn" : ""
                    }`}
                    onClick={() => handleSetTurn(avatarId)}
                  >
                    {avatar && avatar.thumbnail && (
                      <img
                        src={avatar.thumbnail}
                        alt={avatar.avatarName}
                        className='avatar-turn-thumbnail'
                      />
                    )}
                    <div className='avatar-turn-info'>
                      <div className='avatar-turn-name'>
                        {avatar?.avatarName || `Avatar ${avatarId}`}
                      </div>
                      <div className='avatar-turn-order'>
                        Turn Order: {index + 1}
                      </div>
                    </div>
                    {isCurrentTurn && (
                      <div className='current-turn-badge'>
                        <i className='fa-solid fa-star'></i> Current Turn
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
