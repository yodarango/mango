import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function AvatarProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const [assets, setAssets] = useState([]);
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

  return (
    <div className='page profile-page'>
      <button className='back-button' onClick={() => navigate("/")}>
        ← Back to Gallery
      </button>

      <div className='profile-header'>
        <div className='profile-info'>
          <h1>{avatar.name}</h1>
          <div className='coins-display'>💰 {avatar.coins} coins</div>
        </div>
      </div>

      <div className='profile-content'>
        <div className='avatar-stats'>
          <h2>Avatar Stats</h2>
          <div className='stats-grid'>
            <div className='stat-item'>
              <span className='stat-label'>Main Power:</span>
              <span className='stat-value'>{avatar.mainPower}</span>
            </div>
            <div className='stat-item'>
              <span className='stat-label'>Super Power:</span>
              <span className='stat-value'>{avatar.superPower}</span>
            </div>
            <div className='stat-item'>
              <span className='stat-label'>Personality:</span>
              <span className='stat-value'>{avatar.personality}</span>
            </div>
            <div className='stat-item'>
              <span className='stat-label'>Weakness:</span>
              <span className='stat-value'>{avatar.weakness}</span>
            </div>
            <div className='stat-item'>
              <span className='stat-label'>Animal Ally:</span>
              <span className='stat-value'>{avatar.animalAlly}</span>
            </div>
            <div className='stat-item mascot-stat'>
              <span className='stat-label'>Mascot:</span>
              <span className='stat-value'>{avatar.mascot}</span>
            </div>
          </div>
        </div>

        <div className='warriors-section'>
          <h2>Warriors & Assets</h2>
          <p className='section-subtitle'>
            Your collection of warriors ready for battle
          </p>

          <div className='warriors-grid'>
            {assets.length === 0 ? (
              <p>No warriors yet. Purchase some with your coins!</p>
            ) : (
              assets.map((asset) => (
                <div key={asset.id} className='warrior-card'>
                  <div className='warrior-header'>
                    <h3>{asset.name}</h3>
                    <span className='warrior-level'>Level {asset.level}</span>
                  </div>

                  <div className='warrior-ability'>
                    <strong>Ability:</strong> {asset.ability}
                  </div>

                  <div className='warrior-stats'>
                    <div className='stat-bar'>
                      <span className='stat-name'>⚔️ Attack</span>
                      <div className='bar-container'>
                        <div
                          className='bar-fill attack'
                          style={{ width: `${asset.attack}%` }}
                        ></div>
                      </div>
                      <span className='stat-number'>{asset.attack}</span>
                    </div>

                    <div className='stat-bar'>
                      <span className='stat-name'>🛡️ Defense</span>
                      <div className='bar-container'>
                        <div
                          className='bar-fill defense'
                          style={{ width: `${asset.defense}%` }}
                        ></div>
                      </div>
                      <span className='stat-number'>{asset.defense}</span>
                    </div>

                    <div className='stat-bar'>
                      <span className='stat-name'>💚 Healing</span>
                      <div className='bar-container'>
                        <div
                          className='bar-fill healing'
                          style={{ width: `${asset.healing}%` }}
                        ></div>
                      </div>
                      <span className='stat-number'>{asset.healing}</span>
                    </div>

                    <div className='stat-bar'>
                      <span className='stat-name'>💪 Endurance</span>
                      <div className='bar-container'>
                        <div
                          className='bar-fill endurance'
                          style={{ width: `${asset.endurance}%` }}
                        ></div>
                      </div>
                      <span className='stat-number'>{asset.endurance}</span>
                    </div>
                  </div>

                  <div className='warrior-status'>
                    <div className='status-item'>
                      <span>❤️ Health:</span>
                      <span>{asset.health}/100</span>
                    </div>
                    <div className='status-item'>
                      <span>⚡ Stamina:</span>
                      <span>{asset.stamina}/100</span>
                    </div>
                    <div className='status-item'>
                      <span>⚡ Power:</span>
                      <span>{asset.power}</span>
                    </div>
                  </div>

                  <div className='warrior-footer'>
                    <span className='warrior-cost'>💰 {asset.cost} coins</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AvatarProfile;

