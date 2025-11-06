import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ViewAssignment.css";

function ViewAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form fields
  const [editData, setEditData] = useState({
    name: "",
    coins: "",
    dueDate: "",
    data: "",
  });

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  // Update edit form when assignment data changes
  useEffect(() => {
    if (assignment) {
      let formattedData = "";
      if (assignment.data) {
        try {
          const parsed =
            typeof assignment.data === "string"
              ? JSON.parse(assignment.data)
              : assignment.data;
          formattedData = JSON.stringify(parsed, null, 2);
        } catch (e) {
          console.error("Error parsing assignment data:", e);
          formattedData =
            typeof assignment.data === "string"
              ? assignment.data
              : JSON.stringify(assignment.data);
        }
      }

      setEditData({
        name: assignment.name || "",
        coins: assignment.coins || "",
        dueDate: assignment.dueDate
          ? formatDateForInput(assignment.dueDate)
          : "",
        data: formattedData,
      });
    }
  }, [assignment]);

  const fetchAssignment = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch assignment
      const assignmentRes = await fetch(`/api/assignments/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const assignmentData = await assignmentRes.json();

      // Fetch student info
      const studentRes = await fetch("/api/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const studentsData = await studentRes.json();
      const studentInfo = studentsData.find(
        (s) => s.id === assignmentData.userId
      );

      setAssignment(assignmentData);
      setStudent(studentInfo);

      // Debug: Log assignment data to check for userAnswer fields
      console.log("Assignment data:", assignmentData);
      if (assignmentData.data) {
        const parsedData =
          typeof assignmentData.data === "string"
            ? JSON.parse(assignmentData.data)
            : assignmentData.data;
        console.log("Quiz questions with userAnswer:", parsedData);
      }

      // Initialize edit form
      let formattedData = "";
      if (assignmentData.data) {
        // If data is already a string, parse and re-stringify for formatting
        // If it's an object, just stringify it
        try {
          const parsed =
            typeof assignmentData.data === "string"
              ? JSON.parse(assignmentData.data)
              : assignmentData.data;
          formattedData = JSON.stringify(parsed, null, 2);
        } catch (e) {
          console.error("Error parsing assignment data:", e);
          formattedData =
            typeof assignmentData.data === "string"
              ? assignmentData.data
              : JSON.stringify(assignmentData.data);
        }
      }

      setEditData({
        name: assignmentData.name || "",
        coins: assignmentData.coins || "",
        dueDate: assignmentData.dueDate
          ? formatDateForInput(assignmentData.dueDate)
          : "",
        data: formattedData,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching assignment:", error);
      setLoading(false);
    }
  };

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSave = async () => {
    // Validate JSON if provided
    if (editData.data.trim()) {
      try {
        JSON.parse(editData.data);
      } catch (e) {
        alert("Invalid JSON format in quiz data");
        return;
      }
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      // Convert datetime-local format to RFC3339
      const dueDateISO = new Date(editData.dueDate).toISOString();

      const response = await fetch(`/api/assignments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editData.name,
          coins: parseInt(editData.coins),
          dueDate: dueDateISO,
          data: editData.data.trim() || null,
        }),
      });

      if (response.ok) {
        alert("Assignment updated successfully!");
        setEditing(false);
        fetchAssignment(); // Refresh data
      } else {
        alert("Failed to update assignment");
      }
    } catch (error) {
      console.error("Error updating assignment:", error);
      alert("Error updating assignment");
    } finally {
      setSaving(false);
    }
  };

  const parseQuizData = () => {
    if (!assignment.data) return null;
    try {
      // If data is already an object/array, return it directly
      if (typeof assignment.data === "object") {
        return assignment.data;
      }
      // If it's a string, parse it
      return JSON.parse(assignment.data);
    } catch (e) {
      console.error("Error parsing quiz data:", e);
      return null;
    }
  };

  if (loading) {
    return (
      <div className='loading-container'>
        <div className='loading-spinner'></div>
        <p>Loading assignment...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className='error-container'>
        <i className='fa-solid fa-exclamation-triangle'></i>
        <h2>Assignment Not Found</h2>
        <button onClick={() => navigate("/admin/assignments")}>
          Back to Assignments
        </button>
      </div>
    );
  }

  const quizData = parseQuizData();

  return (
    <div className='view-assignment-container'>
      {/* Header */}
      <div className='assignment-header'>
        <button
          className='back-btn'
          onClick={() => navigate("/admin/assignments")}
        >
          <i className='fa-solid fa-arrow-left'></i> Back
        </button>
        <button className='edit-btn' onClick={() => setEditing(!editing)}>
          {editing ? (
            <>
              <i className='fa-solid fa-times'></i> Cancel
            </>
          ) : (
            <>
              <i className='fa-solid fa-pen-to-square'></i> Edit
            </>
          )}
        </button>
      </div>

      {!editing ? (
        /* View Mode */
        <>
          <div className='assignment-info-card'>
            <h1>{assignment.name}</h1>
            <div className='info-grid'>
              <div className='info-item'>
                <label>Student:</label>
                <span>{student?.name || "Unknown"}</span>
              </div>
              <div className='info-item'>
                <label>Assignment ID:</label>
                <span>{assignment.assignmentId}</span>
              </div>
              <div className='info-item'>
                <label>Due Date:</label>
                <span>{formatDate(assignment.dueDate)}</span>
              </div>
              <div className='info-item'>
                <label>Total Coins:</label>
                <span className='coins-value'>
                  <i className='fa-solid fa-coins'></i> {assignment.coins}
                </span>
              </div>
              <div className='info-item'>
                <label>Status:</label>
                {assignment.completed ? (
                  <span className='status completed'>
                    <i className='fa-solid fa-check-circle'></i> Completed
                  </span>
                ) : (
                  <span className='status pending'>
                    <i className='fa-solid fa-clock'></i> Pending
                  </span>
                )}
              </div>
            </div>

            {assignment.completed && (
              <div className='completion-info'>
                <h3>
                  <i className='fa-solid fa-trophy'></i> Completion Details
                </h3>
                <div className='coins-earned'>
                  <span className='label'>Coins Earned:</span>
                  <span className='value'>
                    <i className='fa-solid fa-coins'></i>{" "}
                    {assignment.coinsReceived} / {assignment.coins}
                  </span>
                  <span className='percentage'>
                    (
                    {Math.round(
                      (assignment.coinsReceived / assignment.coins) * 100
                    )}
                    %)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quiz Data */}
          {quizData && (
            <div className='quiz-data-card'>
              <h2>
                <i className='fa-solid fa-list-check'></i> Quiz Questions (
                {quizData.length})
              </h2>

              {/* Show results if completed */}
              {assignment.completed && (
                <div className='student-results-summary'>
                  <h3>
                    <i className='fa-solid fa-chart-bar'></i> Student Results
                  </h3>
                  <div className='results-stats'>
                    <div className='stat-item'>
                      <span className='stat-label'>Correct Answers:</span>
                      <span className='stat-value'>
                        {
                          quizData.filter((q) => {
                            if (!q.userAnswer) return false;
                            if (
                              q.type === "multiple" ||
                              q.type === "multiple-choice"
                            ) {
                              const optionsList = q.options || q.answer;
                              const userAnswerIndex = optionsList.findIndex(
                                (opt) => opt === q.userAnswer
                              );
                              return q.correct === userAnswerIndex;
                            } else if (
                              q.type === "typed" ||
                              q.type === "input"
                            ) {
                              const acceptableAnswers = Array.isArray(q.answer)
                                ? q.answer
                                : [q.answer];
                              return acceptableAnswers.some(
                                (correct) =>
                                  correct.toLowerCase() ===
                                  q.userAnswer.toLowerCase().trim()
                              );
                            }
                            return false;
                          }).length
                        }{" "}
                        / {quizData.length}
                      </span>
                    </div>
                    <div className='stat-item'>
                      <span className='stat-label'>Score:</span>
                      <span className='stat-value'>
                        {Math.round(
                          (quizData.filter((q) => {
                            if (!q.userAnswer) return false;
                            if (
                              q.type === "multiple" ||
                              q.type === "multiple-choice"
                            ) {
                              const optionsList = q.options || q.answer;
                              const userAnswerIndex = optionsList.findIndex(
                                (opt) => opt === q.userAnswer
                              );
                              return q.correct === userAnswerIndex;
                            } else if (
                              q.type === "typed" ||
                              q.type === "input"
                            ) {
                              const acceptableAnswers = Array.isArray(q.answer)
                                ? q.answer
                                : [q.answer];
                              return acceptableAnswers.some(
                                (correct) =>
                                  correct.toLowerCase() ===
                                  q.userAnswer.toLowerCase().trim()
                              );
                            }
                            return false;
                          }).length /
                            quizData.length) *
                            100
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className='questions-list'>
                {quizData.map((q, index) => {
                  // Calculate if answer is correct (for completed assignments)
                  let isCorrect = false;
                  let correctAnswer = "";
                  const hasUserAnswer =
                    q.userAnswer !== undefined && q.userAnswer !== null;

                  if (assignment.completed && hasUserAnswer) {
                    if (q.type === "multiple" || q.type === "multiple-choice") {
                      const optionsList = q.options || q.answer;
                      const userAnswerIndex = optionsList.findIndex(
                        (opt) => opt === q.userAnswer
                      );
                      isCorrect = q.correct === userAnswerIndex;
                      correctAnswer = optionsList[q.correct];
                    } else if (q.type === "typed" || q.type === "input") {
                      const acceptableAnswers = Array.isArray(q.answer)
                        ? q.answer
                        : [q.answer];
                      isCorrect = acceptableAnswers.some(
                        (correct) =>
                          correct.toLowerCase() ===
                          q.userAnswer.toLowerCase().trim()
                      );
                      correctAnswer = Array.isArray(q.answer)
                        ? q.answer[0]
                        : q.answer;
                    }
                  }

                  return (
                    <div
                      key={q.id || index}
                      className={`question-item-compact ${
                        assignment.completed && hasUserAnswer
                          ? isCorrect
                            ? "correct"
                            : "incorrect"
                          : ""
                      }`}
                    >
                      <div className='question-compact'>
                        <span className='q-num'>Q{index + 1}.</span>
                        <span className='q-text'>{q.question}</span>
                      </div>

                      {assignment.completed && hasUserAnswer && (
                        <div className='answers-compact'>
                          {!isCorrect && (
                            <div className='answer-row incorrect-row'>
                              <i className='fa-solid fa-times'></i>
                              <span>{q.userAnswer}</span>
                            </div>
                          )}
                          <div className='answer-row correct-row'>
                            <i className='fa-solid fa-check'></i>
                            <span>{correctAnswer}</span>
                          </div>
                        </div>
                      )}

                      {assignment.completed && !hasUserAnswer && (
                        <div className='answers-compact'>
                          <div className='answer-row no-answer-row'>
                            <i className='fa-solid fa-minus'></i>
                            <span>No answer</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Edit Mode */
        <div className='edit-form-card'>
          <h2>
            <i className='fa-solid fa-pen-to-square'></i> Edit Assignment
          </h2>
          <div className='form-group'>
            <label>Assignment Name</label>
            <input
              type='text'
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
            />
          </div>
          <div className='form-row'>
            <div className='form-group'>
              <label>Total Coins</label>
              <input
                type='number'
                value={editData.coins}
                onChange={(e) =>
                  setEditData({ ...editData, coins: e.target.value })
                }
              />
            </div>
            <div className='form-group'>
              <label>Due Date</label>
              <input
                type='datetime-local'
                value={editData.dueDate}
                onChange={(e) =>
                  setEditData({ ...editData, dueDate: e.target.value })
                }
              />
            </div>
          </div>
          <div className='form-group'>
            <label>Quiz Data (JSON)</label>
            <textarea
              value={editData.data}
              onChange={(e) =>
                setEditData({ ...editData, data: e.target.value })
              }
              rows='15'
              className='json-textarea'
            />
          </div>
          <div className='form-actions'>
            <button className='btn-cancel' onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button className='btn-save' onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <i className='fa-solid fa-spinner fa-spin'></i> Saving...
                </>
              ) : (
                <>
                  <i className='fa-solid fa-check'></i> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewAssignment;
