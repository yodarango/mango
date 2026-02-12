import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Battle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [battle, setBattle] = useState(null);
  const [attacker, setAttacker] = useState(null);
  const [defender, setDefender] = useState(null);
  const [attackerQuestion, setAttackerQuestion] = useState(null);
  const [defenderQuestion, setDefenderQuestion] = useState(null);
  const [currentUserAvatarId, setCurrentUserAvatarId] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [attackerTimer, setAttackerTimer] = useState(20);
  const [defenderTimer, setDefenderTimer] = useState(20);
  const [showResults, setShowResults] = useState(false);
  const [battleResults, setBattleResults] = useState(null);
  const pollingIntervalRef = useRef(null);
  const attackerTimerRef = useRef(null);
  const defenderTimerRef = useRef(null);
  const hasAutoSubmittedAttacker = useRef(false);
  const hasAutoSubmittedDefender = useRef(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchBattle();

    // Scroll down 100px to hide header and show characters
    window.scrollTo({ top: 100, behavior: "smooth" });

    // Start polling every 800ms
    pollingIntervalRef.current = setInterval(() => {
      fetchBattle();
    }, 800);

    // Cleanup: stop polling when component unmounts
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [id]);

  // Play battle music for admin users
  useEffect(() => {
    if (isAdmin) {
      const audio = new Audio("/src/assets/tracks/battle.mp3");
      audio.loop = true;
      audio.play().catch((error) => {
        console.log("Audio playback failed:", error);
      });

      // Cleanup: stop audio when component unmounts
      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [isAdmin]);

  // Timer for attacker
  useEffect(() => {
    console.log(
      "Attacker Timer Effect - Question ID:",
      attackerQuestion?.id,
      "Submitted:",
      attackerQuestion?.submittedAt,
      "Auto-submitted:",
      hasAutoSubmittedAttacker.current,
    );

    // Only start timer if attacker hasn't answered and question exists
    if (
      attackerQuestion &&
      !attackerQuestion.submittedAt &&
      !hasAutoSubmittedAttacker.current
    ) {
      // Only start a new timer if one isn't already running
      if (!attackerTimerRef.current) {
        console.log(
          "Starting attacker timer for question ID:",
          attackerQuestion.id,
        );
        setAttackerTimer(20);

        attackerTimerRef.current = setInterval(() => {
          setAttackerTimer((prev) => {
            console.log("Attacker timer tick:", prev);
            if (prev <= 1) {
              // Time's up - auto submit with wrong answer
              console.log("Attacker time's up! Auto-submitting...");
              if (!hasAutoSubmittedAttacker.current) {
                hasAutoSubmittedAttacker.current = true;
                handleAnswerSelect("x", attackerQuestion.id);
              }
              clearInterval(attackerTimerRef.current);
              attackerTimerRef.current = null;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else {
      // Clear timer if question is answered
      if (attackerTimerRef.current) {
        console.log("Clearing attacker timer");
        clearInterval(attackerTimerRef.current);
        attackerTimerRef.current = null;
      }
      if (attackerQuestion?.submittedAt) {
        hasAutoSubmittedAttacker.current = false;
      }
    }

    return () => {
      // Don't clear on cleanup - let the timer run
    };
  }, [attackerQuestion?.id, attackerQuestion?.submittedAt]);

  // Timer for defender
  useEffect(() => {
    console.log(
      "Defender Timer Effect - Question ID:",
      defenderQuestion?.id,
      "Submitted:",
      defenderQuestion?.submittedAt,
      "Attacker Submitted:",
      attackerQuestion?.submittedAt,
      "Auto-submitted:",
      hasAutoSubmittedDefender.current,
    );

    // Only start timer if defender hasn't answered, question exists, and attacker has answered
    if (
      defenderQuestion &&
      !defenderQuestion.submittedAt &&
      attackerQuestion?.submittedAt &&
      !hasAutoSubmittedDefender.current
    ) {
      // Only start a new timer if one isn't already running
      if (!defenderTimerRef.current) {
        console.log(
          "Starting defender timer for question ID:",
          defenderQuestion.id,
        );
        setDefenderTimer(20);

        defenderTimerRef.current = setInterval(() => {
          setDefenderTimer((prev) => {
            console.log("Defender timer tick:", prev);
            if (prev <= 1) {
              // Time's up - auto submit with wrong answer
              console.log("Defender time's up! Auto-submitting...");
              if (!hasAutoSubmittedDefender.current) {
                hasAutoSubmittedDefender.current = true;
                handleAnswerSelect("x", defenderQuestion.id);
              }
              clearInterval(defenderTimerRef.current);
              defenderTimerRef.current = null;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else {
      // Clear timer if question is answered or waiting for attacker
      if (defenderTimerRef.current) {
        console.log("Clearing defender timer");
        clearInterval(defenderTimerRef.current);
        defenderTimerRef.current = null;
      }
      if (defenderQuestion?.submittedAt) {
        hasAutoSubmittedDefender.current = false;
      }
    }

    return () => {
      // Don't clear on cleanup - let the timer run
    };
  }, [
    defenderQuestion?.id,
    defenderQuestion?.submittedAt,
    attackerQuestion?.submittedAt,
  ]);

  const fetchCurrentUser = () => {
    try {
      const token = localStorage.getItem("user");
      if (!token) return;

      // Decode JWT token to get avatar ID and role
      const user = JSON.parse(token);
      const avatarId = user.id;
      const role = user.role;

      if (avatarId) {
        setCurrentUserAvatarId(avatarId);
      }

      if (role === "admin") {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };

  const fetchBattle = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch battle details with assets and questions included
      const battleResponse = await fetch(`/api/battles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!battleResponse.ok) {
        console.error("Failed to fetch battle");
        setLoading(false);
        return;
      }

      const data = await battleResponse.json();

      setBattle(data.battle);

      // Store game ID from battle
      if (data.battle.gameId && !gameId) {
        setGameId(data.battle.gameId);
      }

      // Check if both users have answered and calculate damage preview
      if (
        data.attackerQuestion?.submittedAt &&
        data.defenderQuestion?.submittedAt &&
        !showResults
      ) {
        // Parse questions to get correct answers
        const attackerQuestionData = JSON.parse(data.attackerQuestion.question);
        const defenderQuestionData = JSON.parse(data.defenderQuestion.question);

        // Check if answers are correct
        const attackerCorrect =
          data.attackerQuestion.userAnswer?.toLowerCase() ===
          data.attackerQuestion.answer?.toLowerCase();
        const defenderCorrect =
          data.defenderQuestion.userAnswer?.toLowerCase() ===
          data.defenderQuestion.answer?.toLowerCase();

        // Calculate damage based on battle logic
        let defenderHealthLost = 0;
        let attackerStaminaLost = 0;

        if (attackerCorrect && defenderCorrect) {
          // Both correct: Defender loses half damage
          const baseDamage =
            (data.attackerAsset.attack / data.defenderAsset.defense) * 100;
          defenderHealthLost = Math.round(baseDamage / 2);
        } else if (attackerCorrect && !defenderCorrect) {
          // Attacker correct, defender wrong: Defender loses full damage
          defenderHealthLost = Math.round(
            (data.attackerAsset.attack / data.defenderAsset.defense) * 100,
          );
        } else if (!attackerCorrect && defenderCorrect) {
          // Attacker wrong, defender correct: Attacker loses 25 stamina
          attackerStaminaLost = 25;
        } else {
          // Both wrong: Defender loses 25 health, attacker loses 25 stamina
          defenderHealthLost = 25;
          attackerStaminaLost = 25;
        }

        // Apply damage to create preview of updated stats
        const updatedAttacker = {
          ...data.attackerAsset,
          stamina: Math.max(
            0,
            data.attackerAsset.stamina - attackerStaminaLost,
          ),
        };

        const updatedDefender = {
          ...data.defenderAsset,
          health: Math.max(0, data.defenderAsset.health - defenderHealthLost),
        };

        setAttacker(updatedAttacker);
        setDefender(updatedDefender);

        setBattleResults({
          attackerCorrect,
          defenderCorrect,
          attackerAnswer: data.attackerQuestion.userAnswer,
          defenderAnswer: data.defenderQuestion.userAnswer,
          attackerCorrectAnswer: data.attackerQuestion.answer,
          defenderCorrectAnswer: data.defenderQuestion.answer,
          attackerQuestion: attackerQuestionData.question,
          defenderQuestion: defenderQuestionData.question,
          defenderHealthLost,
          attackerStaminaLost,
        });
        setShowResults(true);
      } else {
        // No damage preview - use original stats
        setAttacker(data.attackerAsset);
        setDefender(data.defenderAsset);
      }

      setAttackerQuestion(data.attackerQuestion);
      setDefenderQuestion(data.defenderQuestion);

      // Check if battle is complete and redirect to game (except admin)
      if (data.battle.status === "completed" && !isAdmin) {
        const targetGameId = data.battle.gameId || gameId;
        if (targetGameId) {
          navigate(`/play/${targetGameId}`);
          return;
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching battle:", error);
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (answer, questionId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/battles/submit-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: questionId,
          answer: answer,
          battleId: parseInt(id),
        }),
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  const handleCompleteBattle = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/battles/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ battleId: parseInt(id) }),
      });

      if (response.ok) {
        alert("Battle completed!");
        fetchBattle(); // Refresh to trigger redirect
      } else {
        alert("Failed to complete battle");
      }
    } catch (error) {
      console.error("Error completing battle:", error);
      alert("Error completing battle");
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen bg-[#282828] text-gray-300 text-2xl font-serif'>
        Loading battle...
      </div>
    );
  }

  if (!battle) {
    return (
      <div className='flex items-center justify-center h-screen bg-[#282828] text-gray-300 text-2xl font-serif'>
        Battle not found
      </div>
    );
  }

  if (!attacker || !defender) {
    return (
      <div className='flex flex-col items-center justify-center h-screen bg-[#282828] text-gray-300 text-2xl font-serif'>
        <p>Failed to load battle participants</p>
        <p className='text-sm mt-4'>
          Attacker ID: {battle.attacker || "N/A"} - {attacker ? "✓" : "✗"}
        </p>
        <p className='text-sm'>
          Defender ID: {battle.defender || "N/A"} - {defender ? "✓" : "✗"}
        </p>
      </div>
    );
  }

  const renderQuestion = (
    question,
    isUserQuestion,
    avatarName,
    isAttacker,
    timer,
  ) => {
    if (!question) return null;

    const hasAnswered = question.submittedAt !== null;

    // If both have answered, show results
    if (showResults && battleResults) {
      const isCorrect = isAttacker
        ? battleResults.attackerCorrect
        : battleResults.defenderCorrect;
      const userAnswer = isAttacker
        ? battleResults.attackerAnswer
        : battleResults.defenderAnswer;
      const correctAnswer = isAttacker
        ? battleResults.attackerCorrectAnswer
        : battleResults.defenderCorrectAnswer;
      const questionText = isAttacker
        ? battleResults.attackerQuestion
        : battleResults.defenderQuestion;

      return (
        <div className='max-w-md w-[90%] backdrop-blur-md mb-4 relative text-white'>
          <p className='font-serif text-sm text-[#ffd700] mb-4 text-center'>
            {questionText}
          </p>
          <div
            className={`p-4 rounded-lg ${isCorrect ? "bg-[#2d5016]" : "bg-[#5c1a1a]"}`}
          >
            <p className='mb-2 font-bold'>
              {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
            </p>
            <p className='text-[0.85rem]'>
              Your answer: <strong>{userAnswer}</strong>
            </p>
            {!isCorrect && (
              <p className='text-[0.85rem] text-[#ffcc00]'>
                Correct answer: <strong>{correctAnswer}</strong>
              </p>
            )}
          </div>
        </div>
      );
    }

    // If answered, show status message instead of question
    if (hasAnswered) {
      return (
        <div className='max-w-md w-[90%] backdrop-blur-md mb-4relative'>
          <p className='font-serif text-sm text-[#00ff41] text-center mb-4 font-bold'>
            {isUserQuestion
              ? "You have answered the question"
              : `${avatarName} has answered the question`}
          </p>
        </div>
      );
    }

    // Check if defender should wait for attacker
    const isDefender = !isAttacker;
    const shouldWait = isDefender && !attackerQuestion?.submittedAt;

    if (shouldWait) {
      return (
        <div className=' max-w-md w-[90%] backdrop-blur-md mb-4 relative'>
          <p className='font-serif text-base text-[#ffd700] text-center animate-pulse'>
            Waiting for attacker to answer...
          </p>
        </div>
      );
    }

    try {
      const questionData = JSON.parse(question.question);

      return (
        <div className='max-w-md w-[90%] backdrop-blur-md mb-4 relative'>
          <p className='font-serif text-base text-[#ffd700] mb-4 text-center'>
            {questionData.question}
          </p>
          <ul className='list-none p-0 m-0'>
            {questionData.options.map((option, index) => (
              <li
                key={index}
                className={`font-serif text-white p-1 my-2 bg-white/5 border border-[#00ff41] rounded cursor-pointer transition-all duration-300 hover:bg-[rgba(0,255,65,0.2)] hover:border-[#ffd700] hover:translate-x-1 ${
                  !isUserQuestion ? "cursor-not-allowed opacity-50" : ""
                }`}
                onClick={() => {
                  if (isUserQuestion) {
                    handleAnswerSelect(option, question.id);
                  }
                }}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      );
    } catch (error) {
      console.error("Error parsing question:", error);
      return null;
    }
  };

  const isAttacker = battle?.attackerAvatarId === currentUserAvatarId;
  const isDefender = battle?.defenderAvatarId === currentUserAvatarId;

  // Helper to parse and display question for admin
  const renderAdminQuestion = (question, label) => {
    if (!question) return <p>No question assigned</p>;

    try {
      const questionData = JSON.parse(question.question);

      return (
        <div className='flex-1 max-w-[500px] bg-[#282828] border-2 border-[#ff6b35] rounded-lg p-4'>
          <h4 className='text-[#ff6b35] m-0 mb-3 text-lg'>{label}</h4>
          <p className='text-gray-200 text-base mb-3 font-semibold'>
            {questionData.question}
          </p>
          <ul className='list-none p-0 m-0'>
            {questionData.options.map((option, index) => {
              const isCorrectAnswer = option === question.answer;
              const isUserAnswer = option === question.userAnswer;
              const isCorrectUserAnswer = isUserAnswer && isCorrectAnswer;
              const isIncorrectUserAnswer = isUserAnswer && !isCorrectAnswer;

              let borderClass = "border-transparent";
              if (isCorrectAnswer) {
                borderClass = "border-[#00ff41] bg-[rgba(0,255,65,0.1)]";
              }
              if (isCorrectUserAnswer) {
                borderClass = "border-[#00ff41] border-4";
              } else if (isIncorrectUserAnswer) {
                borderClass = "border-[#ff6b35] border-4";
              }

              return (
                <li
                  key={index}
                  className={`bg-[#3a3a3a] p-2 mb-2 rounded text-gray-300 border ${borderClass} ${isCorrectAnswer ? "text-[#00ff41] font-bold" : ""}`}
                >
                  {option}
                  {isCorrectAnswer && " ✓"}
                </li>
              );
            })}
          </ul>
        </div>
      );
    } catch (error) {
      return <p>Error parsing question</p>;
    }
  };

  return (
    <div className={`flex ${isAdmin ? "pb-[500px]" : ""}`}>
      <div className='flex-1 flex flex-col items-center justify-center p-8 relative bg-gradient-to-br from-[rgba(255,107,53,0.1)] to-[rgba(40,40,40,1)] border-r-2 border-[#ff6b35]'>
        <div className='flex items-center gap-4 mb-4'>
          <h2 className='text-orange-500 m-0'>Attacker</h2>
          <div className='flex items-center gap-2 bg-[#282828] px-4 py-2 rounded-full border-2 border-[#00ff41]'>
            <i className='fas fa-clock text-[#00ff41] text-base'></i>
            <span
              className={`font-bold text-lg min-w-[35px] text-center ${attackerTimer <= 5 ? "text-[#ff6b35] animate-pulse" : "text-[#00ff41]"}`}
            >
              {attackerTimer}s
            </span>
          </div>
        </div>
        {attackerQuestion &&
          renderQuestion(
            attackerQuestion,
            isAttacker,
            attacker.name,
            true,
            attackerTimer,
          )}

        {/* Health and Stamina Bars */}
        <div className='w-[90%] max-w-[500px] mb-4'>
          <div className='flex items-center gap-3 mb-3'>
            <div className='flex items-center gap-2 text-sm text-gray-300 font-semibold min-w-[90px]'>
              <i className='fas fa-heart text-[0.85rem]'></i> Health
            </div>
            <div className='flex-1 h-6 bg-[#282828] border-2 border-[#4a4a4a] rounded overflow-hidden block relative'>
              <div
                className='h-full bg-gradient-to-r from-[#ff4444] to-[#ff6b6b] transition-all duration-300 min-w-0 max-w-full'
                style={{
                  width: `${Math.min(Math.max(attacker.health, 0), 100)}%`,
                }}
              ></div>
            </div>
            <span className='min-w-[40px] text-right text-base font-bold text-[#ffd700] flex-shrink-0'>
              {attacker.health}
            </span>
          </div>
          <div className='flex items-center gap-3 mb-3'>
            <div className='flex items-center gap-2 text-sm text-gray-300 font-semibold min-w-[90px]'>
              <i className='fas fa-bolt text-[0.85rem]'></i> Stamina
            </div>
            <div className='flex-1 h-6 bg-[#282828] border-2 border-[#4a4a4a] rounded overflow-hidden block relative'>
              <div
                className='h-full bg-gradient-to-r from-[#ffd700] to-[#ffed4e] transition-all duration-300 min-w-0 max-w-full'
                style={{
                  width: `${Math.min(Math.max(attacker.stamina, 0), 100)}%`,
                }}
              ></div>
            </div>
            <span className='min-w-[40px] text-right text-base font-bold text-[#ffd700] flex-shrink-0'>
              {attacker.stamina}
            </span>
          </div>
        </div>

        <img
          src={attacker.thumbnail}
          alt={attacker.name}
          className='w-[80%] max-w-[600px] h-auto object-contain my-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]'
        />

        {/* Warrior Name */}
        <p className='font-["MedievalSharp",cursive] text-2xl font-bold text-[#ffd700] my-4 text-center uppercase tracking-[2px]'>
          {attacker.name}
        </p>

        {/* Attack and Defense Cards */}
        <div className='flex justify-center items-center gap-4 w-[90%] max-w-[500px] mt-4'>
          <div className='flex-1 flex items-center gap-3 p-4 rounded-lg bg-[#3a3a3a] border-2 border-[#ff6b35] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]'>
            <i className='fas fa-sword text-[#ff6b35] text-2xl'></i>
            <div className='flex flex-col gap-1'>
              <span className='text-xs text-gray-300 uppercase tracking-wider font-semibold'>
                Attack
              </span>
              <span className='text-2xl font-bold text-[#ffd700] font-["MedievalSharp",cursive]'>
                {attacker.attack}
              </span>
            </div>
          </div>
          <div className='flex-1 flex items-center gap-3 p-4 rounded-lg bg-[#3a3a3a] border-2 border-[#4a9eff] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]'>
            <i className='fas fa-shield text-[#4a9eff] text-2xl'></i>
            <div className='flex flex-col gap-1'>
              <span className='text-xs text-gray-300 uppercase tracking-wider font-semibold'>
                Defense
              </span>
              <span className='text-2xl font-bold text-[#ffd700] font-["MedievalSharp",cursive]'>
                {attacker.defense}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='flex-1 flex flex-col items-center justify-center p-8 relative bg-gradient-to-bl from-[rgba(0,255,65,0.1)] to-[rgba(40,40,40,1)] border-l-2 border-[#00ff41]'>
        <div className='flex items-center gap-4 mb-4'>
          <h2 className='text-green-500 m-0'>Defender</h2>
          <div className='flex items-center gap-2 bg-[#282828] px-4 py-2 rounded-full border-2 border-[#00ff41]'>
            <i className='fas fa-clock text-[#00ff41] text-base'></i>
            <span
              className={`font-bold text-lg min-w-[35px] text-center ${defenderTimer <= 5 ? "text-[#ff6b35] animate-pulse" : "text-[#00ff41]"}`}
            >
              {defenderTimer}s
            </span>
          </div>
        </div>
        {defenderQuestion &&
          renderQuestion(
            defenderQuestion,
            isDefender,
            defender.name,
            false,
            defenderTimer,
          )}

        {/* Health and Stamina Bars */}
        <div className='w-[90%] max-w-[500px] mb-4'>
          <div className='flex items-center gap-3 mb-3'>
            <div className='flex items-center gap-2 text-sm text-gray-300 font-semibold min-w-[90px]'>
              <i className='fas fa-heart text-[0.85rem]'></i> Health
            </div>
            <div className='flex-1 h-6 bg-[#282828] border-2 border-[#4a4a4a] rounded overflow-hidden block relative'>
              <div
                className='h-full bg-gradient-to-r from-[#ff4444] to-[#ff6b6b] transition-all duration-300 min-w-0 max-w-full'
                style={{
                  width: `${Math.min(Math.max(defender.health, 0), 100)}%`,
                }}
              ></div>
            </div>
            <span className='min-w-[40px] text-right text-base font-bold text-[#ffd700] flex-shrink-0'>
              {defender.health}
            </span>
          </div>
          <div className='flex items-center gap-3 mb-3'>
            <div className='flex items-center gap-2 text-sm text-gray-300 font-semibold min-w-[90px]'>
              <i className='fas fa-bolt text-[0.85rem]'></i> Stamina
            </div>
            <div className='flex-1 h-6 bg-[#282828] border-2 border-[#4a4a4a] rounded overflow-hidden block relative'>
              <div
                className='h-full bg-gradient-to-r from-[#ffd700] to-[#ffed4e] transition-all duration-300 min-w-0 max-w-full'
                style={{
                  width: `${Math.min(Math.max(defender.stamina, 0), 100)}%`,
                }}
              ></div>
            </div>
            <span className='min-w-[40px] text-right text-base font-bold text-[#ffd700] flex-shrink-0'>
              {defender.stamina}
            </span>
          </div>
        </div>

        <img
          src={defender.thumbnail}
          alt={defender.name}
          className='w-[80%] max-w-[600px] h-auto object-contain my-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]'
        />

        {/* Warrior Name */}
        <p className='font-["MedievalSharp",cursive] text-2xl font-bold text-[#ffd700] my-4 text-center uppercase tracking-[2px]'>
          {defender.name}
        </p>

        {/* Attack and Defense Cards */}
        <div className='flex justify-center items-center gap-4 w-[90%] max-w-[500px] mt-4'>
          <div className='flex-1 flex items-center gap-3 p-4 rounded-lg bg-[#3a3a3a] border-2 border-[#ff6b35] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]'>
            <i className='fas fa-sword text-[#ff6b35] text-2xl'></i>
            <div className='flex flex-col gap-1'>
              <span className='text-xs text-gray-300 uppercase tracking-wider font-semibold'>
                Attack
              </span>
              <span className='text-2xl font-bold text-[#ffd700] font-["MedievalSharp",cursive]'>
                {defender.attack}
              </span>
            </div>
          </div>
          <div className='flex-1 flex items-center gap-3 p-4 rounded-lg bg-[#3a3a3a] border-2 border-[#4a9eff] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]'>
            <i className='fas fa-shield text-[#4a9eff] text-2xl'></i>
            <div className='flex flex-col gap-1'>
              <span className='text-xs text-gray-300 uppercase tracking-wider font-semibold'>
                Defense
              </span>
              <span className='text-2xl font-bold text-[#ffd700] font-["MedievalSharp",cursive]'>
                {defender.defense}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Panel */}
      {isAdmin && (
        <div className='fixed bottom-0 left-0 right-0 bg-[#3a3a3a] border-t-[3px] border-[#ffd700] p-6 max-h-[40vh] overflow-y-auto z-[1000]'>
          <h3 className='text-[#ffd700] m-0 mb-4 text-center text-xl'>
            Admin Panel
          </h3>
          <div className='flex gap-8 mb-4 justify-center'>
            {renderAdminQuestion(
              attackerQuestion,
              `${attacker.name}'s Question`,
            )}
            {renderAdminQuestion(
              defenderQuestion,
              `${defender.name}'s Question`,
            )}
          </div>
          <button
            className='w-full max-w-[400px] mx-auto block bg-[#00ff41] text-[#282828] border-none p-4 rounded-md font-bold text-lg cursor-pointer transition-all duration-300 hover:bg-[#ffd700] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,215,0,0.4)]'
            onClick={handleCompleteBattle}
          >
            Complete Battle
          </button>
        </div>
      )}
    </div>
  );
}

export default Battle;
