import { useState, useEffect } from "react";
import "./Store.css";

function Store() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCoins, setUserCoins] = useState(0);
  const [userLevel, setUserLevel] = useState(0);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    fetchStoreItems();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;

      // Get user's avatar to find coins and level
      const response = await fetch("/api/avatars");
      const avatars = await response.json();

      const userAvatar = avatars.find((a) => a.userId === user.id);

      if (userAvatar) {
        setUserCoins(userAvatar.coins || 0);
        setUserLevel(userAvatar.level || 1);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchStoreItems = async () => {
    try {
      const response = await fetch("/api/store");
      const data = await response.json();
      setItems(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching store items:", error);
      setLoading(false);
    }
  };

  const handlePurchase = async (itemType, itemCost, requiredLevel) => {
    if (userLevel < requiredLevel) {
      alert(`You need to be level ${requiredLevel} to purchase this item!`);
      return;
    }

    if (userCoins < itemCost) {
      alert("Not enough coins!");
      return;
    }

    setPurchasing(itemType);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/store/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assetType: itemType }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(data.message);
        setUserCoins(data.coins);
        // Refresh store items to get updated counts
        fetchStoreItems();
      } else {
        alert(data.message || "Purchase failed");
      }
    } catch (error) {
      console.error("Error purchasing item:", error);
      alert("Error purchasing item");
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className='loading-container'>
        <div className='loading-spinner'></div>
        <p>Loading store items...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className='empty-store'>
        <h2>Store is Empty</h2>
        <p>No items available for purchase at the moment.</p>
      </div>
    );
  }

  return (
    <div className='store-container'>
      <div className='store-header'>
        <h1>
          <i className='fa-solid fa-store'></i> Item Store
        </h1>
        <p className='store-subtitle'>
          Purchase powerful items for your avatar
        </p>
        <div className='user-stats-display'>
          <div className='user-coins-display'>
            <i className='fa-solid fa-coins'></i>
            <span className='coins-amount'>{userCoins}</span>
            <span className='coins-label'>coins</span>
          </div>
          <div className='user-level-display'>
            <i className='fa-solid fa-star'></i>
            <span className='level-amount'>Level {userLevel}</span>
          </div>
        </div>
      </div>

      <div className='store-grid'>
        {items.map((item) => {
          const canAfford = userCoins >= item.cost;
          const meetsLevelRequirement = userLevel >= item.requiredLevel;
          const isLocked = !meetsLevelRequirement;

          return (
            <div
              key={item.type}
              className={`store-item-card ${!canAfford ? "unaffordable" : ""}`}
            >
              {item.thumbnail && (
                <div className='store-item-image'>
                  <img src={item.thumbnail} alt={item.name} />
                  {isLocked && (
                    <div
                      className={`lock-overlay ${
                        canAfford ? "lock-yellow" : ""
                      }`}
                    >
                      <i className='fa-solid fa-lock'></i>
                    </div>
                  )}
                </div>
              )}

              <div className='store-item-details'>
                <h3>{item.name}</h3>

                <div className='store-item-stats'>
                  <div className='stat-row'>
                    <i className='fa-solid fa-sword'></i>
                    <span className='stat-label'>Attack:</span>
                    <span className='stat-value'>{item.attack}</span>
                  </div>

                  <div className='stat-row'>
                    <i className='fa-solid fa-shield'></i>
                    <span className='stat-label'>Defense:</span>
                    <span className='stat-value'>{item.defense}</span>
                  </div>

                  <div className='stat-row'>
                    <i className='fa-solid fa-heart'></i>
                    <span className='stat-label'>Healing:</span>
                    <span className='stat-value'>{item.healing}</span>
                  </div>

                  <div className='stat-row'>
                    <i className='fa-solid fa-fire'></i>
                    <span className='stat-label'>Power:</span>
                    <span className='stat-value'>{item.power}</span>
                  </div>

                  <div className='stat-row'>
                    <i className='fa-solid fa-dumbbell'></i>
                    <span className='stat-label'>Endurance:</span>
                    <span className='stat-value'>{item.endurance}</span>
                  </div>

                  <div className='stat-row'>
                    <i className='fa-solid fa-star'></i>
                    <span className='stat-label'>Level:</span>
                    <span className='stat-value'>{item.level}</span>
                  </div>

                  <div className='stat-row total-power'>
                    <i className='fa-solid fa-bolt'></i>
                    <span className='stat-label'>Overall Power:</span>
                    <span className='stat-value'>
                      {item.attack + item.defense + item.healing}
                    </span>
                  </div>
                </div>

                {item.ability && (
                  <div className='store-item-ability'>
                    <i className='fa-solid fa-wand-magic-sparkles'></i>
                    <span className='ability-label'>Ability:</span>
                    <span className='ability-name'>{item.ability}</span>
                  </div>
                )}

                <div className='store-item-footer'>
                  <div className='item-price'>
                    <i className='fa-solid fa-coins'></i>
                    <span className='price-amount'>{item.cost}</span>
                    <span className='price-label'>coins</span>
                  </div>
                  <div className='item-stock'>
                    <i className='fa-solid fa-box'></i>
                    <span className='stock-amount'>{item.availableUnits}</span>
                    <span className='stock-label'>in stock</span>
                  </div>
                  <button
                    className={`purchase-btn ${
                      isLocked && canAfford ? "btn-locked-yellow" : ""
                    }`}
                    onClick={() =>
                      handlePurchase(item.type, item.cost, item.requiredLevel)
                    }
                    disabled={
                      isLocked || !canAfford || purchasing === item.type
                    }
                  >
                    {purchasing === item.type ? (
                      <>
                        <i className='fa-solid fa-spinner fa-spin'></i>{" "}
                        Purchasing...
                      </>
                    ) : isLocked ? (
                      <>
                        <i className='fa-solid fa-lock'></i> Locked until level{" "}
                        {item.requiredLevel}
                      </>
                    ) : (
                      <>
                        <i className='fa-solid fa-cart-shopping'></i> Purchase
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Store;
