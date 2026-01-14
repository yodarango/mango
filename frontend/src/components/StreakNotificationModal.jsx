import React from "react";
import "./StreakNotificationModal.css";

export function StreakNotificationModal({ isOpen, onClose, onClaim, milestones }) {
  if (!isOpen || milestones.length === 0) return null;

  return (
    <div className="streak-notification-overlay" onClick={onClose}>
      <div className="streak-notification-content" onClick={(e) => e.stopPropagation()}>
        <button className="streak-notification-close" onClick={onClose}>
          ×
        </button>

        <div className="streak-notification-icon">🎉</div>
        <h2>Congratulations!</h2>
        <p>You have unclaimed streak rewards!</p>

        <div className="milestones-list">
          {milestones.map((milestone) => (
            <div key={milestone} className="milestone-item">
              <span className="milestone-number">{milestone}</span>
              <span className="milestone-text">assignments completed</span>
            </div>
          ))}
        </div>

        <button className="claim-rewards-button" onClick={onClaim}>
          Claim Your Rewards!
        </button>
      </div>
    </div>
  );
}

export default StreakNotificationModal;

