import { useState, useEffect } from "react";
import "./Store.css";

function Store() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoreItems();
  }, []);

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
      </div>

      <div className='store-grid'>
        {items.map((item) => (
          <div key={item.id} className='store-item-card'>
            {item.thumbnail && (
              <div className='store-item-image'>
                <img src={item.thumbnail} alt={item.name} />
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
                <button className='purchase-btn'>
                  <i className='fa-solid fa-cart-shopping'></i> Purchase
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Store;
