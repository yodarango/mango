import React, { useState, useEffect } from "react";
import "./RewardModal.css";

export function RewardModal({
  isOpen,
  onClose,
  streakMilestone,
  rewardAsset,
  onClaimReward,
}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentEmoji, setCurrentEmoji] = useState("🎁");
  const [finalPrize, setFinalPrize] = useState(null);
  const [prizes, setPrizes] = useState([]);

  const emojis = [
    "💰",
    "🤑",
    "🦏",
    "🎁",
    "💸",
    "🐉",
    "💥",
    "💪",
    "✨",
    "🦄",
    "🔥",
    "💵",
    "⭐️",
    "🐊",
    "🏆",
    "🦁",
  ];

  useEffect(() => {
    if (isOpen && !isSpinning && !finalPrize) {
      // Generate prizes when modal opens
      generatePrizes();
    }
  }, [isOpen]);

  const generatePrizes = () => {
    const newPrizes = [];
    const baseLow = 5;
    const baseHigh = 10;
    const coinBaseLow = 30;
    const coinBaseHigh = 50;

    // Generate 5 XP prizes
    for (let i = 0; i < 5; i++) {
      const xpAmount = Math.floor(
        Math.random() *
          (baseHigh * streakMilestone - baseLow * streakMilestone + 1) +
          baseLow * streakMilestone
      );
      newPrizes.push({ type: "xp", amount: xpAmount, emoji: "⭐" });
    }

    // Generate 5 coin prizes
    for (let i = 0; i < 5; i++) {
      const coinAmount = Math.floor(
        Math.random() *
          (coinBaseHigh * streakMilestone - coinBaseLow * streakMilestone + 1) +
          coinBaseLow * streakMilestone
      );
      newPrizes.push({ type: "coins", amount: coinAmount, emoji: "💰" });
    }

    // Add 1 asset prize
    if (rewardAsset) {
      newPrizes.push({
        type: "asset",
        asset: rewardAsset,
        emoji: "🏆",
      });
    }

    setPrizes(newPrizes);
  };

  const startRoulette = () => {
    setIsSpinning(true);
    let counter = 0;
    const duration = 5000; // 5 seconds
    const intervalTime = 100; // Change emoji every 100ms

    const interval = setInterval(() => {
      setCurrentEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
      counter += intervalTime;

      if (counter >= duration) {
        clearInterval(interval);
        // Pick random prize
        const selectedPrize = prizes[Math.floor(Math.random() * prizes.length)];
        setFinalPrize(selectedPrize);
        setCurrentEmoji(selectedPrize.emoji);
        setIsSpinning(false);

        // Log to console
        console.log("Prize won:", selectedPrize);
      }
    }, intervalTime);
  };

  const handleClose = () => {
    if (finalPrize) {
      onClaimReward(streakMilestone);
    }
    setFinalPrize(null);
    setIsSpinning(false);
    setCurrentEmoji("🎁");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='reward-modal-overlay' onClick={handleClose}>
      <div
        className='reward-modal-content'
        onClick={(e) => e.stopPropagation()}
      >
        <button className='reward-modal-close' onClick={handleClose}>
          ×
        </button>

        <h2>🎉 Streak Reward!</h2>
        <p>You've completed {streakMilestone} assignments in a row!</p>

        {!finalPrize && !isSpinning && (
          <div className='reward-modal-start'>
            <div className='emoji-display'>{currentEmoji}</div>
            <button className='try-luck-button' onClick={startRoulette}>
              Try Your Luck!
            </button>
          </div>
        )}

        {isSpinning && (
          <div className='reward-modal-spinning'>
            <div className='emoji-display spinning'>{currentEmoji}</div>
            <p>Spinning...</p>
          </div>
        )}

        {finalPrize && (
          <div className='reward-modal-result'>
            <div className='emoji-display winner'>{currentEmoji}</div>
            <h3>You Won!</h3>
            {finalPrize.type === "xp" && (
              <p className='prize-text'>⭐ {finalPrize.amount} XP</p>
            )}
            {finalPrize.type === "coins" && (
              <p className='prize-text'>💰 {finalPrize.amount} Coins</p>
            )}
            {finalPrize.type === "asset" && (
              <div className='prize-asset'>
                <p className='prize-text'>🏆 {finalPrize.asset.name}</p>
                <img
                  src={finalPrize.asset.thumbnail}
                  alt={finalPrize.asset.name}
                  className='prize-asset-image'
                />
              </div>
            )}
            <button className='claim-button' onClick={handleClose}>
              Claim Reward
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RewardModal;
