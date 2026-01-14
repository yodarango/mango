import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReleaseNotesModal from "./ReleaseNotesModal";

function ReleaseNotesProvider({ children }) {
  const [releaseNotes, setReleaseNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  useEffect(() => {
    // Only check for release notes if user is logged in (not on login page)
    if (!isLoginPage) {
      checkForReleaseNotes();
    }
  }, [isLoginPage]);

  const checkForReleaseNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/release-notes/unread", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setReleaseNotes(data);
          setShowModal(true);
        }
      }
    } catch (error) {
      console.error("Error fetching release notes:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setReleaseNotes([]);
  };

  return (
    <>
      {children}
      {showModal && (
        <ReleaseNotesModal
          releaseNotes={releaseNotes}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

export default ReleaseNotesProvider;

