import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AvatarProfile.css";
import StoreGrid from "../components/StoreGrid";
import StreakBadge from "../components/StreakBadge";
import RewardModal from "../components/RewardModal";
import StreakNotificationModal from "../components/StreakNotificationModal";

function AvatarProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const [assets, setAssets] = useState([]);
  const [warriors, setWarriors] = useState([]);
  const [mascot, setMascot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [unclaimedMilestones, setUnclaimedMilestones] = useState([]);
  const [currentMilestone, setCurrentMilestone] = useState(null);
  const [rewardAsset, setRewardAsset] = useState(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetchAvatarData();
  }, [id]);

  const fetchAvatarData = async () => {
    try {
      const [avatarResponse, assetsResponse, streakResponse, storeResponse] =
        await Promise.all([
          fetch(`/api/avatars/${id}`),
          fetch(`/api/avatars/${id}/assets`),
          fetch(`/api/streak/${id}`),
          fetch(`/api/store`),
        ]);

      const avatarData = await avatarResponse.json();
      const assetsData = await assetsResponse.json();
      const streakData = await streakResponse.json();
      const storeData = await storeResponse.json();

      setAvatar(avatarData);
      setAssets(assetsData || []);

      // Parse streak count from response (e.g., "24 assignments" -> 24)
      const streakMatch = streakData.streak?.match(/\d+/);
      const streakCount = streakMatch ? parseInt(streakMatch[0]) : 0;
      setStreak(streakCount);

      console.log("Streak data:", streakData);
      console.log("Parsed streak count:", streakCount);
      console.log("Last claimed:", avatarData.lastStreakRewardClaimed);
      console.log("Store data:", storeData);

      // Get first reward asset (status = "reward", ordered by cost ASC)
      const rewardAssets = (storeData || [])
        .filter((item) => item.status === "reward")
        .sort((a, b) => a.cost - b.cost);

      console.log("Filtered reward assets:", rewardAssets);

      if (rewardAssets.length > 0) {
        setRewardAsset(rewardAssets[0]);
      }

      // Calculate unclaimed milestones
      const milestones = [];
      const lastClaimed = avatarData.lastStreakRewardClaimed || 0;

      for (let i = 6; i <= 108; i += 6) {
        if (i > lastClaimed && i <= streakCount) {
          milestones.push(i);
        }
      }

      setUnclaimedMilestones(milestones);
      console.log("Unclaimed milestones:", milestones);

      // Show notification if there are unclaimed milestones
      if (milestones.length > 0) {
        setShowNotification(true);
      }

      // Separate warriors and mascot
      const warriorsList = (assetsData || []).filter(
        (asset) => asset.status === "warrior" || asset.status === "rip"
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

  const handleClaimRewards = () => {
    setShowNotification(false);
    if (unclaimedMilestones.length > 0) {
      // Start with the first unclaimed milestone
      setCurrentMilestone(unclaimedMilestones[0]);
      setShowRewardModal(true);
    }
  };

  const handleRewardClaimed = (milestone) => {
    // Update last claimed milestone
    console.log(`Claimed reward for milestone: ${milestone}`);

    // Remove this milestone from unclaimed list
    const remaining = unclaimedMilestones.filter((m) => m !== milestone);
    setUnclaimedMilestones(remaining);

    // Close current modal
    setShowRewardModal(false);

    // If there are more milestones, show the next one after a short delay
    if (remaining.length > 0) {
      setTimeout(() => {
        setCurrentMilestone(remaining[0]);
        setShowRewardModal(true);
      }, 500);
    } else {
      // All rewards claimed, refresh avatar data
      console.log(`All rewards claimed up to milestone: ${milestone}`);
      fetchAvatarData();
    }
  };

  const handleRevive = (newCoins) => {
    // Update avatar coins after revive
    setAvatar((prev) => ({ ...prev, coins: newCoins }));
    // Refresh avatar data to get updated warrior status
    fetchAvatarData();
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
      <StreakNotificationModal
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        onClaim={handleClaimRewards}
        milestones={unclaimedMilestones}
      />

      <RewardModal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        streakMilestone={currentMilestone}
        rewardAsset={rewardAsset}
        onClaimReward={handleRewardClaimed}
        avatarId={parseInt(id)}
      />

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
          <h2 style={{ color: "yellow" }}>
            <i className='fa-solid fa-khanda'></i> Warriors
          </h2>
          <p className='section-subtitle' style={{ color: "white" }}>
            Your warriors are ordered from most to least powerful
          </p>

          <div className='warriors-grid'>
            {warriors.length === 0 ? (
              <p>No warriors yet. Purchase some with your coins!</p>
            ) : (
              <div>
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
                  userAvatarId={avatar.id}
                  canTrain
                  alwasyActive
                  onRevive={handleRevive}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AvatarProfile;
