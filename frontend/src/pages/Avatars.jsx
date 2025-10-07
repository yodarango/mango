import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Avatars() {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvatars();
  }, []);

  const fetchAvatars = async () => {
    try {
      const response = await fetch("/api/avatars");
      const data = await response.json();
      setAvatars(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching avatars:", error);
      setLoading(false);
    }
  };

  const handleAvatarClick = (avatarId) => {
    navigate(`/avatar/${avatarId}`);
  };

  const getElementColor = (element) => {
    if (element.includes("Metal")) return "#2c2c2c";
    if (element.includes("Electricity")) return "#ffd700";
    if (element.includes("Wind")) return "#f0f0f0";
    if (element.includes("Water")) return "#4a90e2";
    if (element.includes("Fire")) return "#e74c3c";
    if (element.includes("Earth")) return "#27ae60";
    if (element.includes("Time")) return "#ff8c42";
    if (element.includes("Light")) return "#9b59b6";
    return "#667eea";
  };

  const getTextColor = (element) => {
    // White text for dark backgrounds
    if (
      element.includes("Metal") ||
      element.includes("Earth") ||
      element.includes("Water") ||
      element.includes("Light")
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
    <div className='page'>
      <h2>Student Avatars</h2>
      <p className='subtitle'>Meet the heroes of Spanish Quest!</p>

      <div className='avatars-grid'>
        {avatars.length === 0 ? (
          <p>No avatars found.</p>
        ) : (
          avatars.map((avatar) => {
            const elementColor = getElementColor(avatar.element);
            const textColor = getTextColor(avatar.element);

            return (
              <div
                key={avatar.id}
                className='avatar-card-new'
                onClick={() => handleAvatarClick(avatar.id)}
                style={{
                  cursor: "pointer",
                  background: `linear-gradient(135deg, ${elementColor} 0%, ${elementColor}dd 100%)`,
                  color: textColor,
                }}
              >
                <div className='card-header-new'>
                  <div className='student-info'>
                    <h3 style={{ color: textColor }}>{avatar.name}</h3>
                    <p
                      className='avatar-name-card'
                      style={{ color: textColor }}
                    >
                      {avatar.avatarName}
                    </p>
                  </div>
                  <div
                    className='coins-badge'
                    style={{
                      background:
                        textColor === "#ffffff"
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(0,0,0,0.1)",
                      color: textColor,
                    }}
                  >
                    💰 {avatar.coins}
                  </div>
                </div>

                <div className='card-body-new'>
                  <div className='stat-row-new'>
                    <span className='icon'>⚡</span>
                    <span className='stat-label-new'>Element</span>
                    <span className='stat-value-new'>{avatar.element}</span>
                  </div>

                  <div className='stat-row-new'>
                    <span className='icon'>✨</span>
                    <span className='stat-label-new'>Power</span>
                    <span className='stat-value-new'>{avatar.superPower}</span>
                  </div>

                  <div className='stat-row-new'>
                    <span className='icon'>🎭</span>
                    <span className='stat-label-new'>Type</span>
                    <span className='stat-value-new'>{avatar.personality}</span>
                  </div>

                  <div className='stat-row-new'>
                    <span className='icon'>⚠️</span>
                    <span className='stat-label-new'>Weakness</span>
                    <span className='stat-value-new'>{avatar.weakness}</span>
                  </div>

                  <div className='stat-row-new'>
                    <span className='icon'>🦁</span>
                    <span className='stat-label-new'>Allies</span>
                    <span className='stat-value-new'>{avatar.animalAlly}</span>
                  </div>

                  <div className='stat-row-new mascot-row'>
                    <span className='icon'>⭐</span>
                    <span className='stat-label-new'>Mascot</span>
                    <span className='stat-value-new'>{avatar.mascot}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Avatars;
