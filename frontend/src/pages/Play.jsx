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
  const gridWrapperRef = useRef(null);

  useEffect(() => {
    if (gameId) {
      fetchGame();
      fetchUserWarriors();
    }
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

  const fetchGame = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/games/${gameId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setGame(data.game);
      setCells(data.cells || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching game:", error);
      setLoading(false);
    }
  };

  const fetchUserWarriors = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // First, get the user's avatar
      const avatarsResponse = await fetch("/api/avatars");
      const avatars = await avatarsResponse.json();
      const userAvatar = avatars.find((a) => a.userId === user.id);

      if (!userAvatar) return;

      setAvatarId(userAvatar.id);

      // Then get the avatar's warriors
      const assetsResponse = await fetch(
        `/api/avatars/${userAvatar.id}/assets`
      );
      const assets = await assetsResponse.json();

      // Filter for warriors only
      const warriorAssets = (assets || []).filter(
        (asset) => asset.status === "warrior"
      );

      // Group warriors by type and count them
      const warriorGroups = {};
      warriorAssets.forEach((warrior) => {
        if (!warriorGroups[warrior.type]) {
          warriorGroups[warrior.type] = {
            type: warrior.type,
            name: warrior.name,
            thumbnail: warrior.thumbnail,
            count: 0,
          };
        }
        warriorGroups[warrior.type].count++;
      });

      setWarriors(Object.values(warriorGroups));
    } catch (error) {
      console.error("Error fetching warriors:", error);
    }
  };

  const handleCellClick = (cell) => {
    setSelectedCell(cell);
  };

  const closeModal = () => {
    setSelectedCell(null);
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
        {warriors.length === 0 ? (
          <p className='no-warriors'>No warriors available</p>
        ) : (
          warriors.map((warrior) => (
            <div key={warrior.type} className='warrior-item'>
              <img
                src={warrior.thumbnail}
                alt={warrior.name}
                className='warrior-thumbnail'
              />
              <span className='warrior-count'>({warrior.count})</span>
            </div>
          ))
        )}
      </div>

      {/* Zoom Controls - Fixed Position */}
      <div className='zoom-controls-fixed'>
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
            <div key={rowIndex} className='grid-row'>
              <div className='row-header'>{getRowLetter(rowIndex)}</div>
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className={`grid-cell ${
                    cell.active ? "active" : "inactive"
                  } ${cell.isOccupied ? "occupied" : ""}`}
                  style={getCellBackground(cell)}
                  onClick={() => cell.active && handleCellClick(cell)}
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
                  {cell.isOccupied && (
                    <div className='occupied-marker'>
                      <i className='fa-solid fa-user'></i>
                    </div>
                  )}
                </div>
              ))}
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
                    selectedCell.isOccupied ? "occupied-status" : "free-status"
                  }
                >
                  {selectedCell.isOccupied ? "Occupied" : "Free"}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Play;
