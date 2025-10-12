import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateBattle.css";

function CreateBattle() {
  const navigate = useNavigate();
  const [battleName, setBattleName] = useState("");
  const [reward, setReward] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    answer: "",
    possiblePoints: 10,
    time: 60,
  });

  // Load questions and battle details from localStorage on mount
  useEffect(() => {
    const savedQuestions = localStorage.getItem("battleQuestions");
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    }

    const savedName = localStorage.getItem("battleName");
    if (savedName) {
      setBattleName(savedName);
    }

    const savedReward = localStorage.getItem("battleReward");
    if (savedReward) {
      setReward(savedReward);
    }
  }, []);

  // Save questions to localStorage whenever they change
  useEffect(() => {
    if (questions.length > 0) {
      localStorage.setItem("battleQuestions", JSON.stringify(questions));
    }
  }, [questions]);

  // Save battle name to localStorage whenever it changes
  useEffect(() => {
    if (battleName) {
      localStorage.setItem("battleName", battleName);
    }
  }, [battleName]);

  // Save reward to localStorage whenever it changes
  useEffect(() => {
    if (reward) {
      localStorage.setItem("battleReward", reward);
    }
  }, [reward]);

  const handleAddQuestion = () => {
    if (!currentQuestion.question || !currentQuestion.answer) {
      alert("Please fill in question and answer");
      return;
    }

    setQuestions([...questions, { ...currentQuestion, id: Date.now() }]);
    setCurrentQuestion({
      question: "",
      answer: "",
      possiblePoints: 10,
      time: 60,
    });
  };

  const handleRemoveQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        let parsedQuestions = [];

        if (file.name.endsWith(".json")) {
          parsedQuestions = JSON.parse(content);
        } else if (file.name.endsWith(".csv")) {
          const lines = content.split("\n");
          // Skip header row
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const [question, answer, possiblePoints, time] = line.split(",");
            parsedQuestions.push({
              id: Date.now() + i,
              question: question?.trim() || "",
              answer: answer?.trim() || "",
              possiblePoints: parseInt(possiblePoints) || 10,
              time: parseInt(time) || 60,
            });
          }
        }

        setQuestions([...questions, ...parsedQuestions]);
        alert(`${parsedQuestions.length} questions imported successfully!`);
      } catch (error) {
        alert("Error parsing file: " + error.message);
      }
    };
    reader.readAsText(file);
  };

  const handleCreateBattle = async () => {
    if (!battleName) {
      alert("Please enter a battle name");
      return;
    }

    if (questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/battles/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: battleName,
          reward: reward,
          questions: questions.map((q) => ({
            question: q.question,
            answer: q.answer,
            possiblePoints: q.possiblePoints,
            time: q.time,
          })),
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Clear localStorage
        localStorage.removeItem("battleQuestions");
        localStorage.removeItem("battleName");
        localStorage.removeItem("battleReward");
        alert("Battle created successfully!");
        navigate(`/admin/battle/${data.battleId}`);
      } else {
        alert("Failed to create battle");
      }
    } catch (error) {
      console.error("Error creating battle:", error);
      alert("Error creating battle");
    }
  };

  return (
    <div className='create-battle-container'>
      <div className='create-battle-header'>
        <h1>
          <i className='fa-solid fa-swords'></i> Create Battle
        </h1>
      </div>

      <div className='battle-form'>
        <div className='form-section'>
          <h2>
            <i className='fa-solid fa-info-circle'></i> Battle Details
          </h2>

          <div className='form-group'>
            <label>
              <i className='fa-solid fa-tag'></i> Battle Name
            </label>
            <input
              type='text'
              value={battleName}
              onChange={(e) => setBattleName(e.target.value)}
              placeholder='Enter battle name'
            />
          </div>

          <div className='form-group'>
            <label>
              <i className='fa-solid fa-trophy'></i> Reward
            </label>
            <input
              type='text'
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder='Enter reward (optional)'
            />
          </div>
        </div>

        <div className='form-section'>
          <h2>
            <i className='fa-solid fa-question-circle'></i> Add Questions
          </h2>

          <div className='form-group'>
            <label>
              <i className='fa-solid fa-align-left'></i> Question (HTML
              supported)
            </label>
            <textarea
              value={currentQuestion.question}
              onChange={(e) =>
                setCurrentQuestion({
                  ...currentQuestion,
                  question: e.target.value,
                })
              }
              placeholder='Enter question (HTML tags allowed)'
              rows='4'
            ></textarea>
          </div>

          <div className='form-group'>
            <label>
              <i className='fa-solid fa-check'></i> Answer
            </label>
            <input
              type='text'
              value={currentQuestion.answer}
              onChange={(e) =>
                setCurrentQuestion({
                  ...currentQuestion,
                  answer: e.target.value,
                })
              }
              placeholder='Enter correct answer'
            />
          </div>

          <div className='form-row'>
            <div className='form-group'>
              <label>
                <i className='fa-solid fa-star'></i> Possible Points
              </label>
              <input
                type='number'
                value={currentQuestion.possiblePoints}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    possiblePoints: parseInt(e.target.value),
                  })
                }
                min='1'
              />
            </div>

            <div className='form-group'>
              <label>
                <i className='fa-solid fa-clock'></i> Time (seconds)
              </label>
              <input
                type='number'
                value={currentQuestion.time}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    time: parseInt(e.target.value),
                  })
                }
                min='10'
              />
            </div>
          </div>

          <button className='add-question-btn' onClick={handleAddQuestion}>
            <i className='fa-solid fa-plus'></i> Add Question
          </button>

          <div className='file-upload'>
            <label htmlFor='file-upload' className='file-upload-label'>
              <i className='fa-solid fa-upload'></i> Upload CSV/JSON
            </label>
            <input
              id='file-upload'
              type='file'
              accept='.csv,.json'
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            <p className='file-hint'>
              CSV format: question,answer,possiblePoints,time
            </p>
          </div>
        </div>

        <div className='questions-list'>
          <h2>
            <i className='fa-solid fa-list'></i> Questions ({questions.length})
          </h2>
          {questions.length === 0 ? (
            <p className='no-questions'>No questions added yet</p>
          ) : (
            questions.map((q, index) => (
              <div key={q.id} className='question-item'>
                <div className='question-header'>
                  <span className='question-number'>#{index + 1}</span>
                  <button
                    className='remove-btn'
                    onClick={() => handleRemoveQuestion(q.id)}
                  >
                    <i className='fa-solid fa-trash'></i>
                  </button>
                </div>
                <div
                  className='question-preview'
                  dangerouslySetInnerHTML={{ __html: q.question }}
                ></div>
                <div className='question-meta'>
                  <span>
                    <i className='fa-solid fa-star'></i> {q.possiblePoints} pts
                  </span>
                  <span>
                    <i className='fa-solid fa-clock'></i> {q.time}s
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <button className='create-btn' onClick={handleCreateBattle}>
          <i className='fa-solid fa-swords'></i> Create Battle
        </button>
      </div>
    </div>
  );
}

export default CreateBattle;
