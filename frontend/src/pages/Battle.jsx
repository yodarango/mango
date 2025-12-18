import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Battle.css";

function Battle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [battle, setBattle] = useState(null);
  const [attacker, setAttacker] = useState(null);
  const [defender, setDefender] = useState(null);
  const [attackerQuestion, setAttackerQuestion] = useState(null);
  const [defenderQuestion, setDefenderQuestion] = useState(null);
  const [currentUserAvatarId, setCurrentUserAvatarId] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [loading, setLoading] = useState(true);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchBattle();

    // Start polling every 800ms
    pollingIntervalRef.current = setInterval(() => {
      fetchBattle();
    }, 800);

    // Cleanup: stop polling when component unmounts
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [id]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/avatars", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const avatars = await response.json();
        if (avatars.length > 0) {
          setCurrentUserAvatarId(avatars[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchBattle = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch battle details with assets and questions included
      const battleResponse = await fetch(`/api/battles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!battleResponse.ok) {
        console.error("Failed to fetch battle");
        setLoading(false);
        return;
      }

      const data = await battleResponse.json();

      setBattle(data.battle);
      setAttacker(data.attackerAsset);
      setDefender(data.defenderAsset);
      setAttackerQuestion(data.attackerQuestion);
      setDefenderQuestion(data.defenderQuestion);

      // Check if battle is complete and redirect to game
      if (data.battle.status === "completed") {
        // Store game ID if we haven't already
        if (!gameId) {
          const gameResponse = await fetch("/api/games", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (gameResponse.ok) {
            const games = await gameResponse.json();
            const linkedGame = games.find(
              (game) => game.battleId === data.battle.id
            );
            if (linkedGame) {
              setGameId(linkedGame.id);
              navigate(`/play/${linkedGame.id}`);
              return;
            }
          }
        } else {
          // We already have the game ID, just navigate
          navigate(`/play/${gameId}`);
          return;
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching battle:", error);
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (answer, questionId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/battles/submit-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: questionId,
          answer: answer,
          battleId: parseInt(id),
        }),
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  if (loading) {
    return <div className='battle-loading'>Loading battle...</div>;
  }

  if (!battle) {
    return <div className='battle-error'>Battle not found</div>;
  }

  if (!attacker || !defender) {
    return (
      <div className='battle-error'>
        <p>Failed to load battle participants</p>
        <p style={{ fontSize: "0.9rem", marginTop: "1rem" }}>
          Attacker ID: {battle.attacker || "N/A"} - {attacker ? "✓" : "✗"}
        </p>
        <p style={{ fontSize: "0.9rem" }}>
          Defender ID: {battle.defender || "N/A"} - {defender ? "✓" : "✗"}
        </p>
      </div>
    );
  }

  const renderQuestion = (question, isUserQuestion) => {
    if (!question) return null;

    try {
      const questionData = JSON.parse(question.question);
      const hasAnswered = question.submittedAt !== null;

      return (
        <div className='battle-question'>
          <p className='question-text'>{questionData.question}</p>
          <ul className='question-options'>
            {questionData.options.map((option, index) => (
              <li
                key={index}
                className={`question-option ${
                  !isUserQuestion || hasAnswered ? "disabled" : ""
                }`}
                onClick={() => {
                  if (isUserQuestion && !hasAnswered) {
                    handleAnswerSelect(option, question.id);
                  }
                }}
              >
                {option}
              </li>
            ))}
          </ul>
          {hasAnswered && <p className='answered-indicator'>✓ Answered</p>}
        </div>
      );
    } catch (error) {
      console.error("Error parsing question:", error);
      return null;
    }
  };

  const isAttacker = battle?.attackerAvatarId === currentUserAvatarId;
  const isDefender = battle?.defenderAvatarId === currentUserAvatarId;

  return (
    <div className='battle-container'>
      <div className='battle-side attacker-side'>
        {attackerQuestion && renderQuestion(attackerQuestion, isAttacker)}
        <img
          src={attacker.thumbnail}
          alt={attacker.name}
          className='battle-avatar-image'
        />
        <div className='battle-stats'>
          <p className='stat-name'>{attacker.name}</p>
          <p className='stat-item'>Power: {attacker.power}</p>
          <p className='stat-item'>Attack: {attacker.attack}</p>
          <p className='stat-item'>Defense: {attacker.defense}</p>
          <p className='stat-item'>Health: {attacker.health}</p>
          <p className='stat-item'>Stamina: {attacker.stamina}</p>
        </div>
      </div>

      <div className='battle-side defender-side'>
        {defenderQuestion && renderQuestion(defenderQuestion, isDefender)}
        <img
          src={defender.thumbnail}
          alt={defender.name}
          className='battle-avatar-image'
        />
        <div className='battle-stats'>
          <p className='stat-name'>{defender.name}</p>
          <p className='stat-item'>Power: {defender.power}</p>
          <p className='stat-item'>Attack: {defender.attack}</p>
          <p className='stat-item'>Defense: {defender.defense}</p>
          <p className='stat-item'>Health: {defender.health}</p>
          <p className='stat-item'>Stamina: {defender.stamina}</p>
        </div>
      </div>
    </div>
  );
}

export default Battle;
