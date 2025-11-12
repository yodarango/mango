import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import "./AssetProfile.css";

function AssetProfile() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const requesterId = searchParams.get("requesterId");

  const [asset, setAsset] = useState(null);
  const [viewType, setViewType] = useState(null);
  const [ownerName, setOwnerName] = useState(null);
  const [canApprove, setCanApprove] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch asset details with ownership context
        const assetResponse = await fetch(`/api/assets/${id}/request`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!assetResponse.ok) {
          throw new Error("Failed to fetch asset details");
        }

        const data = await assetResponse.json();
        setAsset(data.asset);
        setViewType(data.viewType);
        setOwnerName(data.ownerName);
        setCanApprove(data.canApprove);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, requesterId]);

  const handleApprove = async () => {
    if (!requesterId) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/assets/${id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requesterId: parseInt(requesterId),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Access approved successfully!");
        window.location.href = "/messages";
      } else {
        alert(data.message || "Failed to approve access");
      }
    } catch (error) {
      console.error("Error approving access:", error);
      alert("Error approving access");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeny = async () => {
    if (!requesterId) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/assets/${id}/deny`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requesterId: parseInt(requesterId),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Access denied.");
        window.location.href = "/messages";
      } else {
        alert(data.message || "Failed to deny access");
      }
    } catch (error) {
      console.error("Error denying access:", error);
      alert("Error denying access");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className='asset-profile-container'>
        <div className='loading'>
          <i className='fa-solid fa-spinner fa-spin'></i> Loading asset
          details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='asset-profile-container'>
        <div className='error'>
          <i className='fa-solid fa-exclamation-triangle'></i> {error}
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className='asset-profile-container'>
        <div className='error'>Asset not found</div>
      </div>
    );
  }

  const overallPower = asset.attack + asset.defense + asset.healing;

  return (
    <div className='asset-profile-container'>
      <div className='asset-profile-card'>
        {/* Header with status message */}
        <div className='asset-profile-header'>
          <h1>{asset.name}</h1>
          <span className='asset-type'>{asset.type}</span>
        </div>

        {/* Status banner based on viewType */}
        {viewType === "owned" && ownerName && (
          <div className='asset-status-banner owned'>
            <i className='fa-solid fa-user'></i>
            <span>
              This asset belongs to <strong>{ownerName}</strong>
            </span>
          </div>
        )}

        {viewType === "unlocked" && (
          <div className='asset-status-banner unlocked'>
            <i className='fa-solid fa-unlock'></i>
            <span>This asset is unlocked and available in the store</span>
          </div>
        )}

        {asset.thumbnail && (
          <div className='asset-profile-image'>
            <img src={asset.thumbnail} alt={asset.name} />
          </div>
        )}

        <div className='asset-profile-stats'>
          <div className='stat-row'>
            <i className='fa-solid fa-sword'></i>
            <span className='stat-label'>Attack:</span>
            <span className='stat-value'>{asset.attack}</span>
          </div>

          <div className='stat-row'>
            <i className='fa-solid fa-shield'></i>
            <span className='stat-label'>Defense:</span>
            <span className='stat-value'>{asset.defense}</span>
          </div>

          <div className='stat-row'>
            <i className='fa-solid fa-heart'></i>
            <span className='stat-label'>Healing:</span>
            <span className='stat-value'>{asset.healing}</span>
          </div>

          <div className='stat-row'>
            <i className='fa-solid fa-fire'></i>
            <span className='stat-label'>Power:</span>
            <span className='stat-value'>{asset.power}</span>
          </div>

          <div className='stat-row'>
            <i className='fa-solid fa-dumbbell'></i>
            <span className='stat-label'>Endurance:</span>
            <span className='stat-value'>{asset.endurance}</span>
          </div>

          <div className='stat-row'>
            <i className='fa-solid fa-star'></i>
            <span className='stat-label'>Level:</span>
            <span className='stat-value'>{asset.level}</span>
          </div>

          <div className='stat-row'>
            <i className='fa-solid fa-lock'></i>
            <span className='stat-label'>Required Level:</span>
            <span className='stat-value'>{asset.requiredLevel}</span>
          </div>

          <div className='stat-row'>
            <i className='fa-solid fa-coins'></i>
            <span className='stat-label'>Cost:</span>
            <span className='stat-value'>{asset.cost}</span>
          </div>

          <div className='stat-row total-power'>
            <i className='fa-solid fa-bolt'></i>
            <span className='stat-label'>Overall Power:</span>
            <span className='stat-value'>{overallPower}</span>
          </div>
        </div>

        {asset.ability && (
          <div className='asset-ability'>
            <i className='fa-solid fa-wand-magic-sparkles'></i>
            <span className='ability-label'>Ability:</span>
            <span className='ability-name'>{asset.ability}</span>
          </div>
        )}

        {viewType === "approve_deny" && canApprove && requesterId && (
          <div className='approval-section'>
            <div className='requester-info'>
              <i className='fa-solid fa-bell'></i>
              <span>A user has requested access to this asset</span>
            </div>
            <div className='approval-buttons'>
              <button
                className='approve-btn'
                onClick={handleApprove}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <i className='fa-solid fa-spinner fa-spin'></i>{" "}
                    Processing...
                  </>
                ) : (
                  <>
                    <i className='fa-solid fa-check'></i> Approve
                  </>
                )}
              </button>
              <button
                className='deny-btn'
                onClick={handleDeny}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <i className='fa-solid fa-spinner fa-spin'></i>{" "}
                    Processing...
                  </>
                ) : (
                  <>
                    <i className='fa-solid fa-times'></i> Deny
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssetProfile;
