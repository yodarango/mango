import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AdminBattle.css";

function AdminBattle() {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const [battle, setBattle] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [avatars, setAvatars] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [battleStarted, setBattleStarted] = useState(false);
  const [liveAnswers, setLiveAnswers] = useState({});
  const [showGrading, setShowGrading] = useState(false);
  const [grades, setGrades] = useState({});

  useEffect(() => {
    fetchBattle();
    fetchAvatars();
  }, [battleId]);

  const fetchBattle = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/battles/${battleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setBattle(data.battle);
      setQuestions(data.questions || []);

      // Initialize assignments from existing data
      const existingAssignments = {};
      data.questions.forEach((q) => {
        if (q.userId) {
          existingAssignments[q.id] = q.userId;
        }
      });
      setAssignments(existingAssignments);

      setBattleStarted(data.battle.status === "in_progress");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching battle:", error);
      setLoading(false);
    }
  };

  const fetchAvatars = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/avatars", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setAvatars(data);
    } catch (error) {
      console.error("Error fetching avatars:", error);
    }
  };

  const handleAssignment = (questionId, avatarId) => {
    setAssignments({
      ...assignments,
      [questionId]: parseInt(avatarId),
    });
  };

  const handleStartBattle = async () => {
    // Validate all questions are assigned
    const unassigned = questions.filter((q) => !assignments[q.id]);
    if (unassigned.length > 0) {
      alert(
        `Please assign all questions. ${unassigned.length} questions remaining.`
      );
      return;
    }

    // Check at least 2 avatars are assigned
    const uniqueAvatars = new Set(Object.values(assignments));
    if (uniqueAvatars.size < 2) {
      alert("Please assign questions to at least 2 different avatars.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // First, save assignments
      const assignResponse = await fetch(`/api/battles/${battleId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignments: Object.entries(assignments).map(
            ([questionId, avatarId]) => ({
              questionId: parseInt(questionId),
              avatarId: avatarId,
            })
          ),
        }),
      });

      if (!assignResponse.ok) {
        alert("Failed to assign questions");
        return;
      }

      // Then start the battle
      const startResponse = await fetch(`/api/battles/${battleId}/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (startResponse.ok) {
        setBattleStarted(true);
        alert("Battle started! Players will receive their questions.");
        // In a real implementation, WebSocket would notify players here
      } else {
        alert("Failed to start battle");
      }
    } catch (error) {
      console.error("Error starting battle:", error);
      alert("Error starting battle");
    }
  };

  const handleStopBattle = async () => {
    if (
      !confirm(
        "Are you sure you want to stop this battle? This will mark it as completed."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/battles/${battleId}/stop`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Battle stopped successfully!");
        navigate("/admin/create-battle");
      } else {
        alert("Failed to stop battle");
      }
    } catch (error) {
      console.error("Error stopping battle:", error);
      alert("Error stopping battle");
    }
  };

  const handleGradeSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/battles/grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          grades: Object.entries(grades).map(([questionId, receivedScore]) => ({
            questionId: parseInt(questionId),
            receivedScore: parseInt(receivedScore),
          })),
        }),
      });

      if (response.ok) {
        alert("Grades submitted successfully!");
        setShowGrading(false);
        fetchBattle(); // Refresh data
      } else {
        alert("Failed to submit grades");
      }
    } catch (error) {
      console.error("Error submitting grades:", error);
      alert("Error submitting grades");
    }
  };

  const getAvatarName = (avatarId) => {
    const avatar = avatars.find((a) => a.id === avatarId);
    return avatar ? avatar.name : "Unknown";
  };

  const getAssignedAvatars = () => {
    return [...new Set(Object.values(assignments))]
      .map((avatarId) => {
        const avatar = avatars.find((a) => a.id === avatarId);
        return avatar;
      })
      .filter(Boolean);
  };

  if (loading) {
    return (
      <div className='loading-container'>
        <div className='loading-spinner'></div>
        <p>Loading battle...</p>
      </div>
    );
  }

  if (!battle) {
    return (
      <div className='error-container'>
        <i className='fa-solid fa-exclamation-triangle'></i>
        <h2>Battle Not Found</h2>
      </div>
    );
  }

  return (
    <div className='admin-battle-container'>
      <div className='admin-battle-header'>
        <h1>
          <i className='fa-solid fa-swords'></i> {battle.name}
        </h1>
        <div className='battle-info'>
          <span className={`status-badge ${battle.status}`}>
            {battle.status}
          </span>
          {battle.reward && (
            <span>
              <i className='fa-solid fa-trophy'></i> {battle.reward}
            </span>
          )}
          {battle.status === "pending" && (
            <button
              className='edit-battle-btn'
              onClick={() => navigate(`/admin/edit-battle/${battleId}`)}
            >
              <i className='fa-solid fa-pen-to-square'></i> Edit Battle
            </button>
          )}
        </div>
      </div>

      {!battleStarted ? (
        <div className='assignment-section'>
          <h2>
            <i className='fa-solid fa-user-plus'></i> Assign Questions to
            Avatars
          </h2>
          <p className='hint'>
            Each avatar must have their own question. At least 2 avatars
            required.
          </p>

          <div className='questions-assignment'>
            {questions.map((question, index) => (
              <div key={question.id} className='assignment-item'>
                <div className='question-info'>
                  <span className='question-number'>#{index + 1}</span>
                  <div
                    className='question-text'
                    dangerouslySetInnerHTML={{ __html: question.question }}
                  ></div>
                  <div className='question-details'>
                    <span>
                      <i className='fa-solid fa-star'></i>{" "}
                      {question.possiblePoints} pts
                    </span>
                    <span>
                      <i className='fa-solid fa-clock'></i> {question.time}s
                    </span>
                  </div>
                </div>
                <div className='avatar-select'>
                  <label>Assign to:</label>
                  <select
                    value={assignments[question.id] || ""}
                    onChange={(e) =>
                      handleAssignment(question.id, e.target.value)
                    }
                  >
                    <option value=''>Select Avatar</option>
                    {avatars.map((avatar) => (
                      <option key={avatar.id} value={avatar.id}>
                        {avatar.name} ({avatar.element})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className='assigned-summary'>
            <h3>Assigned Avatars ({getAssignedAvatars().length})</h3>
            <div className='avatar-chips'>
              {getAssignedAvatars().map((avatar) => (
                <div key={avatar.id} className='avatar-chip'>
                  <img src={avatar.thumbnail} alt={avatar.name} />
                  <span>{avatar.name}</span>
                </div>
              ))}
            </div>
          </div>

          <button className='start-battle-btn' onClick={handleStartBattle}>
            <i className='fa-solid fa-play'></i> Start Battle
          </button>
        </div>
      ) : (
        <div className='battle-monitor'>
          <h2>
            <i className='fa-solid fa-eye'></i> Battle in Progress
          </h2>
          <p className='hint'>Monitor player answers in real-time</p>

          <div className='live-answers-grid'>
            {getAssignedAvatars().map((avatar) => {
              const question = questions.find(
                (q) => assignments[q.id] === avatar.id
              );
              return (
                <div key={avatar.id} className='player-panel'>
                  <div className='player-header'>
                    <img src={avatar.thumbnail} alt={avatar.name} />
                    <h3>{avatar.name}</h3>
                  </div>
                  <div className='player-question'>
                    <div
                      dangerouslySetInnerHTML={{ __html: question?.question }}
                    ></div>
                  </div>
                  <div className='player-answer'>
                    <label>Answer:</label>
                    <div className='answer-display'>
                      {question?.userAnswer || "Waiting for answer..."}
                    </div>
                  </div>
                  {question?.submittedAt && (
                    <div className='submitted-badge'>
                      <i className='fa-solid fa-check'></i> Submitted
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className='battle-actions'>
            <button className='grade-btn' onClick={() => setShowGrading(true)}>
              <i className='fa-solid fa-pen-to-square'></i> Grade Answers
            </button>
            <button className='stop-battle-btn' onClick={handleStopBattle}>
              <i className='fa-solid fa-stop'></i> Stop Battle
            </button>
          </div>
        </div>
      )}
      {/* Grading Modal */}
      {showGrading && (
        <>
          <div
            className='modal-overlay'
            onClick={() => setShowGrading(false)}
          ></div>
          <div className='grading-modal'>
            <div className='modal-header'>
              <h2>
                <i className='fa-solid fa-pen-to-square'></i> Grade Answers
              </h2>
              <button onClick={() => setShowGrading(false)}>
                <i className='fa-solid fa-times'></i>
              </button>
            </div>
            <div className='modal-body'>
              {questions.map((question) => {
                const avatar = avatars.find((a) => a.id === question.userId);
                if (!avatar) return null;

                return (
                  <div key={question.id} className='grade-item'>
                    <h4>{avatar.name}</h4>
                    <div
                      className='grade-question'
                      dangerouslySetInnerHTML={{ __html: question.question }}
                    ></div>
                    <div className='grade-answer'>
                      <strong>Correct Answer:</strong> {question.answer}
                    </div>
                    <div className='grade-user-answer'>
                      <strong>User Answer:</strong>{" "}
                      {question.userAnswer || "No answer"}
                    </div>
                    <div className='grade-input'>
                      <label>Score (max {question.possiblePoints}):</label>
                      <input
                        type='number'
                        min='0'
                        max={question.possiblePoints}
                        value={grades[question.id] || 0}
                        onChange={(e) =>
                          setGrades({
                            ...grades,
                            [question.id]: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className='modal-footer'>
              <button onClick={() => setShowGrading(false)}>Cancel</button>
              <button className='submit-grades-btn' onClick={handleGradeSubmit}>
                <i className='fa-solid fa-check'></i> Submit Grades
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminBattle;
