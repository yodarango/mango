import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./Avatars.css";

function Avatars() {
  const [avatars, setAvatars] = useState([]);
  const [avatarWarriors, setAvatarWarriors] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
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

  if (loading) {
    return (
      <div className='page'>
        <p>Loading avatars...</p>
      </div>
    );
  }

  return (
    <div className='avatars-page-2en24'>
      <div>
        <h2>The Kingdoms</h2>

        <div className='avatars-container'>
          {avatars.length === 0 ? (
            <p>No avatars found.</p>
          ) : (
            avatars.map((avatar) => {
              const warriors = avatarWarriors[avatar.id] || [];

              return (
                <div key={avatar.id} className='avatar-section'>
                  <div className='avatar-stats-container'>
                    <div className='avatar-stats'>
                      <div className='stat-item'>
                        <i className='fa-solid fa-khanda'></i>
                        <span>{warriors.length}</span>
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

                    <div
                      className='avatar-thumbnail'
                      onClick={() => handleAvatarClick(avatar)}
                    >
                      <img
                        src={getAvatarThumbnail(avatar.thumbnail)}
                        alt={avatar.avatarName}
                      />
                    </div>
                  </div>

                  <div className='avatar-main'>
                    {/* Warriors below avatar */}
                    <div className='warriors-grid'>
                      {warriors.map((warrior) => (
                        <div key={warrior.id} className='warrior-thumb'>
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

      {/* Popup Portal */}
      {selectedAvatar &&
        createPortal(
          <div className='avatar-popup-overlay' onClick={closePopup}>
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
    </div>
  );
}

export default Avatars;
