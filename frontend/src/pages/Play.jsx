import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import "./Play.css";

function Play() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [cells, setCells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [warriors, setWarriors] = useState([]);
  const [avatarId, setAvatarId] = useState(null);
  const [allWarriorAssets, setAllWarriorAssets] = useState([]);
  const [selectedWarrior, setSelectedWarrior] = useState(null);
  const [placingAsset, setPlacingAsset] = useState(false);
  const [viewingAsset, setViewingAsset] = useState(null);
  const [movingWarrior, setMovingWarrior] = useState(null); // {warrior, fromCell}
  const gridWrapperRef = useRef(null);
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
      console.log("Fetched game data:", data);
      console.log("Cells before update:", cells);
      console.log("New cells:", data.cells);
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

  // Debug: Log when cells change
  useEffect(() => {
    console.log("Cells state updated:", cells);
  }, [cells]);

  useEffect(() => {
    if (gameId) {
      fetchGame();
      fetchUserWarriors();
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
      console.log("WebSocket connected in Play");
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

  // Center the grid on load
  useEffect(() => {
    if (gridWrapperRef.current && !loading) {
      const wrapper = gridWrapperRef.current;
      const scrollWidth = wrapper.scrollWidth;
      const clientWidth = wrapper.clientWidth;
      wrapper.scrollLeft = (scrollWidth - clientWidth) / 2;
    }
  }, [loading, game]);

  const fetchUserWarriors = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      console.log("Current user:", user);

      // First, get all avatars
      const avatarsResponse = await fetch("/api/avatars");
      const avatars = await avatarsResponse.json();
      console.log("All avatars:", avatars);

      const userAvatar = avatars.find((a) => a.userId === user.id);

      if (!userAvatar) {
        console.log("No avatar found for user ID:", user.id);
        return;
      }

      setAvatarId(userAvatar.id);

      // Fetch warriors from ALL avatars (not just current user)
      const allWarriorsPromises = avatars.map(async (avatar) => {
        try {
          const assetsResponse = await fetch(
            `/api/avatars/${avatar.id}/assets`
          );
          const assets = await assetsResponse.json();
          return (assets || []).filter((asset) => asset.status === "warrior");
        } catch (err) {
          console.error(`Error fetching assets for avatar ${avatar.id}:`, err);
          return [];
        }
      });

      const allWarriorsArrays = await Promise.all(allWarriorsPromises);
      const allWarriorsFlat = allWarriorsArrays.flat();

      // Store ALL warrior assets (from all users) for thumbnail display
      setAllWarriorAssets(allWarriorsFlat);

      // Get only the current user's warriors for placement
      const userWarriorAssets = allWarriorsFlat.filter(
        (asset) => asset.avatarId === userAvatar.id
      );

      // Group user's warriors by type and count them
      const warriorGroups = {};
      userWarriorAssets.forEach((warrior) => {
        if (!warriorGroups[warrior.type]) {
          warriorGroups[warrior.type] = {
            type: warrior.type,
            name: warrior.name,
            thumbnail: warrior.thumbnail,
            count: 0,
            assets: [],
          };
        }
        warriorGroups[warrior.type].count++;
        warriorGroups[warrior.type].assets.push(warrior);
      });

      console.log("All warriors (all users):", allWarriorsFlat);
      console.log("User's warrior groups:", warriorGroups);
      setWarriors(Object.values(warriorGroups));
    } catch (error) {
      console.error("Error fetching warriors:", error);
    }
  };

  const handleWarriorClick = (warriorGroup) => {
    // Find the first available warrior of this type (not placed on grid)
    const availableWarrior = warriorGroup.assets.find(
      (asset) => !cells.some((cell) => cell.occupiedBy === asset.id)
    );

    if (availableWarrior) {
      setSelectedWarrior(availableWarrior);
    } else {
      alert("All warriors of this type are already placed on the grid!");
    }
  };

  const handleCellClick = async (cell) => {
    // If moving a warrior, move it to this cell
    if (movingWarrior && cell.active) {
      if (cell.occupiedBy) {
        alert("This cell is already occupied!");
        return;
      }

      setPlacingAsset(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/game-cells/move-warrior`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fromCellId: movingWarrior.fromCell.id,
            toCellId: cell.id,
            warriorId: movingWarrior.warrior.id,
          }),
        });

        if (response.ok) {
          // Refresh the game data
          await fetchGame();
          setMovingWarrior(null);
        } else {
          const errorText = await response.text();
          alert(`Failed to move warrior: ${errorText}`);
        }
      } catch (error) {
        console.error("Error moving warrior:", error);
        alert("Error moving warrior");
      } finally {
        setPlacingAsset(false);
      }
    }
    // If a warrior is selected, place it on the cell
    else if (selectedWarrior && cell.active) {
      if (cell.occupiedBy) {
        alert("This cell is already occupied!");
        return;
      }

      setPlacingAsset(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `/api/game-cells/${cell.id}/place-warrior`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              warriorId: selectedWarrior.id,
            }),
          }
        );

        if (response.ok) {
          // Refresh the game data
          await fetchGame();
          setSelectedWarrior(null);
        } else {
          const errorText = await response.text();
          alert(`Failed to place warrior: ${errorText}`);
        }
      } catch (error) {
        console.error("Error placing warrior:", error);
        alert("Error placing warrior");
      } finally {
        setPlacingAsset(false);
      }
    } else if (cell.occupiedBy && cell.status === "warrior") {
      // If cell has a warrior, check if it belongs to the current user
      const warrior = allWarriorAssets.find((w) => w.id === cell.occupiedBy);

      // Check if this warrior belongs to the current user's avatar
      if (warrior && warrior.avatarId === avatarId) {
        // This warrior belongs to the user, allow them to move it
        setMovingWarrior({ warrior, fromCell: cell });
      } else {
        // This warrior belongs to someone else, just show stats
        // Try to fetch the warrior details from the backend
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`/api/assets/${cell.occupiedBy}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const warriorData = await response.json();
            setViewingAsset(warriorData);
          }
        } catch (error) {
          console.error("Error fetching warrior details:", error);
        }
      }
    } else {
      // Otherwise show cell details
      setSelectedCell(cell);
    }
  };

  const closeModal = () => {
    setSelectedCell(null);
  };

  const closeAssetModal = () => {
    setViewingAsset(null);
  };

  const cancelSelection = () => {
    setSelectedWarrior(null);
    setMovingWarrior(null);
  };

  const handleZoomChange = (e) => {
    setZoom(parseInt(e.target.value));
  };

  const getCellBackground = (cell) => {
    if (cell.background) {
      // Check if it's a color (starts with #) or an image URL
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
      Fire: "#ff6b35",
      Water: "#4ecdc4",
      Earth: "#95b46a",
      Air: "#d4a5a5",
      Lightning: "#ffd700",
      Ice: "#87ceeb",
      Shadow: "#9b59b6",
    };
    return colors[element] || "#00ff41";
  };

  // Generate row letter (A-Z, then AA-AZ, BA-BZ, etc.)
  const getRowLetter = (row) => {
    if (row < 26) {
      return String.fromCharCode(65 + row);
    } else {
      const firstLetter = String.fromCharCode(65 + Math.floor(row / 26) - 1);
      const secondLetter = String.fromCharCode(65 + (row % 26));
      return firstLetter + secondLetter;
    }
  };

  // Generate grid structure
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
    <div className='play-container'>
      {/* Warriors Display */}
      <div className='warriors-display'>
        {movingWarrior && (
          <div className='selection-banner'>
            <span>
              <i className='fa-solid fa-arrows-alt'></i> Moving{" "}
              {movingWarrior.warrior.name} - Click on a cell to move it there
            </span>
            <button onClick={cancelSelection} className='cancel-selection-btn'>
              <i className='fa-solid fa-times'></i> Cancel
            </button>
          </div>
        )}
        {selectedWarrior && !movingWarrior && (
          <div className='selection-banner'>
            <span>
              <i className='fa-solid fa-hand-pointer'></i> Click on a cell to
              place {selectedWarrior.name}
            </span>
            <button onClick={cancelSelection} className='cancel-selection-btn'>
              <i className='fa-solid fa-times'></i> Cancel
            </button>
          </div>
        )}
        {warriors.length === 0 ? (
          <p className='no-warriors'>No warriors available</p>
        ) : (
          <div className='warriors-grid'>
            {warriors.map((warrior) => {
              const availableCount = warrior.assets.filter(
                (asset) => !cells.some((cell) => cell.occupiedBy === asset.id)
              ).length;
              const isSelected =
                selectedWarrior && selectedWarrior.type === warrior.type;

              return (
                <div
                  key={warrior.type}
                  className={`warrior-item ${isSelected ? "selected" : ""} ${
                    availableCount === 0 ? "depleted" : ""
                  }`}
                  onClick={() => handleWarriorClick(warrior)}
                  title={`${availableCount} available`}
                >
                  <img
                    src={warrior.thumbnail}
                    alt={warrior.name}
                    className='warrior-thumbnail'
                  />
                  <span className='warrior-count'>
                    ({availableCount}/{warrior.count})
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Zoom Controls - Vertical Slider */}
      <div className='zoom-slider-container'>
        <div className='zoom-label'>{zoom}%</div>
        <input
          type='range'
          min='30'
          max='200'
          value={zoom}
          onChange={handleZoomChange}
          className='zoom-slider'
          orient='vertical'
        />
      </div>

      <div className='grid-wrapper' ref={gridWrapperRef}>
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
              {row.map((cell, colIndex) => {
                const isMovingFrom =
                  movingWarrior && movingWarrior.fromCell.id === cell.id;
                const isPlaceable =
                  (selectedWarrior || movingWarrior) &&
                  cell.active &&
                  !cell.occupiedBy;

                return (
                  <div
                    key={`${cell.id}-${cell.occupiedBy || "empty"}`}
                    className={`grid-cell ${
                      cell.active ? "active" : "inactive"
                    } ${cell.occupiedBy ? "occupied" : ""} ${
                      isPlaceable ? "placeable" : ""
                    } ${isMovingFrom ? "moving-from" : ""}`}
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
                        // Find the warrior asset
                        const warrior = allWarriorAssets.find(
                          (w) => w.id === cell.occupiedBy
                        );
                        if (warrior && warrior.thumbnail) {
                          return (
                            <div className='occupied-marker'>
                              <img
                                src={warrior.thumbnail}
                                alt={warrior.name}
                                className='warrior-thumbnail'
                              />
                            </div>
                          );
                        }
                        // Fallback to icon if warrior not found or no thumbnail
                        return (
                          <div className='occupied-marker'>
                            <i className='fa-solid fa-user'></i>
                          </div>
                        );
                      })()}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Cell Details Modal */}
      {selectedCell && (
        <>
          <div className='modal-overlay' onClick={closeModal}></div>
          <div className='cell-modal'>
            <div className='modal-header'>
              <h2>
                <i className='fa-solid fa-map-pin'></i> Cell{" "}
                {selectedCell.cellId}
              </h2>
              <button className='modal-close-btn' onClick={closeModal}>
                <i className='fa-solid fa-times'></i>
              </button>
            </div>
            <div className='modal-body'>
              {selectedCell.name && (
                <div className='modal-field'>
                  <label>Name:</label>
                  <span>{selectedCell.name}</span>
                </div>
              )}
              {selectedCell.description && (
                <div className='modal-field'>
                  <label>Description:</label>
                  <p>{selectedCell.description}</p>
                </div>
              )}
              {selectedCell.element && (
                <div className='modal-field'>
                  <label>Element:</label>
                  <span
                    className='element-badge'
                    style={{
                      backgroundColor: getElementColor(selectedCell.element),
                    }}
                  >
                    {selectedCell.element}
                  </span>
                </div>
              )}
              <div className='modal-field'>
                <label>Status:</label>
                <span
                  className={
                    selectedCell.occupiedBy ? "occupied-status" : "free-status"
                  }
                >
                  {selectedCell.occupiedBy ? "Occupied" : "Free"}
                </span>
              </div>
              {selectedCell.status && (
                <div className='modal-field'>
                  <label>Cell Status:</label>
                  <span>{selectedCell.status}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Asset Stats Modal */}
      {viewingAsset && (
        <>
          <div className='modal-overlay' onClick={closeAssetModal}></div>
          <div className='asset-modal'>
            <div className='modal-header'>
              <h2>
                <i className='fa-solid fa-user-shield'></i> {viewingAsset.name}
              </h2>
              <button className='modal-close-btn' onClick={closeAssetModal}>
                <i className='fa-solid fa-times'></i>
              </button>
            </div>
            <div className='modal-body'>
              <div className='asset-thumbnail-large'>
                <img src={viewingAsset.thumbnail} alt={viewingAsset.name} />
              </div>

              <div className='asset-stats-grid'>
                <div className='stat-item'>
                  <i className='fa-solid fa-sword'></i>
                  <span className='stat-label'>Attack</span>
                  <span className='stat-value'>{viewingAsset.attack}</span>
                </div>

                <div className='stat-item'>
                  <i className='fa-solid fa-shield'></i>
                  <span className='stat-label'>Defense</span>
                  <span className='stat-value'>{viewingAsset.defense}</span>
                </div>

                <div className='stat-item'>
                  <i className='fa-solid fa-heart'></i>
                  <span className='stat-label'>Healing</span>
                  <span className='stat-value'>{viewingAsset.healing}</span>
                </div>

                <div className='stat-item'>
                  <i className='fa-solid fa-bolt'></i>
                  <span className='stat-label'>Power</span>
                  <span className='stat-value'>{viewingAsset.power}</span>
                </div>

                <div className='stat-item'>
                  <i className='fa-solid fa-dumbbell'></i>
                  <span className='stat-label'>Endurance</span>
                  <span className='stat-value'>{viewingAsset.endurance}</span>
                </div>

                <div className='stat-item'>
                  <i className='fa-solid fa-star'></i>
                  <span className='stat-label'>Level</span>
                  <span className='stat-value'>{viewingAsset.level}</span>
                </div>

                <div className='stat-item'>
                  <i className='fa-solid fa-heart-pulse'></i>
                  <span className='stat-label'>Health</span>
                  <span className='stat-value'>{viewingAsset.health}</span>
                </div>

                <div className='stat-item'>
                  <i className='fa-solid fa-fire'></i>
                  <span className='stat-label'>Stamina</span>
                  <span className='stat-value'>{viewingAsset.stamina}</span>
                </div>
              </div>

              {viewingAsset.ability && (
                <div className='asset-ability'>
                  <h3>
                    <i className='fa-solid fa-wand-sparkles'></i> Ability
                  </h3>
                  <p>{viewingAsset.ability}</p>
                </div>
              )}

              {viewingAsset.description && (
                <div className='asset-description'>
                  <h3>
                    <i className='fa-solid fa-scroll'></i> Description
                  </h3>
                  <p>{viewingAsset.description}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Play;
