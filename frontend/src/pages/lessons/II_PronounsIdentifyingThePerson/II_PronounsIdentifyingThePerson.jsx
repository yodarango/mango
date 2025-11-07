import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./II_PronounsIdentifyingThePerson.css";

function IIPronounsIdentifyingThePerson() {
  // Exercise 2: Matching Game State
  const [matchingAnswers, setMatchingAnswers] = useState({
    tu: "",
    nosotros: "",
    yo: "",
    ellas: "",
    usted: "",
    vosotros: "",
  });
  const [matchingResults, setMatchingResults] = useState({});

  // Exercise 3: Fill in the Blank State
  const [fillBlankAnswers, setFillBlankAnswers] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
  });
  const [fillBlankResults, setFillBlankResults] = useState({});

  // Load saved progress from localStorage
  useEffect(() => {
    const savedMatching = localStorage.getItem("serLesson_matching");
    const savedFillBlank = localStorage.getItem("serLesson_fillBlank");

    if (savedMatching) {
      setMatchingAnswers(JSON.parse(savedMatching));
    }
    if (savedFillBlank) {
      setFillBlankAnswers(JSON.parse(savedFillBlank));
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = () => {
    localStorage.setItem("serLesson_matching", JSON.stringify(matchingAnswers));
    localStorage.setItem(
      "serLesson_fillBlank",
      JSON.stringify(fillBlankAnswers)
    );
  };

  // Exercise 2: Check Matching Answers
  const checkMatching = () => {
    const correctAnswers = {
      tu: "eres",
      nosotros: "somos",
      yo: "soy",
      ellas: "son",
      usted: "es",
      vosotros: "sois",
    };

    const results = {};
    Object.keys(matchingAnswers).forEach((key) => {
      results[key] = matchingAnswers[key].toLowerCase() === correctAnswers[key];
    });

    setMatchingResults(results);
    saveProgress();
  };

  // Exercise 3: Check Fill in the Blank Answers
  const checkFillBlank = () => {
    const correctAnswers = {
      q1: "soy",
      q2: "es",
      q3: "somos",
      q4: "son",
      q5: "eres",
    };

    const results = {};
    Object.keys(fillBlankAnswers).forEach((key) => {
      results[key] =
        fillBlankAnswers[key].toLowerCase() === correctAnswers[key];
    });

    setFillBlankResults(results);
    saveProgress();
  };

  return (
    <div className='identity-words-container'>
      <div className='identity-words-header'>
        <div>
          <h1>
            <i className='fa-solid fa-id-card'></i> Finding Your Spanish
            Identity Word
          </h1>
          <p className='subtitle'>
            Learn the six special Identity Words (ser) 🔑
          </p>
        </div>
      </div>

      {/* Introduction */}
      <div className='intro-section'>
        <h2>🎯 Goal</h2>
        <p className='intro-text'>
          To learn the six special <strong>Identity Words</strong> (the forms of{" "}
          <em>ser</em>) that match our six Spanish Name-Tags (pronouns).
        </p>
        <div className='key-concept-box'>
          <div className='key-icon'>🔑</div>
          <div>
            <h3>The Key Concept</h3>
            <p>
              Just like a house key only opens one door, each Spanish Name-Tag
              (pronoun) only works with one specific Identity Word (verb form)
              to unlock a correct sentence!
            </p>
          </div>
        </div>
      </div>

      {/* Warm-Up: Quick Review */}
      <div className='section-card purple-border'>
        <h2>
          <span className='emoji'>🔥</span> Warm-Up: Remember Your Name-Tags!
        </h2>
        <p>
          In English, we say "I am" or "we are." But Spanish is special: every
          Spanish Name-Tag gets its very own special Identity Word!
        </p>

        <div className='name-tags-grid'>
          <div className='name-tag-item'>
            <span className='emoji'>🙋‍♂️</span>
            <strong>Yo</strong> = I
          </div>
          <div className='name-tag-item'>
            <span className='emoji'>👉</span>
            <strong>Tú</strong> = You (friend)
          </div>
          <div className='name-tag-item'>
            <span className='emoji'>👤</span>
            <strong>Él/Ella/Usted</strong> = He/She/You (polite)
          </div>
          <div className='name-tag-item'>
            <span className='emoji'>👥</span>
            <strong>Nosotros/as</strong> = We
          </div>
          <div className='name-tag-item'>
            <span className='emoji'>👫</span>
            <strong>Vosotros/as</strong> = You all (friends)
          </div>
          <div className='name-tag-item'>
            <span className='emoji'>👨‍👩‍👧‍👦</span>
            <strong>Ellos/Ellas/Ustedes</strong> = They/You all
          </div>
        </div>
      </div>

      {/* The Six Identity Words */}
      <div className='section-card green-border'>
        <h2>
          <span className='emoji'>✨</span> The Six Identity Words (Ser)
        </h2>
        <p className='section-intro'>
          The basic form of this word is <strong>ser</strong>. Here's how it
          changes to fit each person:
        </p>

        <div className='identity-words-grid'>
          {/* Yo - Soy */}
          <div className='identity-card yo-identity'>
            <div className='identity-emoji'>🙋‍♂️</div>
            <div className='identity-pronoun'>Yo</div>
            <div className='identity-verb'>SOY</div>
            <div className='identity-mnemonic'>
              <i className='fa-solid fa-lightbulb'></i> Yo is proud and stands
              tall! Say <strong>SOY</strong> (like "I so am a great kid!")
            </div>
            <div className='identity-example'>
              Yo <strong>soy</strong> estudiante. (I am a student.)
            </div>
          </div>

          {/* Tú - Eres */}
          <div className='identity-card tu-identity'>
            <div className='identity-emoji'>👉</div>
            <div className='identity-pronoun'>Tú</div>
            <div className='identity-verb'>ERES</div>
            <div className='identity-mnemonic'>
              <i className='fa-solid fa-lightbulb'></i> Tú is talking to a
              friend, so they give them <strong>ERES</strong> (the R's rhyme
              with "yours").
            </div>
            <div className='identity-example'>
              Tú <strong>eres</strong> mi amigo/a. (You are my friend.)
            </div>
          </div>

          {/* Él/Ella/Usted - Es */}
          <div className='identity-card el-identity'>
            <div className='identity-emoji'>👤</div>
            <div className='identity-pronoun'>Él/Ella/Usted</div>
            <div className='identity-verb'>ES</div>
            <div className='identity-mnemonic'>
              <i className='fa-solid fa-lightbulb'></i> This is the quickest,
              tiniest word. <strong>ES</strong> is short, fast, and simple!
            </div>
            <div className='identity-example'>
              Ella <strong>es</strong> española. (She is Spanish.)
            </div>
          </div>

          {/* Nosotros - Somos */}
          <div className='identity-card nosotros-identity'>
            <div className='identity-emoji'>👥</div>
            <div className='identity-pronoun'>Nosotros/as</div>
            <div className='identity-verb'>SOMOS</div>
            <div className='identity-mnemonic'>
              <i className='fa-solid fa-lightbulb'></i> Nosotros (us) is big, so
              we take the "so" from soy and add <strong>MOS</strong> (most of us
              are here).
            </div>
            <div className='identity-example'>
              Nosotros <strong>somos</strong> felices. (We are happy.)
            </div>
          </div>

          {/* Vosotros - Sois */}
          <div className='identity-card vosotros-identity'>
            <div className='identity-emoji'>👫</div>
            <div className='identity-pronoun'>Vosotros/as</div>
            <div className='identity-verb'>SOIS</div>
            <div className='identity-mnemonic'>
              <i className='fa-solid fa-lightbulb'></i> Vosotros and{" "}
              <strong>SOIS</strong> both end with the letter 'S'! They match
              perfectly.
            </div>
            <div className='identity-example'>
              Vosotros <strong>sois</strong> amigos. (You all are friends.)
            </div>
          </div>

          {/* Ellos/Ellas/Ustedes - Son */}
          <div className='identity-card ellos-identity'>
            <div className='identity-emoji'>👨‍👩‍👧‍👦</div>
            <div className='identity-pronoun'>Ellos/Ellas/Ustedes</div>
            <div className='identity-verb'>SON</div>
            <div className='identity-mnemonic'>
              <i className='fa-solid fa-lightbulb'></i> This word sounds like
              the final ringing of a bell! When they're all together, they are{" "}
              <strong>SON</strong>.
            </div>
            <div className='identity-example'>
              Ellos <strong>son</strong> mis padres. (They are my parents.)
            </div>
          </div>
        </div>
      </div>

      {/* Exercise 1: The Spanish Team Chant */}
      <div className='section-card orange-border'>
        <h2>
          <span className='emoji'>📣</span> Exercise 1: The Spanish Team Chant
        </h2>
        <p>Practice saying these pairs out loud like they're a team!</p>

        <div className='chant-box'>
          <div className='chant-item'>
            <span className='chant-number'>1.</span>
            <span className='chant-pronoun'>Yo</span>
            <span className='chant-dots'>...</span>
            <span className='chant-verb'>Soy</span>
          </div>
          <div className='chant-item'>
            <span className='chant-number'>2.</span>
            <span className='chant-pronoun'>Tú</span>
            <span className='chant-dots'>...</span>
            <span className='chant-verb'>Eres</span>
          </div>
          <div className='chant-item'>
            <span className='chant-number'>3.</span>
            <span className='chant-pronoun'>Él/Ella/Usted</span>
            <span className='chant-dots'>...</span>
            <span className='chant-verb'>Es</span>
          </div>
          <div className='chant-item'>
            <span className='chant-number'>4.</span>
            <span className='chant-pronoun'>Nosotros/as</span>
            <span className='chant-dots'>...</span>
            <span className='chant-verb'>Somos</span>
          </div>
          <div className='chant-item'>
            <span className='chant-number'>5.</span>
            <span className='chant-pronoun'>Vosotros/as</span>
            <span className='chant-dots'>...</span>
            <span className='chant-verb'>Sois</span>
          </div>
          <div className='chant-item'>
            <span className='chant-number'>6.</span>
            <span className='chant-pronoun'>Ellos/Ellas/Ustedes</span>
            <span className='chant-dots'>...</span>
            <span className='chant-verb'>Son</span>
          </div>
        </div>

        <div className='tip-box'>
          <i className='fa-solid fa-volume-high'></i> Say this chant three times
          out loud!
        </div>
      </div>

      {/* Exercise 2: Matching Game */}
      <div className='section-card blue-border'>
        <h2>
          <span className='emoji'>🎯</span> Exercise 2: Find the Match!
        </h2>
        <p>Match each Name-Tag to its correct Identity Word!</p>

        <div className='matching-exercise'>
          <div className='matching-row'>
            <div className='matching-pronoun'>
              <span className='emoji'>👉</span> Tú
            </div>
            <input
              type='text'
              className={`matching-input ${
                matchingResults.tu === true
                  ? "correct"
                  : matchingResults.tu === false
                  ? "incorrect"
                  : ""
              }`}
              value={matchingAnswers.tu}
              onChange={(e) =>
                setMatchingAnswers({ ...matchingAnswers, tu: e.target.value })
              }
              placeholder='Type the verb...'
            />
            {matchingResults.tu === true && (
              <span className='result-icon correct'>✓</span>
            )}
            {matchingResults.tu === false && (
              <span className='result-icon incorrect'>✗</span>
            )}
          </div>

          <div className='matching-row'>
            <div className='matching-pronoun'>
              <span className='emoji'>👥</span> Nosotros
            </div>
            <input
              type='text'
              className={`matching-input ${
                matchingResults.nosotros === true
                  ? "correct"
                  : matchingResults.nosotros === false
                  ? "incorrect"
                  : ""
              }`}
              value={matchingAnswers.nosotros}
              onChange={(e) =>
                setMatchingAnswers({
                  ...matchingAnswers,
                  nosotros: e.target.value,
                })
              }
              placeholder='Type the verb...'
            />
            {matchingResults.nosotros === true && (
              <span className='result-icon correct'>✓</span>
            )}
            {matchingResults.nosotros === false && (
              <span className='result-icon incorrect'>✗</span>
            )}
          </div>

          <div className='matching-row'>
            <div className='matching-pronoun'>
              <span className='emoji'>🙋‍♂️</span> Yo
            </div>
            <input
              type='text'
              className={`matching-input ${
                matchingResults.yo === true
                  ? "correct"
                  : matchingResults.yo === false
                  ? "incorrect"
                  : ""
              }`}
              value={matchingAnswers.yo}
              onChange={(e) =>
                setMatchingAnswers({ ...matchingAnswers, yo: e.target.value })
              }
              placeholder='Type the verb...'
            />
            {matchingResults.yo === true && (
              <span className='result-icon correct'>✓</span>
            )}
            {matchingResults.yo === false && (
              <span className='result-icon incorrect'>✗</span>
            )}
          </div>

          <div className='matching-row'>
            <div className='matching-pronoun'>
              <span className='emoji'>👨‍👩‍👧‍👦</span> Ellas
            </div>
            <input
              type='text'
              className={`matching-input ${
                matchingResults.ellas === true
                  ? "correct"
                  : matchingResults.ellas === false
                  ? "incorrect"
                  : ""
              }`}
              value={matchingAnswers.ellas}
              onChange={(e) =>
                setMatchingAnswers({
                  ...matchingAnswers,
                  ellas: e.target.value,
                })
              }
              placeholder='Type the verb...'
            />
            {matchingResults.ellas === true && (
              <span className='result-icon correct'>✓</span>
            )}
            {matchingResults.ellas === false && (
              <span className='result-icon incorrect'>✗</span>
            )}
          </div>

          <div className='matching-row'>
            <div className='matching-pronoun'>
              <span className='emoji'>👤</span> Usted
            </div>
            <input
              type='text'
              className={`matching-input ${
                matchingResults.usted === true
                  ? "correct"
                  : matchingResults.usted === false
                  ? "incorrect"
                  : ""
              }`}
              value={matchingAnswers.usted}
              onChange={(e) =>
                setMatchingAnswers({
                  ...matchingAnswers,
                  usted: e.target.value,
                })
              }
              placeholder='Type the verb...'
            />
            {matchingResults.usted === true && (
              <span className='result-icon correct'>✓</span>
            )}
            {matchingResults.usted === false && (
              <span className='result-icon incorrect'>✗</span>
            )}
          </div>

          <div className='matching-row'>
            <div className='matching-pronoun'>
              <span className='emoji'>👫</span> Vosotros
            </div>
            <input
              type='text'
              className={`matching-input ${
                matchingResults.vosotros === true
                  ? "correct"
                  : matchingResults.vosotros === false
                  ? "incorrect"
                  : ""
              }`}
              value={matchingAnswers.vosotros}
              onChange={(e) =>
                setMatchingAnswers({
                  ...matchingAnswers,
                  vosotros: e.target.value,
                })
              }
              placeholder='Type the verb...'
            />
            {matchingResults.vosotros === true && (
              <span className='result-icon correct'>✓</span>
            )}
            {matchingResults.vosotros === false && (
              <span className='result-icon incorrect'>✗</span>
            )}
          </div>
        </div>

        <button className='check-btn' onClick={checkMatching}>
          <i className='fa-solid fa-check'></i> Check My Answers
        </button>
      </div>

      {/* Exercise 3: Fill in the Blank */}
      <div className='section-card yellow-border'>
        <h2>
          <span className='emoji'>✏️</span> Exercise 3: Complete the Sentence
        </h2>
        <p>
          Fill in the blank with the correct Identity Word:{" "}
          <strong>Soy, Eres, Es, Somos, Sois, Son</strong>
        </p>

        <div className='fill-blank-exercise'>
          <div className='fill-blank-row'>
            <div className='question-number'>1.</div>
            <div className='sentence'>
              Yo{" "}
              <input
                type='text'
                className={`fill-blank-input ${
                  fillBlankResults.q1 === true
                    ? "correct"
                    : fillBlankResults.q1 === false
                    ? "incorrect"
                    : ""
                }`}
                value={fillBlankAnswers.q1}
                onChange={(e) =>
                  setFillBlankAnswers({
                    ...fillBlankAnswers,
                    q1: e.target.value,
                  })
                }
                placeholder='___'
              />{" "}
              de Harrogate.
              {fillBlankResults.q1 === true && (
                <span className='result-icon correct'>✓</span>
              )}
              {fillBlankResults.q1 === false && (
                <span className='result-icon incorrect'>✗</span>
              )}
            </div>
            <div className='translation'>(I am from Harrogate.)</div>
          </div>

          <div className='fill-blank-row'>
            <div className='question-number'>2.</div>
            <div className='sentence'>
              Ella{" "}
              <input
                type='text'
                className={`fill-blank-input ${
                  fillBlankResults.q2 === true
                    ? "correct"
                    : fillBlankResults.q2 === false
                    ? "incorrect"
                    : ""
                }`}
                value={fillBlankAnswers.q2}
                onChange={(e) =>
                  setFillBlankAnswers({
                    ...fillBlankAnswers,
                    q2: e.target.value,
                  })
                }
                placeholder='___'
              />{" "}
              profesora.
              {fillBlankResults.q2 === true && (
                <span className='result-icon correct'>✓</span>
              )}
              {fillBlankResults.q2 === false && (
                <span className='result-icon incorrect'>✗</span>
              )}
            </div>
            <div className='translation'>(She is a teacher.)</div>
          </div>

          <div className='fill-blank-row'>
            <div className='question-number'>3.</div>
            <div className='sentence'>
              Nosotros{" "}
              <input
                type='text'
                className={`fill-blank-input ${
                  fillBlankResults.q3 === true
                    ? "correct"
                    : fillBlankResults.q3 === false
                    ? "incorrect"
                    : ""
                }`}
                value={fillBlankAnswers.q3}
                onChange={(e) =>
                  setFillBlankAnswers({
                    ...fillBlankAnswers,
                    q3: e.target.value,
                  })
                }
                placeholder='___'
              />{" "}
              amigos.
              {fillBlankResults.q3 === true && (
                <span className='result-icon correct'>✓</span>
              )}
              {fillBlankResults.q3 === false && (
                <span className='result-icon incorrect'>✗</span>
              )}
            </div>
            <div className='translation'>(We are friends.)</div>
          </div>

          <div className='fill-blank-row'>
            <div className='question-number'>4.</div>
            <div className='sentence'>
              Ustedes{" "}
              <input
                type='text'
                className={`fill-blank-input ${
                  fillBlankResults.q4 === true
                    ? "correct"
                    : fillBlankResults.q4 === false
                    ? "incorrect"
                    : ""
                }`}
                value={fillBlankAnswers.q4}
                onChange={(e) =>
                  setFillBlankAnswers({
                    ...fillBlankAnswers,
                    q4: e.target.value,
                  })
                }
                placeholder='___'
              />{" "}
              estudiantes.
              {fillBlankResults.q4 === true && (
                <span className='result-icon correct'>✓</span>
              )}
              {fillBlankResults.q4 === false && (
                <span className='result-icon incorrect'>✗</span>
              )}
            </div>
            <div className='translation'>(You all are students.)</div>
          </div>

          <div className='fill-blank-row'>
            <div className='question-number'>5.</div>
            <div className='sentence'>
              Tú{" "}
              <input
                type='text'
                className={`fill-blank-input ${
                  fillBlankResults.q5 === true
                    ? "correct"
                    : fillBlankResults.q5 === false
                    ? "incorrect"
                    : ""
                }`}
                value={fillBlankAnswers.q5}
                onChange={(e) =>
                  setFillBlankAnswers({
                    ...fillBlankAnswers,
                    q5: e.target.value,
                  })
                }
                placeholder='___'
              />{" "}
              muy inteligente.
              {fillBlankResults.q5 === true && (
                <span className='result-icon correct'>✓</span>
              )}
              {fillBlankResults.q5 === false && (
                <span className='result-icon incorrect'>✗</span>
              )}
            </div>
            <div className='translation'>(You are very intelligent.)</div>
          </div>
        </div>

        <button className='check-btn' onClick={checkFillBlank}>
          <i className='fa-solid fa-check'></i> Check My Answers
        </button>
      </div>

      {/* Summary */}
      <div className='summary-section'>
        <h2>
          <span className='emoji'>🎓</span> Remember!
        </h2>
        <div className='summary-box'>
          <p>
            The full list is: <strong>Soy, Eres, Es, Somos, Sois, Son</strong>
          </p>
          <p className='key-reminder'>
            🔑 Each pronoun has its own special verb form - they work together
            like a key and lock!
          </p>
        </div>
      </div>
    </div>
  );
}

export default IIPronounsIdentifyingThePerson;
