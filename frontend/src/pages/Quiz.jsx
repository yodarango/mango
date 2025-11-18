import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import "./Quiz.css";

function Quiz() {
  const { assignmentId } = useParams(); // Get assignmentId from URL (e.g., "1001")
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const warriorIdFromUrl = searchParams.get("warrior");
  const [assignment, setAssignment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [typedAnswers, setTypedAnswers] = useState({});
  const [questionTimeLeft, setQuestionTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [avatarId, setAvatarId] = useState(null);
  const [isRetake, setIsRetake] = useState(false);

  // Fetch user's assets
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        // Get all avatars and find the one for the logged-in user
        const avatarResponse = await fetch("/api/avatars", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!avatarResponse.ok) {
          throw new Error("Failed to fetch avatars");
        }

        const avatars = await avatarResponse.json();

        // Find the avatar that belongs to the logged-in user
        const userAvatar = avatars.find((a) => a.userId === user.id);

        if (userAvatar) {
          setAvatarId(userAvatar.id);

          // Fetch assets for this avatar
          const assetsResponse = await fetch(
            `/api/avatars/${userAvatar.id}/assets`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (assetsResponse.ok) {
            const assetsData = await assetsResponse.json();
            // Filter only warrior status assets (owned by user)
            const ownedAssets = assetsData.filter(
              (asset) => asset.status === "warrior"
            );
            setAssets(ownedAssets);

            // If warrior ID is provided in URL, auto-select that warrior
            if (warriorIdFromUrl) {
              const preselectedWarrior = ownedAssets.find(
                (asset) => asset.id === parseInt(warriorIdFromUrl)
              );
              if (preselectedWarrior) {
                setSelectedAsset(preselectedWarrior);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching assets:", err);
      }
    };

    fetchAssets();
  }, []);

  // Fetch assignment data
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch single assignment by assignment_id
        const response = await fetch(
          `/api/assignments/student/${assignmentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch assignment");
        }

        const assignmentData = await response.json();

        setAssignment(assignmentData);

        // Parse quiz data
        if (assignmentData.data) {
          const quizData =
            typeof assignmentData.data === "string"
              ? JSON.parse(assignmentData.data)
              : assignmentData.data;
          setQuestions(quizData);

          // Check if already completed
          if (assignmentData.completed) {
            setQuizCompleted(true);

            // Reconstruct results from saved data
            let totalCoins = 0;
            const questionResults = quizData.map((q) => {
              // Use is_correct if available (standardized format)
              let isCorrect = q.is_correct !== undefined ? q.is_correct : false;
              const userAnswer = q.user_answer || q.userAnswer || "No answer";

              // If is_correct is not available, calculate it
              if (q.is_correct === undefined) {
                // Check if answer is correct
                if (q.type === "multiple" || q.type === "multiple-choice") {
                  // For multiple choice, find the index of the user's answer
                  const optionsList = q.options || q.answer;
                  const userAnswerIndex = optionsList.findIndex(
                    (opt) => opt === userAnswer
                  );
                  isCorrect = q.correct === userAnswerIndex;
                } else if (q.type === "typed" || q.type === "input") {
                  // For typed answers, check against acceptable answers
                  const acceptableAnswers = Array.isArray(q.answer)
                    ? q.answer
                    : [q.answer];
                  isCorrect = acceptableAnswers.some(
                    (correct) =>
                      correct.toLowerCase() === userAnswer.toLowerCase().trim()
                  );
                }
              }

              const coinsEarned = isCorrect ? q.coins_worth : 0;
              totalCoins += coinsEarned;

              return {
                questionId: q.id,
                question: q.question,
                type: q.type,
                userAnswer,
                isCorrect,
                coinsEarned,
              };
            });

            setResults({
              totalCoins,
              questionResults,
              completedAt: new Date().toISOString(),
            });
          }
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  // Initialize question timer when quiz starts or question changes
  useEffect(() => {
    if (quizStarted && !quizCompleted && questions.length > 0) {
      const currentQ = questions[currentQuestion];
      setQuestionTimeLeft(currentQ.time_alloted || 30); // Default 30 seconds if not specified
    }
  }, [quizStarted, currentQuestion, questions, quizCompleted]);

  // Timer countdown for current question
  useEffect(() => {
    if (!quizStarted || quizCompleted || questionTimeLeft <= 0) return;

    const timer = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up for this question - auto-advance or submit
          if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
          } else {
            handleSubmit(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    quizStarted,
    quizCompleted,
    questionTimeLeft,
    currentQuestion,
    questions.length,
  ]);

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const handleRetake = async () => {
    // Refresh the selected asset's data to show updated XP
    if (selectedAsset) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/assets/${selectedAsset.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const updatedAsset = await response.json();
          setSelectedAsset(updatedAsset);

          // Also update in the assets list
          setAssets((prevAssets) =>
            prevAssets.map((asset) =>
              asset.id === updatedAsset.id ? updatedAsset : asset
            )
          );
        }
      } catch (error) {
        console.error("Error refreshing asset data:", error);
      }
    }

    // Reset quiz state for retake
    setIsRetake(true);
    setQuizCompleted(false);
    setQuizStarted(false);
    setResults(null);
    setAnswers({});
    setTypedAnswers({});
    setCurrentQuestion(0);
  };

  const handleAnswer = (questionId, answerIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleTypedAnswer = (questionId, value) => {
    setTypedAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async (autoSubmit = false) => {
    // Check if all questions are answered
    const totalAnswered =
      Object.keys(answers).length + Object.keys(typedAnswers).length;
    if (!autoSubmit && totalAnswered < questions.length) {
      if (
        !window.confirm("You haven't answered all questions. Submit anyway?")
      ) {
        return;
      }
    }

    // Calculate results
    let totalCoins = 0;
    const questionResults = questions.map((q) => {
      let isCorrect = false;
      let userAnswer = "No answer";
      let correctAnswer = "";

      // Handle multiple choice questions (both "multiple" and "multiple-choice" types)
      if (q.type === "multiple" || q.type === "multiple-choice") {
        const answerIndex = answers[q.id];
        // Support both "answer" and "options" field names
        const optionsList = q.options || q.answer;

        // Get correct answer
        if (q.correct !== undefined && q.correct !== null) {
          correctAnswer = optionsList[q.correct];
        }

        if (answerIndex !== undefined) {
          userAnswer = optionsList[answerIndex];
          isCorrect = q.correct === answerIndex;
        }
      }
      // Handle input/typed questions (both "typed" and "input" types)
      else if (q.type === "typed" || q.type === "input") {
        const typedAnswer = typedAnswers[q.id];

        // For typed answers, q.answer should be an array of acceptable answers
        const acceptableAnswers = Array.isArray(q.answer)
          ? q.answer
          : [q.answer];

        // Set correct answer (show first acceptable answer)
        correctAnswer = Array.isArray(q.answer) ? q.answer[0] : q.answer;

        if (typedAnswer) {
          userAnswer = typedAnswer;
          isCorrect = acceptableAnswers.some(
            (correct) =>
              correct.toLowerCase() === typedAnswer.toLowerCase().trim()
          );
        }
      }

      // Calculate coins earned for this question
      let coinsEarned = 0;
      if (isCorrect) {
        coinsEarned = q.coins_worth;
        // Apply 20% for retakes
        if (isRetake) {
          coinsEarned = Math.floor(q.coins_worth * 0.2);
        }
        totalCoins += coinsEarned;
      }

      return {
        questionId: q.id,
        question: q.question,
        type: q.type,
        userAnswer,
        correctAnswer,
        isCorrect,
        coinsEarned,
      };
    });

    const resultsData = {
      totalCoins,
      questionResults,
      completedAt: new Date().toISOString(),
    };

    setResults(resultsData);

    // Prepare user answers for backend storage
    const userAnswersForBackend = questionResults.map((result) => ({
      questionId: result.questionId,
      userAnswer: result.userAnswer,
      isCorrect: result.isCorrect,
    }));

    // Calculate success rate for XP
    const correctAnswers = questionResults.filter((r) => r.isCorrect).length;
    const successRate = (correctAnswers / questions.length) * 100;
    let xpGain = Math.floor(successRate / 2); // XP gain is half of success rate

    // Apply 20% for retakes
    if (isRetake) {
      xpGain = Math.floor(xpGain * 0.2);
    }

    // Submit to backend
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/assignments/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignmentId: assignment.id, // Use the database ID, not the category assignmentId
          coinsReceived: totalCoins,
          userAnswers: userAnswersForBackend, // Include user answers
          assetId: selectedAsset?.id, // Include selected asset ID
          xpGain: xpGain, // Include XP gain
          isRetake: isRetake, // Include retake flag
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Error submitting assignment:",
          response.status,
          errorText
        );
        alert(`Failed to submit assignment: ${errorText || "Unknown error"}`);
        return;
      }

      const data = await response.json();
      if (data.success) {
        console.log(
          "Assignment submitted successfully. New coins:",
          data.coins
        );

        // Update results with asset data if available
        if (data.assetData) {
          setResults({
            ...resultsData,
            assetLeveledUp: data.assetLeveledUp,
            assetData: data.assetData,
          });
        }
      } else {
        alert(
          `Failed to submit assignment: ${data.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
      alert(`Error submitting assignment: ${error.message}`);
    }

    setQuizCompleted(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className='quiz-container'>
        <div className='quiz-loading'>
          <i className='fa-solid fa-spinner fa-spin'></i>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='quiz-container'>
        <div className='quiz-error'>
          <i className='fa-solid fa-exclamation-circle'></i>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/assignments")} className='btn-back'>
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  if (!assignment || questions.length === 0) {
    return (
      <div className='quiz-container'>
        <div className='quiz-error'>
          <i className='fa-solid fa-exclamation-circle'></i>
          <h2>No Quiz Data</h2>
          <p>This assignment doesn't have quiz questions yet.</p>
          <button onClick={() => navigate("/assignments")} className='btn-back'>
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='quiz-container'>
      {!quizStarted && !quizCompleted && (
        <div className='quiz-warning'>
          <div className='warning-header'>
            <h2>
              <i className='fa-solid fa-clipboard-question'></i>{" "}
              {assignment.name}
            </h2>
          </div>
          <div className='warning-content'>
            <p>
              <strong>Quiz Information:</strong>
            </p>
            <ul>
              <li>
                Total questions: <strong>{questions.length}</strong>
              </li>
              <li>
                Total coins possible:{" "}
                <strong>
                  {isRetake
                    ? Math.floor(assignment.coins * 0.2)
                    : assignment.coins}
                </strong>
                {isRetake && (
                  <span style={{ color: "#ff9500", marginLeft: "0.5rem" }}>
                    (20% of original)
                  </span>
                )}
              </li>
              <li>
                <strong>Each question is timed individually</strong>
              </li>
              <li>
                <strong>You cannot pause</strong> once you start
              </li>
            </ul>

            {assets.length > 0 && !warriorIdFromUrl && (
              <div className='asset-selection'>
                <p>
                  <strong>Select a warrior to gain XP:</strong>
                </p>
                <div className='asset-grid'>
                  {assets.map((asset) => (
                    <div
                      key={asset.id}
                      className={`asset-card ${
                        selectedAsset?.id === asset.id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedAsset(asset)}
                    >
                      <img src={asset.thumbnail} alt={asset.name} />
                      <div className='asset-info'>
                        <div className='asset-name'>{asset.name}</div>
                        <div className='asset-level'>Lvl {asset.level}</div>
                        <div className='asset-xp'>
                          {asset.xp || 0} / {asset.xpRequired || 100} XP
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedAsset && (
                  <p className='selected-note'>
                    <i className='fa-solid fa-check-circle'></i>{" "}
                    {selectedAsset.name} will gain XP based on your performance
                  </p>
                )}
              </div>
            )}

            {warriorIdFromUrl && selectedAsset && (
              <div className='asset-selection'>
                <p>
                  <strong>Training warrior:</strong>
                </p>
                <div className='selected-warrior-display'>
                  <img src={selectedAsset.thumbnail} alt={selectedAsset.name} />
                  <div className='warrior-info'>
                    <div className='warrior-name'>{selectedAsset.name}</div>
                    <div className='warrior-level'>
                      Level {selectedAsset.level}
                    </div>
                    <div className='warrior-xp'>
                      {selectedAsset.xp || 0} /{" "}
                      {selectedAsset.xpRequired || 100} XP
                    </div>
                  </div>
                </div>
              </div>
            )}

            <p className='warning-note'>
              <i className='fa-solid fa-exclamation-triangle'></i> Make sure
              you're ready before starting!
            </p>
          </div>
          <div className='warning-actions'>
            <button
              onClick={() => navigate("/assignments")}
              className='btn-cancel'
            >
              Cancel
            </button>
            <button onClick={startQuiz} className='btn-start'>
              <i className='fa-solid fa-play'></i> Start Quiz
            </button>
          </div>
        </div>
      )}

      {quizStarted && !quizCompleted && (
        <div className='quiz-content'>
          <div className='quiz-header'>
            <div className='quiz-progress'>
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <div
              className={`quiz-timer ${questionTimeLeft < 10 ? "warning" : ""}`}
            >
              <i className='fa-solid fa-clock'></i>{" "}
              {formatTime(questionTimeLeft)}
            </div>
          </div>

          <div className='quiz-question'>
            <h3>{questions[currentQuestion].question}</h3>

            {questions[currentQuestion].type === "multiple" ||
            questions[currentQuestion].type === "multiple-choice" ? (
              <div className='quiz-options'>
                {(
                  questions[currentQuestion].options ||
                  questions[currentQuestion].answer
                ).map((option, index) => (
                  <button
                    key={index}
                    className={`quiz-option ${
                      answers[questions[currentQuestion].id] === index
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleAnswer(questions[currentQuestion].id, index)
                    }
                  >
                    <span className='option-letter'>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className='option-text'>{option}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className='quiz-typed-answer'>
                <input
                  type='text'
                  className='typed-input'
                  placeholder='Type your answer here...'
                  value={typedAnswers[questions[currentQuestion].id] || ""}
                  onChange={(e) =>
                    handleTypedAnswer(
                      questions[currentQuestion].id,
                      e.target.value
                    )
                  }
                  autoFocus
                />
              </div>
            )}
          </div>

          <div className='quiz-navigation'>
            <div></div>
            {/* <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className='btn-nav'
            >
              <i className='fa-solid fa-chevron-left'></i> Previous
            </button> */}
            <div className='quiz-dots'>
              {questions.map((q, index) => {
                const isAnswered =
                  q.type === "multiple" || q.type === "multiple-choice"
                    ? answers[q.id] !== undefined
                    : typedAnswers[q.id] && typedAnswers[q.id].trim() !== "";
                return (
                  <span
                    key={index}
                    className={`dot ${
                      index === currentQuestion ? "active" : ""
                    } ${isAnswered ? "answered" : ""}`}
                    onClick={() => setCurrentQuestion(index)}
                  ></span>
                );
              })}
            </div>
            {currentQuestion < questions.length - 1 ? (
              <button onClick={handleNext} className='btn-nav'>
                Next <i className='fa-solid fa-chevron-right'></i>
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                className='btn-submit'
              >
                <i className='fa-solid fa-check'></i> Submit Quiz
              </button>
            )}
          </div>
        </div>
      )}

      {quizCompleted && results && (
        <div className='quiz-results'>
          <div className='results-header'>
            <h2>
              <i className='fa-solid fa-trophy'></i> Quiz Complete!
            </h2>
            <div className='results-score'>
              <div className='score-value'>
                <i className='fa-solid fa-coins'></i> {results.totalCoins}
              </div>
              <div className='score-label'>coins earned</div>
            </div>
          </div>

          {/* XP Gained Display */}
          {results.assetData && (
            <div className='xp-gained-banner'>
              <i className='fa-solid fa-bolt'></i>
              <span>
                {results.assetData.name} gained {results.assetData.xpGained} XP!
              </span>
            </div>
          )}

          {/* Level Up Display */}
          {results.assetLeveledUp && results.assetData && (
            <div className='level-up-banner'>
              <div className='level-up-content'>
                <div className='level-up-header'>
                  <i className='fa-solid fa-star'></i>
                  <h3>LEVEL UP!</h3>
                  <i className='fa-solid fa-star'></i>
                </div>

                <div className='level-up-asset'>
                  <img
                    src={results.assetData.thumbnail}
                    alt={results.assetData.name}
                    className='level-up-thumbnail'
                  />
                  <div className='level-up-info'>
                    <h4>{results.assetData.name}</h4>
                    <div className='level-change'>
                      Level {results.assetData.oldLevel}{" "}
                      <i className='fa-solid fa-arrow-right'></i> Level{" "}
                      {results.assetData.newLevel}
                    </div>
                  </div>
                </div>

                <div className='stat-changes'>
                  <div className='stat-change'>
                    <i className='fa-solid fa-sword'></i>
                    <span className='stat-label'>Attack:</span>
                    <span className='stat-old'>
                      {results.assetData.oldAttack}
                    </span>
                    <i className='fa-solid fa-arrow-right'></i>
                    <span className='stat-new'>
                      {results.assetData.newAttack}
                    </span>
                  </div>
                  <div className='stat-change'>
                    <i className='fa-solid fa-shield'></i>
                    <span className='stat-label'>Defense:</span>
                    <span className='stat-old'>
                      {results.assetData.oldDefense}
                    </span>
                    <i className='fa-solid fa-arrow-right'></i>
                    <span className='stat-new'>
                      {results.assetData.newDefense}
                    </span>
                  </div>
                  <div className='stat-change'>
                    <i className='fa-solid fa-heart'></i>
                    <span className='stat-label'>Healing:</span>
                    <span className='stat-old'>
                      {results.assetData.oldHealing}
                    </span>
                    <i className='fa-solid fa-arrow-right'></i>
                    <span className='stat-new'>
                      {results.assetData.newHealing}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className='results-details'>
            <h3>
              You answered{" "}
              {results.questionResults.filter((r) => r.isCorrect).length}{" "}
              correct out of {results.questionResults.length} questions
            </h3>
            {results.questionResults.map((result, index) => (
              <div
                key={index}
                className={`result-item ${
                  result.isCorrect ? "correct" : "incorrect"
                }`}
              >
                <div className='result-question'>
                  <span className='result-number'>Q{index + 1}</span>
                  <span>{result.question}</span>
                </div>
                <div className='result-answers'>
                  <div className='result-answer'>
                    <strong>Your answer:</strong> {result.userAnswer}
                    {result.isCorrect && <i className='fa-solid fa-check'></i>}
                    {!result.isCorrect && <i className='fa-solid fa-xmark'></i>}
                  </div>
                  {!result.isCorrect && (
                    <div className='result-correct-answer'>
                      <strong>Correct answer:</strong> {result.correctAnswer}
                    </div>
                  )}
                  <div className='result-coins'>
                    <i className='fa-solid fa-coins'></i> {result.coinsEarned}{" "}
                    coins
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='results-actions'>
            {assignment.assignmentId === "1005" && (
              <button onClick={handleRetake} className='btn-retake'>
                <i className='fa-solid fa-rotate'></i> Retake Quiz (20% rewards)
              </button>
            )}
            <button
              onClick={() => navigate("/assignments")}
              className='btn-close'
            >
              Back to Assignments
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Quiz;
