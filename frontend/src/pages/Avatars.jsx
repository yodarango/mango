import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import "./Avatars.css";

function Avatars() {
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState([]);
  const [avatarWarriors, setAvatarWarriors] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedWarrior, setSelectedWarrior] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user && user.role === "admin";

  useEffect(() => {
    fetchAvatars();
  }, []);

  const fetchAvatars = async () => {
    try {
      const response = await fetch("/api/avatars");
      const data = await response.json();

      // Filter out "test" avatars for non-admin users
      const filteredData = isAdmin
        ? data || []
        : (data || []).filter((avatar) => avatar.name.toLowerCase() !== "test");

      setAvatars(filteredData);

      // Fetch warriors for each avatar
      const warriorsMap = {};
      await Promise.all(
        filteredData.map(async (avatar) => {
          try {
            const assetsResponse = await fetch(
              `/api/avatars/${avatar.id}/assets`
            );
            const assets = await assetsResponse.json();
            warriorsMap[avatar.id] = (assets || []).filter(
              (asset) => asset.status === "warrior"
            );
          } catch (err) {
            console.error(
              `Error fetching warriors for avatar ${avatar.id}:`,
              err
            );
            warriorsMap[avatar.id] = [];
          }
        })
      );

      setAvatarWarriors(warriorsMap);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching avatars:", error);
      setLoading(false);
    }
  };

  const getAvatarThumbnail = (thumbnail) => {
    // Extract the filename from the path
    const parts = thumbnail.split("/");
    const filename = parts[parts.length - 1];
    // Prepend "avatar_" to the filename
    const newFilename = `avatar_${filename}`;
    // Reconstruct the path
    parts[parts.length - 1] = newFilename;
    return parts.join("/");
  };

  const handleAvatarClick = (avatar) => {
    setSelectedAvatar(avatar);
  };

  const closePopup = () => {
    setSelectedAvatar(null);
  };

  const handleWarriorClick = (warrior, e) => {
    e.stopPropagation();
    setSelectedWarrior(warrior);
  };

  const closeWarriorPopup = () => {
    setSelectedWarrior(null);
  };

  const getElementColor = (element) => {
    if (element.includes("Metal")) return "#9d9d9dff";
    if (element.includes("Electricity")) return "#ffd700";
    if (element.includes("Wind")) return "#9b59b6";
    if (element.includes("Water")) return "#4a90e2";
    if (element.includes("Fire")) return "#e74c3c";
    if (element.includes("Earth")) return "#27ae60";
    if (element.includes("Time")) return "#ff8c42";
    if (element.includes("Light")) return "#f0f0f0";
    return "#667eea";
  };

  const getTextColor = (element) => {
    // White text for dark backgrounds
    if (
      element.includes("Metal") ||
      element.includes("Earth") ||
      element.includes("Water") ||
      element.includes("Wind")
    ) {
      return "#ffffff";
    }
    // Dark text for light backgrounds
    return "#2c3e50";
  };

  const avatarsFromFirstToLast = avatars
    .map((avatar) => {
      const warriors = avatarWarriors[avatar.id] || [];

      // Calculate total power once
      const totalPower = Math.ceil(
        warriors.reduce(
          (sum, warrior) =>
            sum + warrior.attack + warrior.defense + warrior.healing,
          0
        ) +
          avatar.coins / 2
      );

      return {
        ...avatar,
        warriors,
        totalPower,
        totalPowerFormatted: totalPower.toLocaleString("en-US"),
      };
    })
    .sort((a, b) => b.totalPower - a.totalPower);

  if (loading) {
    return (
      <div className='page'>
        <p>Loading avatars...</p>
      </div>
    );
  }

  return (
    <>
      <div className='avatars-page-2en24'>
        <div>
          <h2>The Kingdoms</h2>
          <p className='desc-det'>
            Kingoms are ranked from most to least powerful
          </p>
          {avatarsFromFirstToLast && (
            <p className='desc-det-2'>
              The current King of the Land 👑 is{" "}
              {avatarsFromFirstToLast[0]?.name}
            </p>
          )}

          <div className='avatars-container'>
            {avatars.length === 0 ? (
              <p>No avatars found.</p>
            ) : (
              avatarsFromFirstToLast
                .sort((a, b) => b.totalPower - a.totalPower)
                .map((avatar, i) => {
                  return (
                    <div key={avatar.id} className='avatar-section'>
                      <p
                        className='kingdom-of'
                        style={{ color: getElementColor(avatar.element) }}
                      >
                        Kingdom of {avatar.element}
                      </p>
                      {i === 0 && <div className='position-indicator'>👑</div>}
                      <div className='avatar-stats-container'>
                        <div className='avatar-stats'>
                          <div className='stat-item'>
                            <i className='fa-solid fa-khanda'></i>
                            <span>{avatar.warriors.length}</span>
                          </div>
                          <div className='stat-item'>
                            <i className='fa-solid fa-coins'></i>
                            <span>{avatar.coins}</span>
                          </div>
                          <div className='stat-item'>
                            <i className='fa-solid fa-chart-line'></i>
                            <span>Lv {avatar.level}</span>
                          </div>
                        </div>

                        <div className='avatar-thumbnail-container'>
                          <div
                            className='avatar-thumbnail'
                            onClick={() => handleAvatarClick(avatar)}
                          >
                            <img
                              src={getAvatarThumbnail(avatar.thumbnail)}
                              alt={avatar.avatarName}
                            />
                          </div>
                          <h3
                            style={{ color: getElementColor(avatar.element) }}
                            onClick={() => navigate(`/avatar/${avatar.id}`)}
                          >
                            <i className='fa-solid fa-bolt' />{" "}
                            {avatar.avatarName} ({avatar.totalPowerFormatted})
                          </h3>
                        </div>
                      </div>

                      <div className='avatar-main'>
                        {/* Warriors below avatar */}
                        <div className='warriors-grid'>
                          {avatar.warriors.map((warrior) => (
                            <div
                              key={warrior.id}
                              className='warrior-thumb'
                              onClick={(e) => handleWarriorClick(warrior, e)}
                            >
                              <img
                                src={warrior.thumbnail}
                                alt={warrior.name}
                                title={warrior.name}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* Popup Portal - Outside the main container */}
      {selectedAvatar &&
        createPortal(
          <div className='avatar-popup-overlay-2373h' onClick={closePopup}>
            <div className='avatar-popup' onClick={(e) => e.stopPropagation()}>
              <button className='popup-close' onClick={closePopup}>
                <i className='fa-solid fa-times'></i>
              </button>

              <div className='popup-content'>
                <div className='popup-header'>
                  <img
                    src={getAvatarThumbnail(selectedAvatar.thumbnail)}
                    alt={selectedAvatar.avatarName}
                    className='popup-avatar-image'
                  />
                  <div className='popup-title'>
                    <h2>{selectedAvatar.name}</h2>
                    <p className='popup-avatar-name'>
                      {selectedAvatar.avatarName}
                    </p>
                    <p style={{ color: "white" }}>
                      Total power: {selectedAvatar.totalPowerFormatted}
                    </p>
                    <p style={{ color: "yellow" }}>
                      Total coins: {selectedAvatar.coins}
                    </p>
                  </div>
                </div>

                <div className='popup-stats'>
                  <div className='popup-stat'>
                    <i className='fa-solid fa-bolt'></i>
                    <span className='label'>Element:</span>
                    <span className='value'>{selectedAvatar.element}</span>
                  </div>
                  <div className='popup-stat'>
                    <i className='fa-solid fa-wand-magic-sparkles'></i>
                    <span className='label'>Power:</span>
                    <span className='value'>{selectedAvatar.superPower}</span>
                  </div>
                  <div className='popup-stat'>
                    <i className='fa-solid fa-masks-theater'></i>
                    <span className='label'>Type:</span>
                    <span className='value'>{selectedAvatar.personality}</span>
                  </div>
                  <div className='popup-stat'>
                    <i className='fa-solid fa-triangle-exclamation'></i>
                    <span className='label'>Weakness:</span>
                    <span className='value'>{selectedAvatar.weakness}</span>
                  </div>
                  <div className='popup-stat'>
                    <i className='fa-solid fa-paw'></i>
                    <span className='label'>Allies:</span>
                    <span className='value'>{selectedAvatar.animalAlly}</span>
                  </div>
                  <div className='popup-stat'>
                    <i className='fa-solid fa-star'></i>
                    <span className='label'>Mascot:</span>
                    <span className='value'>{selectedAvatar.mascot}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Warrior Popup Portal */}
      {selectedWarrior &&
        createPortal(
          <div
            className='avatar-popup-overlay-2373h'
            onClick={closeWarriorPopup}
          >
            <div className='avatar-popup' onClick={(e) => e.stopPropagation()}>
              <button className='popup-close' onClick={closeWarriorPopup}>
                <i className='fa-solid fa-times'></i>
              </button>

              <div className='popup-content'>
                <div className='popup-header'>
                  <img
                    src={selectedWarrior.thumbnail}
                    alt={selectedWarrior.name}
                    className='popup-warrior-image'
                  />
                  <div className='popup-title'>
                    <h2>{selectedWarrior.name}</h2>
                    <p className='popup-warrior-type'>{selectedWarrior.type}</p>
                  </div>
                </div>

                <div className='popup-stats'>
                  <div className='popup-stat'>
                    <i className='fa-solid fa-sword'></i>
                    <span className='label'>Attack:</span>
                    <span className='value'>{selectedWarrior.attack}</span>
                  </div>
                  <div className='popup-stat'>
                    <i className='fa-solid fa-shield'></i>
                    <span className='label'>Defense:</span>
                    <span className='value'>{selectedWarrior.defense}</span>
                  </div>
                  <div className='popup-stat'>
                    <i className='fa-solid fa-heart'></i>
                    <span className='label'>Healing:</span>
                    <span className='value'>{selectedWarrior.healing}</span>
                  </div>
                  <div className='popup-stat'>
                    <i className='fa-solid fa-bolt'></i>
                    <span className='label'>Power:</span>
                    <span className='value'>{selectedWarrior.power}</span>
                  </div>
                  <div className='popup-stat'>
                    <i className='fa-solid fa-running'></i>
                    <span className='label'>Endurance:</span>
                    <span className='value'>{selectedWarrior.endurance}</span>
                  </div>
                  <div className='popup-stat'>
                    <i className='fa-solid fa-chart-line'></i>
                    <span className='label'>Level:</span>
                    <span className='value'>{selectedWarrior.level}</span>
                  </div>
                  <div className='popup-stat'>
                    <i className='fa-solid fa-wand-magic-sparkles'></i>
                    <span className='label'>Ability:</span>
                    <span className='value'>{selectedWarrior.ability}</span>
                  </div>
                  <div className='popup-stat'>
                    <i className='fa-solid fa-heart-pulse'></i>
                    <span className='label'>Health:</span>
                    <span className='value'>{selectedWarrior.health}</span>
                  </div>
                  <div className='popup-stat'>
                    <i className='fa-solid fa-battery-full'></i>
                    <span className='label'>Stamina:</span>
                    <span className='value'>{selectedWarrior.stamina}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default Avatars;
