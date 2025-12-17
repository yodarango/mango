import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
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
  const [avatarsMap, setAvatarsMap] = useState({}); // Map of avatarId -> avatar data
  const [selectedWarrior, setSelectedWarrior] = useState(null);
  const [placingAsset, setPlacingAsset] = useState(false);
  const [viewingAsset, setViewingAsset] = useState(null);
  const [movingWarrior, setMovingWarrior] = useState(null); // {warrior, fromCell}
  const [showQRModal, setShowQRModal] = useState(false);
  const gridWrapperRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Turn tracking state
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [turnStartTime, setTurnStartTime] = useState(null);
  const [turnDuration, setTurnDuration] = useState(20);
  const [timeRemaining, setTimeRemaining] = useState(20);
  const [gameAvatars, setGameAvatars] = useState([]); // Avatar IDs in turn order
  const [isAdvancingTurn, setIsAdvancingTurn] = useState(false); // Prevent multiple advance calls
  const lastTurnAdvanceRef = useRef(null); // Track last turn advance to prevent duplicates
  const zeroTimeCountRef = useRef(0); // Count how long we've been at 0 seconds

  // Check if user is admin
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user && user.role === "admin";

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

      // Update turn tracking data
      if (data.game) {
        const newTurnIndex = data.game.currentTurnIndex || 0;
        const newTurnStartTime = data.game.turnStartTime
          ? new Date(data.game.turnStartTime)
          : null;

        // Check if the turn has actually changed
        if (
          newTurnIndex !== currentTurnIndex ||
          (newTurnStartTime &&
            turnStartTime &&
            newTurnStartTime.getTime() !== turnStartTime.getTime())
        ) {
          // Turn has changed, reset the advancing flag
          setIsAdvancingTurn(false);
        }

        setCurrentTurnIndex(newTurnIndex);
        setTurnDuration(data.game.turnDuration || 20);
        setGameAvatars(data.game.avatars || []);
        setTurnStartTime(newTurnStartTime);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching game:", error);
      setLoading(false);
    }
  };

  // Debug: Log when cells change
  useEffect(() => {
    console.log("Cells state updated:", cells);
  }, [cells]);

  // Initial load and setup polling
  useEffect(() => {
    if (gameId) {
      fetchGame();
      fetchUserWarriors();

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

  // Center the grid on load
  useEffect(() => {
    if (gridWrapperRef.current && !loading) {
      const wrapper = gridWrapperRef.current;
      const scrollWidth = wrapper.scrollWidth;
      const clientWidth = wrapper.clientWidth;
      wrapper.scrollLeft = (scrollWidth - clientWidth) / 2;
    }
  }, [loading, game]);

  // Timer countdown effect
  useEffect(() => {
    if (turnStartTime && turnDuration && gameAvatars.length > 0) {
      // Create a unique key for this turn to prevent duplicate advances
      const turnKey = `${currentTurnIndex}-${new Date(
        turnStartTime
      ).getTime()}`;

      const interval = setInterval(() => {
        const elapsed = (Date.now() - new Date(turnStartTime).getTime()) / 1000;
        const remaining = Math.max(0, turnDuration - elapsed);
        setTimeRemaining(Math.ceil(remaining));

        // Track how long we've been at 0
        if (remaining <= 0) {
          zeroTimeCountRef.current += 0.1; // Increment by 100ms
        } else {
          zeroTimeCountRef.current = 0; // Reset if not at 0
        }

        // Auto-advance turn when time runs out
        // Any active player can advance an expired turn to prevent getting stuck
        // Force advance if stuck at 0 for more than 1 second
        if (
          remaining <= 0 &&
          !isAdvancingTurn &&
          (lastTurnAdvanceRef.current !== turnKey ||
            zeroTimeCountRef.current > 1)
        ) {
          lastTurnAdvanceRef.current = turnKey;
          zeroTimeCountRef.current = 0; // Reset counter
          advanceTurnAPI();
        }
      }, 100); // Update every 100ms for smooth countdown

      return () => clearInterval(interval);
    }
  }, [
    turnStartTime,
    turnDuration,
    currentTurnIndex,
    gameAvatars,
    avatarId,
    isAdvancingTurn,
  ]);

  // Function to advance turn via API
  const advanceTurnAPI = async () => {
    // Prevent multiple simultaneous advance calls
    if (isAdvancingTurn) {
      return;
    }

    setIsAdvancingTurn(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/games/${gameId}/advance-turn`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Immediately fetch the new game state
        await fetchGame();
      }
    } catch (error) {
      console.error("Error advancing turn:", error);
    } finally {
      // Reset the flag after a short delay to allow the new turn data to be fetched
      setTimeout(() => {
        setIsAdvancingTurn(false);
      }, 500);
    }
  };

  const fetchUserWarriors = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      console.log("Current user:", user);

      // First, get all avatars
      const avatarsResponse = await fetch("/api/avatars");
      const avatars = await avatarsResponse.json();
      console.log("All avatars:", avatars);

      // Create a map of avatarId -> avatar for quick lookup
      const avatarMap = {};
      avatars.forEach((avatar) => {
        avatarMap[avatar.id] = avatar;
      });
      setAvatarsMap(avatarMap);

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

  // Calculate if a cell is within movement range based on warrior level
  const isCellInRange = (fromCell, toCell, warriorLevel) => {
    if (!fromCell || !toCell || !game) return false;

    // Parse cell IDs (e.g., "A1" -> row: 0, col: 1)
    const parseCell = (cellId) => {
      const match = cellId.match(/^([A-Z]+)(\d+)$/);
      if (!match) return null;

      const letters = match[1];
      const col = parseInt(match[2]);

      // Convert letters to row number (A=0, B=1, ..., AA=26, etc.)
      let row = 0;
      for (let i = 0; i < letters.length; i++) {
        row = row * 26 + (letters.charCodeAt(i) - 65 + (i > 0 ? 1 : 0));
      }

      return { row, col };
    };

    const from = parseCell(fromCell.cellId);
    const to = parseCell(toCell.cellId);

    if (!from || !to) return false;

    // Calculate the distance (Chebyshev distance for diagonal movement)
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    const distance = Math.max(rowDiff, colDiff);

    return distance <= warriorLevel;
  };

  const handleCellClick = async (cell) => {
    // Check if it's the current user's turn
    const isMyTurn = gameAvatars[currentTurnIndex] === avatarId;

    // FIRST: Check if clicking on a warrior (to select/deselect for moving or view stats)
    if (cell.occupiedBy && cell.status === "warrior") {
      // If cell has a warrior, check if it belongs to the current user
      const warrior = allWarriorAssets.find((w) => w.id === cell.occupiedBy);

      // Check if this warrior belongs to the current user's avatar
      if (warrior && warrior.avatarId === avatarId) {
        // Check if it's the user's turn
        if (!isMyTurn) {
          alert("Not your turn!");
          return;
        }

        // Check if clicking the same warrior that's already selected for moving
        if (movingWarrior && movingWarrior.warrior.id === warrior.id) {
          // Cancel the move by deselecting
          setMovingWarrior(null);
        } else {
          // This warrior belongs to the user, allow them to move it
          setMovingWarrior({ warrior, fromCell: cell });
        }
        return; // Exit early after handling warrior selection
      } else {
        // This warrior belongs to someone else, just show stats (allowed anytime)
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
        return; // Exit early after viewing other player's warrior
      }
    }

    // SECOND: If moving a warrior, move it to this cell
    if (movingWarrior && cell.active) {
      if (cell.occupiedBy) {
        alert("This cell is already occupied!");
        return;
      }

      // Check if the cell is within movement range
      if (
        !isCellInRange(
          movingWarrior.fromCell,
          cell,
          movingWarrior.warrior.level
        )
      ) {
        alert(
          `This warrior can only move ${movingWarrior.warrior.level} cell(s) at level ${movingWarrior.warrior.level}!`
        );
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

          // Advance to next turn after successful move
          await advanceTurnAPI();
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
    // THIRD: If a warrior is selected, place it on the cell
    else if (selectedWarrior && cell.active) {
      // Check if it's the user's turn
      if (!isMyTurn) {
        alert("Not your turn!");
        return;
      }

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

          // Advance to next turn after successful placement
          await advanceTurnAPI();
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
    }
    // FOURTH: Otherwise show cell details
    else {
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
    // If cell is occupied, use the avatar's element color with 50% opacity
    if (cell.occupiedBy) {
      const warrior = allWarriorAssets.find((w) => w.id === cell.occupiedBy);
      if (warrior && avatarsMap[warrior.avatarId]) {
        const avatar = avatarsMap[warrior.avatarId];
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
        {isAdmin && (
          <div className='warriors-header'>
            <button
              className='host-game-btn'
              onClick={() => setShowQRModal(true)}
              title='Show QR Code for Players'
            >
              <i className='fa-solid fa-qrcode'></i> Host
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

        {!isAdmin && (
          <>
            {warriors.length === 0 ? (
              <p className='no-warriors'>No warriors available</p>
            ) : (
              <div className='warriors-grid'>
                {warriors.map((warrior) => {
                  const availableCount = warrior.assets.filter(
                    (asset) =>
                      !cells.some((cell) => cell.occupiedBy === asset.id)
                  ).length;
                  const isSelected =
                    selectedWarrior && selectedWarrior.type === warrior.type;

                  return (
                    <div
                      key={warrior.type}
                      className={`warrior-item ${
                        isSelected ? "selected" : ""
                      } ${availableCount === 0 ? "depleted" : ""}`}
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
          </>
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

      {/* Turn Timer */}
      {gameAvatars.length > 0 && (
        <div className='turn-timer-container'>
          <div className='timer-label'>
            {avatarsMap[gameAvatars[currentTurnIndex]]?.avatarName || "Unknown"}
            's Turn
          </div>
          <div className='timer-content'>
            {avatarsMap[gameAvatars[currentTurnIndex]]?.thumbnail && (
              <img
                src={avatarsMap[gameAvatars[currentTurnIndex]].thumbnail}
                alt={avatarsMap[gameAvatars[currentTurnIndex]]?.avatarName}
                className='timer-avatar-thumbnail'
              />
            )}
            <div
              className={`timer-value ${timeRemaining <= 5 ? "warning" : ""}`}
            >
              {timeRemaining}s
            </div>
          </div>
          <div className='timer-progress'>
            <div
              className='timer-progress-bar'
              style={{ width: `${(timeRemaining / turnDuration) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

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

                // Check if cell is placeable based on context
                let isPlaceable = false;
                if (selectedWarrior && cell.active && !cell.occupiedBy) {
                  // Placing a new warrior - any active empty cell
                  isPlaceable = true;
                } else if (movingWarrior && cell.active && !cell.occupiedBy) {
                  // Moving an existing warrior - only cells within range
                  isPlaceable = isCellInRange(
                    movingWarrior.fromCell,
                    cell,
                    movingWarrior.warrior.level
                  );
                }

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

      {/* QR Code Modal */}
      {showQRModal && (
        <>
          <div
            className='modal-overlay'
            onClick={() => setShowQRModal(false)}
          ></div>
          <div className='qr-modal'>
            <div className='modal-header'>
              <h2>
                <i className='fa-solid fa-qrcode'></i> Join Game
              </h2>
              <button
                className='modal-close-btn'
                onClick={() => setShowQRModal(false)}
              >
                <i className='fa-solid fa-times'></i>
              </button>
            </div>
            <div className='modal-body qr-modal-body'>
              <p className='qr-instructions'>
                Players can scan this QR code to join the game:
              </p>
              <div className='qr-code-container'>
                <QRCodeSVG
                  value={`${window.location.origin}/play/${gameId}`}
                  size={256}
                  level='H'
                  marginSize={4}
                />
              </div>
              <div className='game-url'>
                <p className='url-label'>Or visit:</p>
                <code className='url-text'>
                  {window.location.origin}/play/{gameId}
                </code>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Play;
