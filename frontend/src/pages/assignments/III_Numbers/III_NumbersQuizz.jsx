import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./III_NumbersQuizz.css";

// Question bank - 18 total questions
const QUESTION_BANK = [
  {
    id: 1,
    question: "How do you say '7' in Spanish?",
    options: ["seis", "siete", "ocho", "nueve"],
    correct: 1,
  },
  {
    id: 2,
    question: "What pattern do numbers 11-15 follow?",
    options: [
      "They all end in -enta",
      "They all end in -ce",
      "They use diez + digit",
      "They are all unique",
    ],
    correct: 1,
  },
  {
    id: 3,
    question: "How do you say '16' in Spanish?",
    options: ["dieciséis", "quince", "catorce", "veinte"],
    correct: 0,
  },
  {
    id: 4,
    question: "What does 'cincuenta' mean in English?",
    options: ["40", "50", "60", "70"],
    correct: 1,
  },
  {
    id: 5,
    question: "How do you say '200' in Spanish?",
    options: ["cien", "doscientos", "trescientos", "cuatrocientos"],
    correct: 1,
  },
  {
    id: 6,
    question: "What is the Spanish word for '13'?",
    options: ["doce", "trece", "catorce", "quince"],
    correct: 1,
  },
  {
    id: 7,
    question: "Which ending do decimal numbers (30, 40, 50) use?",
    options: ["-ce", "-enta", "-cientos", "-diez"],
    correct: 1,
  },
  {
    id: 8,
    question: "How do you say '90' in Spanish?",
    options: ["ochenta", "noventa", "setenta", "sesenta"],
    correct: 1,
  },
  {
    id: 9,
    question: "What is '500' in Spanish?",
    options: ["quinientos", "cuatrocientos", "seiscientos", "setecientos"],
    correct: 0,
  },
  {
    id: 10,
    question: "How do you say '3' in Spanish?",
    options: ["dos", "tres", "cuatro", "cinco"],
    correct: 1,
  },
  {
    id: 11,
    question: "What is 'dieciocho' in English?",
    options: ["16", "17", "18", "19"],
    correct: 2,
  },
  {
    id: 12,
    question: "How do you say '70' in Spanish?",
    options: ["sesenta", "setenta", "ochenta", "noventa"],
    correct: 1,
  },
  {
    id: 13,
    question: "What is '800' in Spanish?",
    options: ["setecientos", "ochocientos", "novecientos", "seiscientos"],
    correct: 1,
  },
  {
    id: 14,
    question: "How do you say '15' in Spanish?",
    options: ["catorce", "quince", "dieciséis", "trece"],
    correct: 1,
  },
  {
    id: 15,
    question: "What pattern do numbers 16-19 follow?",
    options: [
      "They end in -ce",
      "They end in -enta",
      "They use diez + single digit",
      "They are unique",
    ],
    correct: 2,
  },
  {
    id: 16,
    question: "How do you say '40' in Spanish?",
    options: ["treinta", "cuarenta", "cincuenta", "sesenta"],
    correct: 1,
  },
  {
    id: 17,
    question: "What is '300' in Spanish?",
    options: ["doscientos", "trescientos", "cuatrocientos", "quinientos"],
    correct: 1,
  },
  {
    id: 18,
    question: "How do you say '9' in Spanish?",
    options: ["siete", "ocho", "nueve", "diez"],
    correct: 2,
  },
];

const QUIZ_TIME = 60 * 2;
const COINS_PER_QUESTION = 20;
const TOTAL_QUESTIONS = 6;

