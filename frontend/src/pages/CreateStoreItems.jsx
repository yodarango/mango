import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateStoreItems.css";

function CreateStoreItems() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [inserting, setInserting] = useState(false);

  // Step 1 state
  const [folderPath, setFolderPath] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Step 2 state
  const [type, setType] = useState("");
  const [adhFrom, setAdhFrom] = useState("");
  const [adhPlus, setAdhPlus] = useState("");
  const [isLocked, setIsLocked] = useState(0);
  const [cost, setCost] = useState("");

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUploadImages = async () => {
    if (!folderPath.trim()) {
      alert("Please enter a folder path");
      return;
    }

    if (selectedFiles.length === 0) {
      alert("Please select at least one image");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("folderPath", folderPath);

      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/upload-store-images", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save filenames to sessionStorage
        sessionStorage.setItem("create_store_items", JSON.stringify(data.files));
        
        alert(`✅ ${data.message}\n\nImages compressed successfully! You can now proceed to Step 2.`);
        setCurrentStep(2);
      } else {
        alert(`Failed to upload images: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Error uploading images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleInsertItems = async () => {
    // Validate all fields
    if (!type.trim()) {
      alert("Please enter a type");
      return;
    }

    if (type.length > 10) {
      alert("Type must be 10 characters or less");
      return;
    }

    if (!adhFrom || !adhPlus || !cost) {
      alert("Please fill in all numeric fields");
      return;
    }

    // Get files from sessionStorage
    const filesJSON = sessionStorage.getItem("create_store_items");
    if (!filesJSON) {
      alert("No images found. Please complete Step 1 first.");
      return;
    }

    const files = JSON.parse(filesJSON);

    setInserting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/insert-store-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          files,
          type,
          folder: folderPath,
          adhFrom: parseInt(adhFrom),
          adhPlus: parseInt(adhPlus),
          isLocked,
          cost: parseInt(cost),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(`✅ ${data.message}\n\nStore items created successfully!`);
        
        // Clear sessionStorage
        sessionStorage.removeItem("create_store_items");
        
        // Reset form
        setCurrentStep(1);
        setFolderPath("");
        setSelectedFiles([]);
        setType("");
        setAdhFrom("");
        setAdhPlus("");
        setIsLocked(0);
        setCost("");
      } else {
        alert(`Failed to insert items: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error inserting items:", error);
      alert("Error inserting items. Please try again.");
    } finally {
      setInserting(false);
    }
  };

  return (
    <div className="create-store-items-container">
      <div className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
        <h1>
          <i className="fa-solid fa-store"></i> Create Store Items
        </h1>
      </div>

      <div className="steps-indicator">
        <div className={`step ${currentStep === 1 ? "active" : currentStep > 1 ? "completed" : ""}`}>
          <div className="step-number">1</div>
          <div className="step-label">Upload Images</div>
        </div>
        <div className="step-divider"></div>
        <div className={`step ${currentStep === 2 ? "active" : ""}`}>
          <div className="step-number">2</div>
          <div className="step-label">Insert Records</div>
        </div>
      </div>

      {currentStep === 1 && (
        <div className="step-content">
          <h2>
            <i className="fa-solid fa-upload"></i> Step 1: Upload Images
          </h2>
          <p className="step-description">
            Upload images to the store folder. They will be automatically compressed to WebP format.
          </p>

          <div className="form-group">
            <label htmlFor="folderPath">
              <i className="fa-solid fa-folder"></i> Folder Path (relative to store/)
            </label>
            <input
              id="folderPath"
              type="text"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              placeholder="e.g., warriors/animals"
              disabled={uploading}
            />
            <p className="hint">
              Example: <code>warriors/animals</code> will upload to{" "}
              <code>frontend/src/assets/store/warriors/animals/</code>
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="images">
              <i className="fa-solid fa-images"></i> Select Images
            </label>
            <input
              id="images"
              type="file"
              multiple
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {selectedFiles.length > 0 && (
              <p className="file-count">
                {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          <button
            className="primary-btn"
            onClick={handleUploadImages}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Uploading & Compressing...
              </>
            ) : (
              <>
                <i className="fa-solid fa-cloud-upload-alt"></i> Upload & Compress Images
              </>
            )}
          </button>
        </div>
      )}

      {currentStep === 2 && (
        <div className="step-content">
          <h2>
            <i className="fa-solid fa-database"></i> Step 2: Insert Database Records
          </h2>
          <p className="step-description">
            Configure the properties for the store items and insert them into the database.
          </p>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="type">
                <i className="fa-solid fa-tag"></i> Type (max 10 chars)
              </label>
              <input
                id="type"
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="e.g., animals"
                maxLength={10}
                disabled={inserting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="adhFrom">
                <i className="fa-solid fa-chart-line"></i> ADH From
              </label>
              <input
                id="adhFrom"
                type="number"
                value={adhFrom}
                onChange={(e) => setAdhFrom(e.target.value)}
                placeholder="e.g., 20"
                disabled={inserting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="adhPlus">
                <i className="fa-solid fa-plus"></i> ADH Plus
              </label>
              <input
                id="adhPlus"
                type="number"
                value={adhPlus}
                onChange={(e) => setAdhPlus(e.target.value)}
                placeholder="e.g., 26"
                disabled={inserting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cost">
                <i className="fa-solid fa-coins"></i> Cost Multiplier
              </label>
              <input
                id="cost"
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="e.g., 11"
                disabled={inserting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="isLocked">
                <i className="fa-solid fa-lock"></i> Is Locked
              </label>
              <select
                id="isLocked"
                value={isLocked}
                onChange={(e) => setIsLocked(parseInt(e.target.value))}
                disabled={inserting}
              >
                <option value={0}>No (0)</option>
                <option value={1}>Yes (1)</option>
              </select>
            </div>
          </div>

          <div className="button-group">
            <button
              className="secondary-btn"
              onClick={() => setCurrentStep(1)}
              disabled={inserting}
            >
              <i className="fa-solid fa-arrow-left"></i> Back to Step 1
            </button>
            <button
              className="primary-btn"
              onClick={handleInsertItems}
              disabled={inserting}
            >
              {inserting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Inserting...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check"></i> Insert Store Items
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateStoreItems;

