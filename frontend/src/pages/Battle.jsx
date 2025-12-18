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
  const [isAdmin, setIsAdmin] = useState(false);
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

  const fetchCurrentUser = () => {
    try {
      const token = localStorage.getItem("user");
      if (!token) return;

      // Decode JWT token to get avatar ID and role
      const user = JSON.parse(token);
      const avatarId = user.id;
      const role = user.role;

      if (avatarId) {
        setCurrentUserAvatarId(avatarId);
      }

      if (role === "admin") {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
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

      // Store game ID from battle
      if (data.battle.gameId && !gameId) {
        setGameId(data.battle.gameId);
      }

      // Check if battle is complete and redirect to game (except admin)
      if (data.battle.status === "completed" && !isAdmin) {
        const targetGameId = data.battle.gameId || gameId;
        if (targetGameId) {
          navigate(`/play/${targetGameId}`);
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

  const handleCompleteBattle = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/battles/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ battleId: parseInt(id) }),
      });

      if (response.ok) {
        alert("Battle completed!");
        fetchBattle(); // Refresh to trigger redirect
      } else {
        alert("Failed to complete battle");
      }
    } catch (error) {
      console.error("Error completing battle:", error);
      alert("Error completing battle");
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

  const renderQuestion = (question, isUserQuestion, avatarName, isAttacker) => {
    if (!question) return null;

    const hasAnswered = question.submittedAt !== null;

    // If answered, show status message instead of question
    if (hasAnswered) {
      return (
        <div className='battle-question'>
          <p className='answered-indicator'>
            {isUserQuestion
              ? "You have answered the question"
              : `${avatarName} has answered the question`}
          </p>
        </div>
      );
    }

    // Check if defender should wait for attacker
    const isDefender = !isAttacker;
    const shouldWait = isDefender && !attackerQuestion?.submittedAt;

    if (shouldWait) {
      return (
        <div className='battle-question'>
          <p className='question-text'>Waiting for attacker to answer...</p>
        </div>
      );
    }

    try {
      const questionData = JSON.parse(question.question);

      return (
        <div className='battle-question'>
          <p className='question-text'>{questionData.question}</p>
          <ul className='question-options'>
            {questionData.options.map((option, index) => (
              <li
                key={index}
                className={`question-option ${
                  !isUserQuestion ? "disabled" : ""
                }`}
                onClick={() => {
                  if (isUserQuestion) {
                    handleAnswerSelect(option, question.id);
                  }
                }}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      );
    } catch (error) {
      console.error("Error parsing question:", error);
      return null;
    }
  };

  const isAttacker = battle?.attackerAvatarId === currentUserAvatarId;
  const isDefender = battle?.defenderAvatarId === currentUserAvatarId;

  console.log(battle?.defenderAvatarId, currentUserAvatarId);

  // Helper to parse and display question for admin
  const renderAdminQuestion = (question, label) => {
    if (!question) return <p>No question assigned</p>;

    try {
      const questionData = JSON.parse(question.question);
      return (
        <div className='admin-question-block'>
          <h4>{label}</h4>
          <p className='admin-question-text'>{questionData.question}</p>
          <ul className='admin-options-list'>
            {questionData.options.map((option, index) => (
              <li
                key={index}
                className={option === question.answer ? "correct-answer" : ""}
              >
                {option}
                {option === question.answer && " ✓"}
              </li>
            ))}
          </ul>
          <p className='admin-user-answer'>
            User Answer:{" "}
            <span
              className={
                question.userAnswer === question.answer
                  ? "correct"
                  : "incorrect"
              }
            >
              {question.userAnswer || "Not answered yet"}
            </span>
          </p>
        </div>
      );
    } catch (error) {
      return <p>Error parsing question</p>;
    }
  };

  return (
    <div className='battle-container'>
      <div className='battle-side attacker-side'>
        <h2 style={{ color: "orange" }}>Attacker</h2>
        {attackerQuestion &&
          renderQuestion(attackerQuestion, isAttacker, attacker.name, true)}

        {/* Health and Stamina Bars */}
        <div className='warrior-bars'>
          <div className='stat-bar-row'>
            <div className='stat-bar-label'>
              <i className='fas fa-heart'></i> Health
            </div>
            <div className='stat-bar'>
              <div
                className='stat-bar-fill health-bar'
                style={{ width: `${attacker.health}%` }}
              ></div>
            </div>
            {console.log(attacker, defender)}
            <span className='stat-bar-value'>{attacker.health}</span>
          </div>
          <div className='stat-bar-row'>
            <div className='stat-bar-label'>
              <i className='fas fa-bolt'></i> Stamina
            </div>
            <div className='stat-bar'>
              <div
                className='stat-bar-fill stamina-bar'
                style={{ width: `${attacker.stamina}%` }}
              ></div>
            </div>
            <span className='stat-bar-value'>{attacker.stamina}</span>
          </div>
        </div>

        <img
          src={attacker.thumbnail}
          alt={attacker.name}
          className='battle-avatar-image'
        />

        {/* Warrior Name */}
        <p className='warrior-name'>{attacker.name}</p>

        {/* Attack and Defense */}
        <div className='warrior-combat-stats'>
          <div className='combat-stat'>
            <i className='fas fa-sword'></i>
            <span>Attack: {attacker.attack}</span>
          </div>
          <div className='combat-stat'>
            <i className='fas fa-shield'></i>
            <span>Defense: {attacker.defense}</span>
          </div>
        </div>
      </div>

      <div className='battle-side defender-side'>
        <h2 style={{ color: "green" }}>Defender</h2>
        {defenderQuestion &&
          renderQuestion(defenderQuestion, isDefender, defender.name, false)}

        {/* Health and Stamina Bars */}
        <div className='warrior-bars'>
          <div className='stat-bar-row'>
            <div className='stat-bar-label'>
              <i className='fas fa-heart'></i> Health
            </div>
            <div className='stat-bar'>
              <div
                className='stat-bar-fill health-bar'
                style={{ width: `${defender.health}%` }}
              ></div>
            </div>
            <span className='stat-bar-value'>{defender.health}</span>
          </div>
          <div className='stat-bar-row'>
            <div className='stat-bar-label'>
              <i className='fas fa-bolt'></i> Stamina
            </div>
            <div className='stat-bar'>
              <div
                className='stat-bar-fill stamina-bar'
                style={{ width: `${defender.stamina}%` }}
              ></div>
            </div>
            <span className='stat-bar-value'>{defender.stamina}</span>
          </div>
        </div>

        <img
          src={defender.thumbnail}
          alt={defender.name}
          className='battle-avatar-image'
        />

        {/* Warrior Name */}
        <p className='warrior-name'>{defender.name}</p>

        {/* Attack and Defense */}
        <div className='warrior-combat-stats'>
          <div className='combat-stat'>
            <i className='fas fa-sword'></i>
            <span>Attack: {defender.attack}</span>
          </div>
          <div className='combat-stat'>
            <i className='fas fa-shield'></i>
            <span>Defense: {defender.defense}</span>
          </div>
        </div>
      </div>

      {/* Admin Panel */}
      {isAdmin && (
        <div className='admin-battle-panel'>
          <h3>Admin Panel</h3>
          <div className='admin-questions-container'>
            {renderAdminQuestion(
              attackerQuestion,
              `${attacker.name}'s Question`
            )}
            {renderAdminQuestion(
              defenderQuestion,
              `${defender.name}'s Question`
            )}
          </div>
          <button
            className='complete-battle-btn'
            onClick={handleCompleteBattle}
          >
            Complete Battle
          </button>
        </div>
      )}
    </div>
  );
}

export default Battle;