function NumbersQuiz({ isOpen, onClose, assignmentId }) {
  const [showWarning, setShowWarning] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    if (!isOpen) return;

    const savedState = localStorage.getItem("III_numbers");
    if (savedState) {
      const state = JSON.parse(savedState);
      if (state.completed) {
        setQuizCompleted(true);
        setResults(state.results);
        setShowWarning(false); // Skip warning screen if already completed
      }
    }
  }, [isOpen]);

  // Select random questions when quiz starts
  const startQuiz = () => {
    const shuffled = [...QUESTION_BANK].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, TOTAL_QUESTIONS);
    const randomized = selected.map((q) => ({
      ...q,
      options: [...q.options].sort(() => Math.random() - 0.5),
    }));
    setQuestions(randomized);
    setShowWarning(false);
    setQuizStarted(true);
  };

  // Timer countdown
  useEffect(() => {
    if (!quizStarted || quizCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, quizCompleted]);

  const handleAnswer = (questionId, answerIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
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
    if (!autoSubmit && Object.keys(answers).length < questions.length) {
      if (
        !window.confirm("You haven't answered all questions. Submit anyway?")
      ) {
        return;
      }
    }

    setSubmitting(true);

    // Calculate results
    let correctCount = 0;
    const questionResults = questions.map((q) => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correct;
      if (isCorrect) correctCount++;

      return {
        question: q.question,
        userAnswer:
          userAnswer !== undefined ? q.options[userAnswer] : "No answer",
        correctAnswer: q.options[q.correct],
        isCorrect,
      };
    });

    const score = correctCount * COINS_PER_QUESTION;
    const timeSpent = QUIZ_TIME - timeLeft;

    const resultsData = {
      score,
      correctCount,
      totalQuestions: questions.length,
      timeSpent,
      questionResults,
      completedAt: new Date().toISOString(),
    };

    // Save to localStorage
    localStorage.setItem(
      "III_numbers",
      JSON.stringify({
        completed: true,
        results: resultsData,
        answers,
        timeSpent,
      })
    );

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
          assignmentId: "1000",
          coinsReceived: score,
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

    setResults(resultsData);
    setQuizCompleted(true);
    setSubmitting(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  const content = (
    <>
      <div className='quiz-overlay' onClick={onClose}></div>
      <div className='quiz-modal'>
        {showWarning && (
          <div className='quiz-warning'>
            <div className='warning-header'>
              <h2>
                <i className='fa-solid fa-circle-info'></i> Before You Start
              </h2>
            </div>
            <div className='warning-content'>
              <p>
                <strong>Important Information:</strong>
              </p>
              <ul>
                <li>
                  This quiz contains <strong>6 questions</strong>
                </li>
                <li>
                  You have <strong>4 minutes</strong> to complete it
                </li>
                <li>
                  Each question is worth <strong>20 coins</strong>
                </li>
                <li>
                  <strong>You cannot pause</strong> once you start
                </li>
                <li>Questions are randomly selected and shuffled</li>
              </ul>
              <p className='warning-note'>
                <i className='fa-solid fa-exclamation-triangle'></i> Make sure
                you're ready before starting!
              </p>
            </div>
            <div className='warning-actions'>
              <button onClick={onClose} className='btn-cancel'>
                Cancel
              </button>
              <button onClick={startQuiz} className='btn-start'>
                <i className='fa-solid fa-play'></i> Start Quiz
              </button>
            </div>
          </div>
        )}

        {quizStarted && !quizCompleted && questions.length > 0 && (
          <div className='quiz-content'>
            <div className='quiz-header'>
              <div className='quiz-progress'>
                Question {currentQuestion + 1} of {questions.length}
              </div>
              <div className={`quiz-timer ${timeLeft < 60 ? "warning" : ""}`}>
                <i className='fa-solid fa-clock'></i> {formatTime(timeLeft)}
              </div>
            </div>

            <div className='quiz-question'>
              <h3>{questions[currentQuestion].question}</h3>
              <div className='quiz-options'>
                {questions[currentQuestion].options.map((option, index) => (
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
            </div>

            <div className='quiz-navigation'>
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className='btn-nav'
              >
                <i className='fa-solid fa-chevron-left'></i> Previous
              </button>
              <div className='quiz-dots'>
                {questions.map((_, index) => (
                  <span
                    key={index}
                    className={`dot ${
                      index === currentQuestion ? "active" : ""
                    } ${
                      answers[questions[index].id] !== undefined
                        ? "answered"
                        : ""
                    }`}
                    onClick={() => setCurrentQuestion(index)}
                  ></span>
                ))}
              </div>
              {currentQuestion < questions.length - 1 ? (
                <button onClick={handleNext} className='btn-nav'>
                  Next <i className='fa-solid fa-chevron-right'></i>
                </button>
              ) : (
                <button
                  onClick={() => handleSubmit(false)}
                  className='btn-submit'
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Quiz"}
                </button>
              )}
            </div>
          </div>
        )}

        {quizCompleted && results && (
          <div className='quiz-results'>
            <div className='results-header'>
              <h2>
                <i className='fa-solid fa-trophy'></i> Quiz Results
              </h2>
              <div className='results-score'>
                <div className='score-value'>
                  <i className='fa-solid fa-coins'></i> {results.score}
                </div>
                <div className='score-label'>coins earned</div>
              </div>
            </div>

            <div className='results-summary'>
              <div className='summary-stat'>
                <i className='fa-solid fa-check-circle'></i>
                <span>
                  {results.correctCount} / {results.totalQuestions} Correct
                </span>
              </div>
              <div className='summary-stat'>
                <i className='fa-solid fa-clock'></i>
                <span>Time: {formatTime(results.timeSpent)}</span>
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
                      {result.isCorrect && (
                        <i className='fa-solid fa-check'></i>
                      )}
                    </div>
                    {!result.isCorrect && (
                      <div className='result-answer correct-answer'>
                        <strong>Correct answer:</strong> {result.correctAnswer}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className='results-actions'>
              <button onClick={onClose} className='btn-close'>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return createPortal(content, document.body);
}

export default NumbersQuiz;
