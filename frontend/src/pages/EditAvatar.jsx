import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EditAvatar.css";

function EditAvatar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState({
    name: "",
    avatarName: "",
    thumbnail: "",
    coins: 0,
    level: 1,
    requiredLevel: 0,
    element: "",
    superPower: "",
    personality: "",
    weakness: "",
    animalAlly: "",
    mascot: "",
  });

  const elements = [
    "Fire 🔥",
    "Water 💧",
    "Electricity ⚡️",
    "Earth 🌱",
    "Wind 🌬️",
    "Time 🕥",
    "Light 🌞",
    "Metal 🪨",
  ];

  const superPowers = [
    "Flying",
    "Invisibility",
    "Super strength",
    "Reading minds",
    "Super speed",
    "Walking through walls",
  ];

  const personalities = [
    "Smart 🧠",
    "Athletic 🏃",
    "Creative 🖌️",
    "Popular 👔",
  ];

  const weaknesses = ["Lazy", "Forgetful", "Clumsy", "Distrustful"];

  const animalAllies = [
    "Water animals 🦈",
    "Feline animals 🐺",
    "Big animals 🦏",
    "Air animals 🦅",
    "Reptiles 🐊",
    "Insects 🦂",
  ];

  useEffect(() => {
    fetchAvatar();
  }, [id]);

  const fetchAvatar = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/avatars/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch avatar");
      }

      const data = await response.json();
      setAvatar({
        name: data.name || "",
        avatarName: data.avatarName || "",
        thumbnail: data.thumbnail || "",
        coins: data.coins || 0,
        level: data.level || 1,
        requiredLevel: data.requiredLevel || 0,
        element: data.element || "",
        superPower: data.superPower || "",
        personality: data.personality || "",
        weakness: data.weakness || "",
        animalAlly: data.animalAlly || "",
        mascot: data.mascot || "",
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching avatar:", error);
      alert("Failed to load avatar");
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setAvatar((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!avatar.name || !avatar.avatarName) {
      alert("Name and Avatar Name are required");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/avatars/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(avatar),
      });

      if (response.ok) {
        alert("Avatar updated successfully!");
        navigate(`/avatar/${id}`);
      } else {
        const error = await response.text();
        alert(`Failed to update avatar: ${error}`);
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
      alert("Error updating avatar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading avatar...</p>
      </div>
    );
  }

  return (
    <div className="edit-avatar-container">
      <div className="edit-avatar-header">
        <h1>
          <i className="fa-solid fa-pen-to-square"></i> Edit Avatar
        </h1>
        <p className="avatar-id">ID: {id}</p>
      </div>

      <div className="avatar-form">
        <div className="form-section">
          <h2>
            <i className="fa-solid fa-user"></i> Basic Information
          </h2>

          <div className="form-group">
            <label>
              <i className="fa-solid fa-signature"></i> Student Name
            </label>
            <input
              type="text"
              value={avatar.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter student name"
            />
          </div>

          <div className="form-group">
            <label>
              <i className="fa-solid fa-mask"></i> Avatar Name
            </label>
            <input
              type="text"
              value={avatar.avatarName}
              onChange={(e) => handleInputChange("avatarName", e.target.value)}
              placeholder="Enter avatar name"
            />
          </div>

          <div className="form-group">
            <label>
              <i className="fa-solid fa-image"></i> Thumbnail URL
            </label>
            <input
              type="text"
              value={avatar.thumbnail}
              onChange={(e) => handleInputChange("thumbnail", e.target.value)}
              placeholder="Enter thumbnail URL"
            />
            {avatar.thumbnail && (
              <div className="thumbnail-preview">
                <img src={avatar.thumbnail} alt="Avatar preview" />
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <h2>
            <i className="fa-solid fa-chart-line"></i> Stats
          </h2>

          <div className="form-row">
            <div className="form-group">
              <label>
                <i className="fa-solid fa-coins"></i> Coins
              </label>
              <input
                type="number"
                value={avatar.coins}
                onChange={(e) =>
                  handleInputChange("coins", parseInt(e.target.value) || 0)
                }
                min="0"
              />
            </div>

            <div className="form-group">
              <label>
                <i className="fa-solid fa-star"></i> Level
              </label>
              <input
                type="number"
                value={avatar.level}
                onChange={(e) =>
                  handleInputChange("level", parseInt(e.target.value) || 1)
                }
                min="1"
              />
            </div>

            <div className="form-group">
              <label>
                <i className="fa-solid fa-lock"></i> Required Level
              </label>
              <input
                type="number"
                value={avatar.requiredLevel}
                onChange={(e) =>
                  handleInputChange(
                    "requiredLevel",
                    parseInt(e.target.value) || 0
                  )
                }
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>
            <i className="fa-solid fa-wand-magic-sparkles"></i> Attributes
          </h2>

          <div className="form-group">
            <label>
              <i className="fa-solid fa-fire"></i> Element
            </label>
            <select
              value={avatar.element}
              onChange={(e) => handleInputChange("element", e.target.value)}
            >
              <option value="">Select element</option>
              {elements.map((elem) => (
                <option key={elem} value={elem}>
                  {elem}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <i className="fa-solid fa-bolt"></i> Super Power
            </label>
            <select
              value={avatar.superPower}
              onChange={(e) => handleInputChange("superPower", e.target.value)}
            >
              <option value="">Select super power</option>
              {superPowers.map((power) => (
                <option key={power} value={power}>
                  {power}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <i className="fa-solid fa-brain"></i> Personality
            </label>
            <select
              value={avatar.personality}
              onChange={(e) => handleInputChange("personality", e.target.value)}
            >
              <option value="">Select personality</option>
              {personalities.map((pers) => (
                <option key={pers} value={pers}>
                  {pers}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <i className="fa-solid fa-heart-crack"></i> Weakness
            </label>
            <select
              value={avatar.weakness}
              onChange={(e) => handleInputChange("weakness", e.target.value)}
            >
              <option value="">Select weakness</option>
              {weaknesses.map((weak) => (
                <option key={weak} value={weak}>
                  {weak}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <i className="fa-solid fa-paw"></i> Animal Ally
            </label>
            <select
              value={avatar.animalAlly}
              onChange={(e) => handleInputChange("animalAlly", e.target.value)}
            >
              <option value="">Select animal ally</option>
              {animalAllies.map((ally) => (
                <option key={ally} value={ally}>
                  {ally}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <i className="fa-solid fa-dragon"></i> Mascot
            </label>
            <input
              type="text"
              value={avatar.mascot}
              onChange={(e) => handleInputChange("mascot", e.target.value)}
              placeholder="Enter mascot"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            className="cancel-btn"
            onClick={() => navigate(`/avatar/${id}`)}
          >
            <i className="fa-solid fa-times"></i> Cancel
          </button>
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            <i className="fa-solid fa-save"></i>{" "}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditAvatar;

