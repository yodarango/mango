import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Battle.css";

function Battle() {
  const { id } = useParams();
  const [battle, setBattle] = useState(null);
  const [attacker, setAttacker] = useState(null);
  const [defender, setDefender] = useState(null);
  const [attackerQuestion, setAttackerQuestion] = useState(null);
  const [defenderQuestion, setDefenderQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBattle();
  }, [id]);

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
      setLoading(false);
    } catch (error) {
      console.error("Error fetching battle:", error);
      setLoading(false);
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

  const renderQuestion = (question) => {
    if (!question) return null;

    try {
      const questionData = JSON.parse(question.question);
      return (
        <div className='battle-question'>
          <p className='question-text'>{questionData.question}</p>
          <ul className='question-options'>
            {questionData.options.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
        </div>
      );
    } catch (error) {
      console.error("Error parsing question:", error);
      return null;
    }
  };

  return (
    <div className='battle-container'>
      <div className='battle-side attacker-side'>
        {attackerQuestion && renderQuestion(attackerQuestion)}
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
        </div>
      </div>

      <div className='battle-side defender-side'>
        {defenderQuestion && renderQuestion(defenderQuestion)}
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
        </div>
      </div>
    </div>
  );
}

export default Battle;

left of in here. I need to have a periodic check so that when a battle is marked as comlpete the useris taken back to the game and the game is ReadableStreamDefaultReader. 
the next thing to do is to allow the user to select the answer