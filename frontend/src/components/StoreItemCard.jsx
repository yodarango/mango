import { useState } from "react";
import "./StoreItemCard.css";

function StoreItemCard({
  item,
  userCoins,
  userLevel,
  userAvatarId,
  purchasing,
  onPurchase,
  alwasyActive,
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const canAfford = userCoins >= item.cost || alwasyActive;
  const meetsLevelRequirement = userLevel >= item.requiredLevel;
  const isLocked =
    (item.isLocked && !alwasyActive) ||
    (!meetsLevelRequirement && !alwasyActive);
  const overallPower = item.attack + item.defense + item.healing;

  // Check if item is locked by someone else
  const isLockedByOther =
    item.isLockedBy && item.isLockedBy > 0 && item.isLockedBy !== userAvatarId;
  const isUnlockedForUser = item.isUnlockedFor === userAvatarId;

  const handleCardClick = (e) => {
    // Don't open popup if clicking the purchase button
    if (e.target.closest(".purchase-btn") || e.target.closest(".request-btn")) {
      return;
    }
    setShowDetails(true);
  };

  const handleClosePopup = () => {
    setShowDetails(false);
  };

  const handlePurchaseClick = (e) => {
    e.stopPropagation();
    onPurchase(item.name, item.cost, item.requiredLevel);
  };

  const handleRequestAccess = async (e) => {
    e.stopPropagation();
    setRequesting(true);

    try {
      const token = localStorage.getItem("token");

      const requestResponse = await fetch("/api/assets/request-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assetId: item.id,
        }),
      });

      const data = await requestResponse.json();

      if (requestResponse.ok && data.success) {
        alert("Access request sent successfully!");
      } else {
        alert(data.message || "Failed to send access request");
      }
    } catch (error) {
      console.error("Error requesting access:", error);
      alert("Error requesting access");
    } finally {
      setRequesting(false);
    }
  };

  return (
    <>
      <div
        className={`store-item-card ${!canAfford ? "unaffordable" : ""}`}
        onClick={handleCardClick}
      >
        {item.thumbnail && (
          <div className='store-item-image'>
            <img src={item.thumbnail} alt={item.name} />
            {isLocked && (
              <div className={`lock-overlay ${canAfford ? "lock-yellow" : ""}`}>
                <i className='fa-solid fa-lock'></i>
              </div>
            )}
          </div>
        )}

        <div className='store-item-details'>
          <h3>{item.name}</h3>

          <div className='compact-stats'>
            <div className='compact-stat'>
              <i className='fa-solid fa-bolt'></i>
              <span className='compact-value'>{overallPower}</span>
            </div>
            {onPurchase ? (
              <div className='compact-stat'>
                <i className='fa-solid fa-coins'></i>
                <span className='compact-value'>{item.cost}</span>
              </div>
            ) : (
              <div></div>
            )}
          </div>

          {onPurchase && (
            <div className='store-item-footer'>
              {isLockedByOther && !isUnlockedForUser ? (
                <button
                  className='request-btn'
                  onClick={handleRequestAccess}
                  disabled={requesting}
                >
                  {requesting ? (
                    <>
                      <i className='fa-solid fa-spinner fa-spin'></i>{" "}
                      Requesting...
                    </>
                  ) : (
                    <>
                      <i className='fa-solid fa-key'></i> Request Access
                    </>
                  )}
                </button>
              ) : (
                <button
                  className={`purchase-btn ${
                    isLocked && canAfford ? "btn-locked-yellow" : ""
                  }`}
                  onClick={handlePurchaseClick}
                  disabled={isLocked || !canAfford || purchasing === item.name}
                >
                  {purchasing === item.name ? (
                    <>
                      <i className='fa-solid fa-spinner fa-spin'></i>{" "}
                      Purchasing...
                    </>
                  ) : isLocked ? (
                    <>
                      <i className='fa-solid fa-lock'></i> Level{" "}
                      {item.requiredLevel}
                    </>
                  ) : (
                    <>
                      <i className='fa-solid fa-cart-shopping'></i> Purchase
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showDetails && (
        <div className='popup-overlay' onClick={handleClosePopup}>
          <div className='popup-content' onClick={(e) => e.stopPropagation()}>
            <button className='popup-close' onClick={handleClosePopup}>
              <i className='fa-solid fa-times'></i>
            </button>

            <div className='popup-header'>
              {item.thumbnail && (
                <div className='popup-image'>
                  <img src={item.thumbnail} alt={item.name} />
                </div>
              )}
              <h2>{item.name}</h2>
            </div>

            <div className='popup-body'>
              <div className='store-item-stats'>
                <div className='stat-row'>
                  <i className='fa-solid fa-sword'></i>
                  <span className='stat-label'>Attack:</span>
                  <div className='stat-bar-container'>
                    <div
                      className='stat-bar'
                      style={{ width: `${(item.attack / 10000) * 100}%` }}
                    ></div>
                    <span className='stat-value'>{item.attack}</span>
                  </div>
                </div>

                <div className='stat-row'>
                  <i className='fa-solid fa-shield'></i>
                  <span className='stat-label'>Defense:</span>
                  <div className='stat-bar-container'>
                    <div
                      className='stat-bar'
                      style={{ width: `${(item.defense / 10000) * 100}%` }}
                    ></div>
                    <span className='stat-value'>{item.defense}</span>
                  </div>
                </div>

                <div className='stat-row'>
                  <i className='fa-solid fa-heart'></i>
                  <span className='stat-label'>Healing:</span>
                  <div className='stat-bar-container'>
                    <div
                      className='stat-bar'
                      style={{ width: `${(item.healing / 10000) * 100}%` }}
                    ></div>
                    <span className='stat-value'>{item.healing}</span>
                  </div>
                </div>

                <div className='stat-row'>
                  <i className='fa-solid fa-star'></i>
                  <span className='stat-label'>Level:</span>
                  <div className='stat-bar-container'>
                    <div
                      className='stat-bar'
                      style={{ width: `${(item.level / 10) * 100}%` }}
                    ></div>
                    <span className='stat-value'>{item.level}</span>
                  </div>
                </div>

                <div className='stat-row'>
                  <i className='fa-solid fa-heart-pulse'></i>
                  <span className='stat-label'>Health:</span>
                  <div className='stat-bar-container'>
                    <div
                      className='stat-bar'
                      style={{ width: `${(item.health / 100) * 100}%` }}
                    ></div>
                    <span className='stat-value'>{item.health}</span>
                  </div>
                </div>

                <div className='stat-row'>
                  <i className='fa-solid fa-chart-line'></i>
                  <span className='stat-label'>XP:</span>
                  <div className='stat-bar-container'>
                    <div
                      className='stat-bar'
                      style={{
                        width: `${
                          ((item.xp || 0) / (item.xpRequired || 100)) * 100
                        }%`,
                      }}
                    ></div>
                    <span className='stat-value'>
                      {item.xp || 0} / {item.xpRequired || 100}
                    </span>
                  </div>
                </div>

                <div className='stat-row total-power'>
                  <i className='fa-solid fa-bolt'></i>
                  <span className='stat-label'>Overall Power:</span>
                  <span className='stat-value'>{overallPower}</span>
                </div>
              </div>

              {item.ability && (
                <div className='store-item-ability'>
                  <i className='fa-solid fa-wand-magic-sparkles'></i>
                  <span className='ability-label'>Ability:</span>
                  <span className='ability-name'>{item.ability}</span>
                </div>
              )}

              {onPurchase && (
                <div className='popup-footer'>
                  <div className='item-stock'>
                    <i className='fa-solid fa-box'></i>
                    <span className='stock-amount'>{item.availableUnits}</span>
                    <span className='stock-label'>in stock</span>
                  </div>
                  <div className='item-price'>
                    <i className='fa-solid fa-coins'></i>
                    <span className='price-amount'>{item.cost}</span>
                    <span className='price-label'>coins</span>
                  </div>

                  {isLockedByOther && !isUnlockedForUser ? (
                    <button
                      className='request-btn'
                      onClick={handleRequestAccess}
                      disabled={requesting}
                    >
                      {requesting ? (
                        <>
                          <i className='fa-solid fa-spinner fa-spin'></i>{" "}
                          Requesting...
                        </>
                      ) : (
                        <>
                          <i className='fa-solid fa-key'></i> Request Access
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      className={`purchase-btn ${
                        isLocked && canAfford ? "btn-locked-yellow" : ""
                      }`}
                      onClick={handlePurchaseClick}
                      disabled={
                        isLocked || !canAfford || purchasing === item.name
                      }
                    >
                      {purchasing === item.name ? (
                        <>
                          <i className='fa-solid fa-spinner fa-spin'></i>{" "}
                          Purchasing...
                        </>
                      ) : isLocked ? (
                        <>
                          <i className='fa-solid fa-lock'></i> Locked until
                          level {item.requiredLevel}
                        </>
                      ) : (
                        <>
                          <i className='fa-solid fa-cart-shopping'></i> Purchase
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default StoreItemCard;
