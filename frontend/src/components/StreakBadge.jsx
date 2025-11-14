import React, { useState, useEffect } from "react";
import "./StreakBadge.css";
import { useParams } from "react-router-dom";

function StreakBadge() {
  const [streakText, setStreakText] = useState("");
  const [loading, setLoading] = useState(true);

  const { id } = useParams();

  useEffect(() => {
    fetchStreak();
  }, [id]);

  const fetchStreak = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!id) {
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/streak/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = await response.json();
      setStreakText(data.streak || "0 days");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching streak:", error);
      setLoading(false);
    }
  };

  const getStreakEmoji = (streakString) => {
    // Extract the number from the streak string (e.g., "8 days" -> 8)
    const days = parseInt(streakString) || 0;

    if (days < 5) return "🤞";
    if (days < 10) return "👍";
    if (days < 30) return "👌";
    if (days < 45) return "💯";
    if (days < 60) return "🔥";
    if (days < 75) return "☄️";
    if (days < 90) return "🧨";
    return "🧨";
  };

  if (loading) {
    return null;
  }

  return (
    <div style={{ display: "inline-block" }}>
      <p style={{ color: "#e6ebe8", fontSize: 16, textAlign: "center" }}>
        Streak
      </p>
      <div className='streak-badge'>
        <span className='streak-emoji'>{getStreakEmoji(streakText)}</span>
        <span className='streak-number'>{streakText}</span>
      </div>
    </div>
  );
}

export default StreakBadge;
