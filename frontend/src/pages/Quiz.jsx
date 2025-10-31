import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Quiz.css";

function Quiz() {
  const { assignmentId } = useParams(); // Get assignmentId from URL (e.g., "1001")
  const navigate = useNavigate();
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
        }

        // Check if already completed
        if (assignmentData.completed) {
          setQuizCompleted(true);
          // Load results from assignment data if available
          // You might want to store results separately
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

      // Handle multiple choice questions (both "multiple" and "multiple-choice" types)
      if (q.type === "multiple" || q.type === "multiple-choice") {
        const answerIndex = answers[q.id];
        if (answerIndex !== undefined) {
          // Support both "answer" and "options" field names
          const optionsList = q.options || q.answer;
          userAnswer = optionsList[answerIndex];
          isCorrect = q.correct === answerIndex;
        }
      }
      // Handle input/typed questions (both "typed" and "input" types)
      else if (q.type === "typed" || q.type === "input") {
        const typedAnswer = typedAnswers[q.id];
        if (typedAnswer) {
          userAnswer = typedAnswer;
          // For typed answers, q.answer should be an array of acceptable answers
          const acceptableAnswers = Array.isArray(q.answer)
            ? q.answer
            : [q.answer];
          isCorrect = acceptableAnswers.some(
            (correct) =>
              correct.toLowerCase() === typedAnswer.toLowerCase().trim()
          );
        }
      }

      if (isCorrect) {
        totalCoins += q.coins_worth;
      }

      return {
        questionId: q.id,
        question: q.question,
        type: q.type,
        userAnswer,
        isCorrect,
        coinsEarned: isCorrect ? q.coins_worth : 0,
      };
    });

    const resultsData = {
      totalCoins,
      questionResults,
      completedAt: new Date().toISOString(),
    };

    setResults(resultsData);

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
          assignmentId: assignmentId, // Use the assignmentId from URL params
          coinsReceived: totalCoins,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        console.log(
          "Assignment submitted successfully. New coins:",
          data.coins
        );
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
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
                Total coins possible: <strong>{assignment.coins}</strong>
              </li>
              <li>
                <strong>Each question is timed individually</strong>
              </li>
              <li>
                <strong>You cannot pause</strong> once you start
              </li>
            </ul>
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

          <div className='results-details'>
            <h3>Question Review</h3>
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
                  </div>
                  <div className='result-coins'>
                    <i className='fa-solid fa-coins'></i> {result.coinsEarned}{" "}
                    coins
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='results-actions'>
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
