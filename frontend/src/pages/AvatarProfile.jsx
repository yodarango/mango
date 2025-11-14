import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AvatarProfile.css";
import StoreGrid from "../components/StoreGrid";
import StreakBadge from "../components/StreakBadge";

function AvatarProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const [assets, setAssets] = useState([]);
  const [warriors, setWarriors] = useState([]);
  const [mascot, setMascot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvatarData();
  }, [id]);

  const fetchAvatarData = async () => {
    try {
      const [avatarResponse, assetsResponse] = await Promise.all([
        fetch(`/api/avatars/${id}`),
        fetch(`/api/avatars/${id}/assets`),
      ]);

      const avatarData = await avatarResponse.json();
      const assetsData = await assetsResponse.json();

      setAvatar(avatarData);
      setAssets(assetsData || []);

      // Separate warriors and mascot
      const warriorsList = (assetsData || []).filter(
        (asset) => asset.status === "warrior"
      );
      const mascotData = (assetsData || []).find(
        (asset) => asset.status === "mascot"
      );

      setWarriors(warriorsList);
      setMascot(mascotData || null);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching avatar data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='page'>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!avatar) {
    return (
      <div className='page'>
        <p>Avatar not found.</p>
        <button onClick={() => navigate("/")}>Back to Gallery</button>
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user && user.role === "admin";

  // Helper function to modify avatar thumbnail path
  const getAvatarThumbnail = (thumbnail) => {
    const parts = thumbnail.split("/");
    const filename = parts[parts.length - 1];
    const newFilename = `avatar_${filename}`;
    parts[parts.length - 1] = newFilename;
    return parts.join("/");
  };

  // Calculate total power
  const totalPower = Math.ceil(
    warriors.reduce(
      (sum, warrior) =>
        sum + warrior.attack + warrior.defense + warrior.healing,
      0
    ) +
      avatar.coins / 2
  );
  const totalPowerFormatted = totalPower.toLocaleString("en-US");

  return (
    <div className='profile-page-fhdn10'>
      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <StreakBadge />
      </div>

      <div className='profile-actions'>
        <button className='back-button' onClick={() => navigate("/")}>
          ← Back to Gallery
        </button>
        {isAdmin && (
          <button
            className='edit-avatar-button'
            onClick={() => navigate(`/admin/edit-avatar/${id}`)}
          >
            <i className='fa-solid fa-pen-to-square'></i> Edit Avatar
          </button>
        )}
      </div>

      <div className='profile-header'>
        <div className='avatar-left-section'>
          <div className='avatar-image-container'>
            <img
              src={getAvatarThumbnail(avatar.thumbnail)}
              alt={avatar.avatarName}
              className='profile-avatar-image'
            />
          </div>
          <div className='avatar-info-below'>
            <div className='info-row'>
              <span className='info-key'>Name:</span>
              <span className='info-value'>{avatar.name}</span>
            </div>
            <div className='info-row'>
              <span className='info-key'>Avatar:</span>
              <span className='info-value'>{avatar.avatarName}</span>
            </div>
            <div className='info-row'>
              <span className='info-key'>
                <i className='fa-solid fa-coins'></i> Coins:
              </span>
              <span className='info-value'>{avatar.coins}</span>
            </div>
            <div className='info-row'>
              <span className='info-key'>
                <i className='fa-solid fa-bolt'></i> Total Power:
              </span>
              <span className='info-value'>{totalPowerFormatted}</span>
            </div>
          </div>
        </div>

        <div
          className='avatar-stats-compact'
          style={{
            backgroundImage: `url(${avatar.thumbnail})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              borderRadius: "12px",
            }}
          ></div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className='stat-text'>
              <i className='icon fa-solid fa-bolt'></i>
              <span className='label'>Element:</span>
              <span className='value'>{avatar.element}</span>
            </div>

            <div className='stat-text'>
              <i className='icon fa-solid fa-wand-magic-sparkles'></i>
              <span className='label'>Power:</span>
              <span className='value'>{avatar.superPower}</span>
            </div>

            <div className='stat-text'>
              <i className='icon fa-solid fa-masks-theater'></i>
              <span className='label'>Type:</span>
              <span className='value'>{avatar.personality}</span>
            </div>

            <div className='stat-text'>
              <i className='icon fa-solid fa-triangle-exclamation'></i>
              <span className='label'>Weakness:</span>
              <span className='value'>{avatar.weakness}</span>
            </div>

            <div className='stat-text'>
              <i className='icon fa-solid fa-paw'></i>
              <span className='label'>Allies:</span>
              <span className='value'>{avatar.animalAlly}</span>
            </div>

            <div className='stat-text mascot-text'>
              <i className='icon fa-solid fa-star'></i>
              <span className='label'>Mascot:</span>
              <span className='value'>{avatar.mascot}</span>
            </div>
          </div>
        </div>
      </div>

      <div className='profile-content'>
        {/* Mascot Section */}
        {mascot && (
          <div className='mascot-section'>
            <h2>
              <i className='fa-solid fa-star'></i> Mascot Companion
            </h2>
            <p className='section-subtitle'>Your loyal mascot ally</p>

            <div className='mascot-card'>
              <div className='mascot-image-container'>
                <img
                  src={mascot.thumbnail}
                  alt={mascot.name}
                  className='mascot-image'
                />
              </div>
              <div className='mascot-details'>
                <div className='warrior-header'>
                  <h3>{mascot.name}</h3>
                  <span className='warrior-level'>Level {mascot.level}</span>
                </div>

                <div className='warrior-ability'>
                  <strong>Ability:</strong> {mascot.ability}
                </div>

                <div className='warrior-stats'>
                  <div className='stat-bar'>
                    <span className='stat-name'>
                      <i className='fa-solid fa-sword'></i> Attack
                    </span>
                    <div className='bar-container'>
                      <div
                        className='bar-fill attack'
                        style={{ width: `${mascot.attack}%` }}
                      ></div>
                    </div>
                    <span className='stat-number'>{mascot.attack}</span>
                  </div>

                  <div className='stat-bar'>
                    <span className='stat-name'>
                      <i className='fa-solid fa-shield'></i> Defense
                    </span>
                    <div className='bar-container'>
                      <div
                        className='bar-fill defense'
                        style={{ width: `${mascot.defense}%` }}
                      ></div>
                    </div>
                    <span className='stat-number'>{mascot.defense}</span>
                  </div>

                  <div className='stat-bar'>
                    <span className='stat-name'>
                      <i className='fa-solid fa-heart'></i> Healing
                    </span>
                    <div className='bar-container'>
                      <div
                        className='bar-fill healing'
                        style={{ width: `${mascot.healing}%` }}
                      ></div>
                    </div>
                    <span className='stat-number'>{mascot.healing}</span>
                  </div>

                  <div className='stat-bar'>
                    <span className='stat-name'>
                      <i className='fa-solid fa-bolt'></i> Endurance
                    </span>
                    <div className='bar-container'>
                      <div
                        className='bar-fill endurance'
                        style={{ width: `${mascot.endurance}%` }}
                      ></div>
                    </div>
                    <span className='stat-number'>{mascot.endurance}</span>
                  </div>
                </div>

                <div className='warrior-status'>
                  <div className='status-item'>
                    <span>Health</span>
                    <span>{mascot.health}</span>
                  </div>
                  <div className='status-item'>
                    <span>Stamina</span>
                    <span>{mascot.stamina}</span>
                  </div>
                  <div className='status-item'>
                    <span>Power</span>
                    <span>{mascot.power}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className='warriors-section'>
          <h2>
            <i className='fa-solid fa-khanda'></i> Warriors
          </h2>
          <p className='section-subtitle'>
            Your collection of warriors ready for battle
          </p>

          <div className='warriors-grid'>
            {warriors.length === 0 ? (
              <p>No warriors yet. Purchase some with your coins!</p>
            ) : (
              <StoreGrid
                items={warriors.sort(
                  (a, b) =>
                    b.attack +
                    b.defense +
                    b.healing -
                    (a.attack + a.defense + a.healing)
                )}
                userCoins={avatar.coins}
                userLevel={avatar.level}
                alwasyActive
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AvatarProfile;
