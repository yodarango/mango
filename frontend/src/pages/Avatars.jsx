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
          avatars.map((avatar) => (
            <div
              key={avatar.id}
              className='avatar-card'
              onClick={() => handleAvatarClick(avatar.id)}
              style={{ cursor: "pointer" }}
            >
              <div className='avatar-header'>
                <h3>{avatar.name}</h3>
                <div className='coins'>💰 {avatar.coins} coins</div>
              </div>

              <div className='avatar-details'>
                <div className='detail-row'>
                  <span className='label'>Main Power:</span>
                  <span className='value'>{avatar.mainPower}</span>
                </div>

                <div className='detail-row'>
                  <span className='label'>Super Power:</span>
                  <span className='value'>{avatar.superPower}</span>
                </div>

                <div className='detail-row'>
                  <span className='label'>Personality:</span>
                  <span className='value'>{avatar.personality}</span>
                </div>

                <div className='detail-row'>
                  <span className='label'>Weakness:</span>
                  <span className='value'>{avatar.weakness}</span>
                </div>

                <div className='detail-row'>
                  <span className='label'>Animal Ally:</span>
                  <span className='value'>{avatar.animalAlly}</span>
                </div>

                <div className='detail-row mascot'>
                  <span className='label'>Mascot:</span>
                  <span className='value'>{avatar.mascot}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Avatars;
