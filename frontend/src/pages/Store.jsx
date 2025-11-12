import { useState, useEffect } from "react";
import "./Store.css";
import StoreGrid from "../components/StoreGrid";

function Store() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCoins, setUserCoins] = useState(0);
  const [userLevel, setUserLevel] = useState(0);
  const [userAvatarId, setUserAvatarId] = useState(null);
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
        setUserAvatarId(userAvatar.id);
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

  const handlePurchase = async (itemName, itemCost, requiredLevel) => {
    if (userLevel < requiredLevel) {
      alert(`You need to be level ${requiredLevel} to purchase this item!`);
      return;
    }

    if (userCoins < itemCost) {
      alert("Not enough coins!");
      return;
    }

    setPurchasing(itemName);

    try {
      const token = localStorage.getItem("token");
      console.log("Token:", token ? "exists" : "missing");
      console.log("Purchasing item:", itemName);

      const response = await fetch("/api/store/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assetName: itemName }),
      });

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

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

      <StoreGrid
        items={items}
        userCoins={userCoins}
        userLevel={userLevel}
        userAvatarId={userAvatarId}
        purchasing={purchasing}
        onPurchase={handlePurchase}
      />
    </div>
  );
}

export default Store;
