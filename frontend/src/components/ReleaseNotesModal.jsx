import { useState } from "react";
import ReactMarkdown from "react-markdown";
import "./ReleaseNotesModal.css";

function ReleaseNotesModal({ releaseNotes, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!releaseNotes || releaseNotes.length === 0) {
    return null;
  }

  const currentNote = releaseNotes[currentIndex];
  const hasMore = currentIndex < releaseNotes.length - 1;

  const handleNext = async () => {
    // Mark current note as read
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/release-notes/${currentNote.id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Error marking release note as read:", error);
    }

    if (hasMore) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="release-notes-overlay" onClick={(e) => e.stopPropagation()}></div>
      <div className="release-notes-modal">
        <div className="release-notes-header">
          <div className="release-notes-title">
            <i className="fa-solid fa-bullhorn"></i>
            <h2>What's New</h2>
          </div>
          <div className="release-notes-counter">
            {currentIndex + 1} of {releaseNotes.length}
          </div>
        </div>
        
        <div className="release-notes-body">
          <div className="release-notes-date">
            <i className="fa-solid fa-calendar"></i>
            {formatDate(currentNote.createdAt)}
          </div>
          <div className="release-notes-content">
            <ReactMarkdown>{currentNote.message}</ReactMarkdown>
          </div>
        </div>

        <div className="release-notes-footer">
          <button className="release-notes-btn primary" onClick={handleNext}>
            {hasMore ? (
              <>
                Next <i className="fa-solid fa-arrow-right"></i>
              </>
            ) : (
              <>
                Got it! <i className="fa-solid fa-check"></i>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default ReleaseNotesModal;

