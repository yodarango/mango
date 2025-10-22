import { useState } from "react";
import "./StoreItemCard.css";

function StoreItemCard({ item, userCoins, userLevel, purchasing, onPurchase }) {
  const [showDetails, setShowDetails] = useState(false);
  const canAfford = userCoins >= item.cost;
  const meetsLevelRequirement = userLevel >= item.requiredLevel;
  const isLocked = !meetsLevelRequirement;
  const overallPower = item.attack + item.defense + item.healing;

  const handleCardClick = (e) => {
    // Don't open popup if clicking the purchase button
    if (e.target.closest(".purchase-btn")) {
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

          <div className='stat-row total-power'>
            <i className='fa-solid fa-bolt'></i>
            <span className='stat-label'>Overall Power:</span>
            <span className='stat-value'>{overallPower}</span>
          </div>

          <div className='store-item-footer'>
            <div className='item-price'>
              <i className='fa-solid fa-coins'></i>
              <span className='price-amount'>{item.cost}</span>
              <span className='price-label'>coins</span>
            </div>
            <button
              className={`purchase-btn ${
                isLocked && canAfford ? "btn-locked-yellow" : ""
              }`}
              onClick={handlePurchaseClick}
              disabled={isLocked || !canAfford || purchasing === item.name}
            >
              {purchasing === item.name ? (
                <>
                  <i className='fa-solid fa-spinner fa-spin'></i> Purchasing...
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
          </div>

          <div className='click-hint'>
            <i className='fa-solid fa-circle-info'></i> Click for details
          </div>
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

                <div className='stat-row'>
                  <i className='fa-solid fa-heart-pulse'></i>
                  <span className='stat-label'>Health:</span>
                  <span className='stat-value'>{item.health}</span>
                </div>

                <div className='stat-row'>
                  <i className='fa-solid fa-running'></i>
                  <span className='stat-label'>Stamina:</span>
                  <span className='stat-value'>{item.stamina}</span>
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
        </div>
      )}
    </>
  );
}

export default StoreItemCard;
