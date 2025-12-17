import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Battle.css";

function Battle() {
  const { id } = useParams();
  const [battle, setBattle] = useState(null);
  const [attacker, setAttacker] = useState(null);
  const [defender, setDefender] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBattle();
  }, [id]);

  const fetchBattle = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch battle details
      const battleResponse = await fetch(`/api/battles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const battleData = await battleResponse.json();
      setBattle(battleData);

      // Fetch attacker avatar details
      if (battleData.attacker) {
        const attackerResponse = await fetch(`/api/avatars/${battleData.attacker}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const attackerData = await attackerResponse.json();
        setAttacker(attackerData);
      }

      // Fetch defender avatar details
      if (battleData.defender) {
        const defenderResponse = await fetch(`/api/avatars/${battleData.defender}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const defenderData = await defenderResponse.json();
        setDefender(defenderData);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching battle:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="battle-loading">Loading battle...</div>;
  }

  if (!battle || !attacker || !defender) {
    return <div className="battle-error">Battle not found</div>;
  }

  return (
    <div className="battle-container">
      <div className="battle-side attacker-side">
        <img
          src={attacker.thumbnail}
          alt={attacker.avatarName}
          className="battle-avatar-image"
        />
        <div className="battle-stats">
          <p className="stat-name">{attacker.avatarName}</p>
          <p className="stat-item">Power: {attacker.power}</p>
          <p className="stat-item">Attack: {attacker.attack}</p>
          <p className="stat-item">Defense: {attacker.defense}</p>
          <p className="stat-item">Health: {attacker.health}</p>
        </div>
      </div>

      <div className="battle-side defender-side">
        <img
          src={defender.thumbnail}
          alt={defender.avatarName}
          className="battle-avatar-image"
        />
        <div className="battle-stats">
          <p className="stat-name">{defender.avatarName}</p>
          <p className="stat-item">Power: {defender.power}</p>
          <p className="stat-item">Attack: {defender.attack}</p>
          <p className="stat-item">Defense: {defender.defense}</p>
          <p className="stat-item">Health: {defender.health}</p>
        </div>
      </div>
    </div>
  );
}

export default Battle;

