import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./III_PronounsOfDirectObject.css";

function IIIPronounsOfDirectObject() {
  // Exercise 1: Translation Drill State
  const [translationAnswers, setTranslationAnswers] = useState({
    q1: "",
    q2: "",
    q3: "",
  });
  const [translationResults, setTranslationResults] = useState({});

  // Exercise 2: Matching State
  const [matchingAnswers, setMatchingAnswers] = useState({
    me: "",
    te: "",
    lo: "",
    la: "",
    nos: "",
    los: "",
    las: "",
  });
  const [matchingResults, setMatchingResults] = useState({});

  // Exercise 3: Position Practice State
  const [positionAnswers, setPositionAnswers] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
  });
  const [positionResults, setPositionResults] = useState({});

  // Load saved progress from localStorage
  useEffect(() => {
    const savedTranslation = localStorage.getItem("dopLesson_translation");
    const savedMatching = localStorage.getItem("dopLesson_matching");
    const savedPosition = localStorage.getItem("dopLesson_position");

    if (savedTranslation) setTranslationAnswers(JSON.parse(savedTranslation));
    if (savedMatching) setMatchingAnswers(JSON.parse(savedMatching));
    if (savedPosition) setPositionAnswers(JSON.parse(savedPosition));
  }, []);

  // Save progress to localStorage
  const saveProgress = () => {
    localStorage.setItem(
      "dopLesson_translation",
      JSON.stringify(translationAnswers)
    );
    localStorage.setItem("dopLesson_matching", JSON.stringify(matchingAnswers));
    localStorage.setItem("dopLesson_position", JSON.stringify(positionAnswers));
  };

  // Check Translation Exercise
  const checkTranslation = () => {
    const correctAnswers = {
      q1: "te veo",
      q2: "la quiere",
      q3: "dárselo",
    };

    const results = {};
    Object.keys(translationAnswers).forEach((key) => {
      const userAnswer = translationAnswers[key].toLowerCase().trim();
      const correct = correctAnswers[key];
      // Allow variations
      if (key === "q1") {
        results[key] = userAnswer === "te veo" || userAnswer === "yo te veo";
      } else if (key === "q2") {
        results[key] =
          userAnswer === "la quiere" || userAnswer === "él la quiere";
      } else if (key === "q3") {
        results[key] =
          userAnswer === "dárselo" ||
          userAnswer === "tienes que dárselo" ||
          userAnswer === "se lo tienes que dar";
      }
    });

    setTranslationResults(results);
    saveProgress();
  };

  // Check Matching Exercise
  const checkMatching = () => {
    const correctAnswers = {
      me: "me",
      te: "you (informal)",
      lo: "him/it (masc)",
      la: "her/it (fem)",
      nos: "us",
      los: "them (masc)",
      las: "them (fem)",
    };

    const results = {};
    Object.keys(matchingAnswers).forEach((key) => {
      const userAnswer = matchingAnswers[key].toLowerCase().trim();
      const correct = correctAnswers[key].toLowerCase();
      results[key] = userAnswer === correct || userAnswer.includes(correct);
    });

    setMatchingResults(results);
    saveProgress();
  };

  // Check Position Exercise
  const checkPosition = () => {
    const correctAnswers = {
      q1: "lo vi",
      q2: "no me lo digas",
      q3: "pensándolo",
      q4: "te quiero",
    };

    const results = {};
    Object.keys(positionAnswers).forEach((key) => {
      const userAnswer = positionAnswers[key].toLowerCase().trim();
      const correct = correctAnswers[key];
      results[key] = userAnswer === correct;
    });

    setPositionResults(results);
    saveProgress();
  };

  return (
    <div className='dop-container'>
      {/* Header */}
      <div className='dop-header'>
        <h1>
          <i className='fa-solid fa-arrows-turn-right'></i> Direct Object
          Pronouns
        </h1>
        <p className='subtitle'>
          The "Shortcut" Pronouns: Me, Te, Lo, La, Nos, Os, Los, Las 🎯
        </p>
      </div>

      {/* instructional video */}
      <div className='iframe-video-238'>
        <iframe
          src='https://drive.google.com/file/d/1336EOnxeHve4k0ALrv-HCiAcjNbFNIeC/preview'
          width='640'
          height='360'
          allow='autoplay; fullscreen'
          allowfullscreen
        ></iframe>
      </div>

      {/* Introduction */}
      <div className='intro-section'>
        <h2>
          <span className='emoji'>👋</span> What is a Direct Object?
        </h2>
        <div className='intro-text'>
          <p>
            In English, a sentence like <strong>"I saw Juan"</strong> has "Juan"
            as the <strong>direct object (DO)</strong> because he receives the
            action of the verb (seeing).
          </p>
          <p>
            When we don't want to repeat "Juan," we use an object pronoun:{" "}
            <span className='highlight-green'>"I saw him"</span>
          </p>
        </div>

        <div className='key-concept-box'>
          <div className='key-icon'>🔑</div>
          <div>
            <h3>The Key Concept</h3>
            <p>
              In Spanish, we use <strong>Direct Object Pronouns (DOPs)</strong>{" "}
              to replace nouns that receive the action. But here's the twist:{" "}
              <strong>they go BEFORE the verb</strong> (most of the time)!
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: First & Second Person DOPs */}
      <div className='section-card purple-border'>
        <h2>
          <span className='emoji'>👥</span> The Identical Matches (1st & 2nd
          Person)
        </h2>
        <p className='section-intro'>
          These pronouns are almost identical to English! They refer to "me,"
          "you," and "us."
        </p>

        <div className='dop-grid'>
          {/* Me */}
          <div className='dop-card me-card'>
            <div className='dop-emoji'>🙋‍♂️</div>
            <div className='dop-spanish'>ME</div>
            <div className='dop-english'>me</div>
            <div className='dop-example'>
              <strong>Me ves</strong>
              <br />
              <span className='translation'>You see me</span>
            </div>
            <div className='dop-tip'>
              <i className='fa-solid fa-lightbulb'></i> Same as English "me"!
            </div>
          </div>

          {/* Te */}
          <div className='dop-card te-card'>
            <div className='dop-emoji'>👉</div>
            <div className='dop-spanish'>TE</div>
            <div className='dop-english'>you (informal)</div>
            <div className='dop-example'>
              <strong>Te veo</strong>
              <br />
              <span className='translation'>I see you</span>
            </div>
            <div className='dop-tip'>
              <i className='fa-solid fa-lightbulb'></i> For friends & family!
            </div>
          </div>

          {/* Nos */}
          <div className='dop-card nos-card'>
            <div className='dop-emoji'>👥</div>
            <div className='dop-spanish'>NOS</div>
            <div className='dop-english'>us</div>
            <div className='dop-example'>
              <strong>Nos ayudan</strong>
              <br />
              <span className='translation'>They help us</span>
            </div>
            <div className='dop-tip'>
              <i className='fa-solid fa-lightbulb'></i> "Nos" sounds like "us"!
            </div>
          </div>

          {/* Os */}
          <div className='dop-card os-card'>
            <div className='dop-emoji'>👫</div>
            <div className='dop-spanish'>OS</div>
            <div className='dop-english'>you all (Spain)</div>
            <div className='dop-example'>
              <strong>Os llamo</strong>
              <br />
              <span className='translation'>I call you all</span>
            </div>
            <div className='dop-tip'>
              <i className='fa-solid fa-lightbulb'></i> Used mainly in Spain!
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Third Person DOPs */}
      <div className='section-card orange-border'>
        <h2>
          <span className='emoji'>🎭</span> The Lo/La Team (3rd Person - Gender
          Matters!)
        </h2>
        <p className='section-intro'>
          When replacing "him," "her," "it," or "them," Spanish DOPs must match
          the <strong>gender</strong> and <strong>number</strong> of the noun!
        </p>

        <div className='dop-grid'>
          {/* Lo */}
          <div className='dop-card lo-card'>
            <div className='dop-emoji'>👨</div>
            <div className='dop-spanish'>LO</div>
            <div className='dop-english'>him / it (masculine)</div>
            <div className='dop-example'>
              <strong>Lo veo</strong>
              <br />
              <span className='translation'>I see him/it</span>
            </div>
            <div className='dop-tip'>
              <i className='fa-solid fa-lightbulb'></i> For masculine nouns!
            </div>
          </div>

          {/* La */}
          <div className='dop-card la-card'>
            <div className='dop-emoji'>👩</div>
            <div className='dop-spanish'>LA</div>
            <div className='dop-english'>her / it (feminine)</div>
            <div className='dop-example'>
              <strong>La quiero</strong>
              <br />
              <span className='translation'>I love her/it</span>
            </div>
            <div className='dop-tip'>
              <i className='fa-solid fa-lightbulb'></i> For feminine nouns!
            </div>
          </div>

          {/* Los */}
          <div className='dop-card los-card'>
            <div className='dop-emoji'>👨‍👨‍👦</div>
            <div className='dop-spanish'>LOS</div>
            <div className='dop-english'>them (masculine)</div>
            <div className='dop-example'>
              <strong>Los conozco</strong>
              <br />
              <span className='translation'>I know them</span>
            </div>
            <div className='dop-tip'>
              <i className='fa-solid fa-lightbulb'></i> Plural masculine!
            </div>
          </div>

          {/* Las */}
          <div className='dop-card las-card'>
            <div className='dop-emoji'>👩‍👩‍👧</div>
            <div className='dop-spanish'>LAS</div>
            <div className='dop-english'>them (feminine)</div>
            <div className='dop-example'>
              <strong>Las veo</strong>
              <br />
              <span className='translation'>I see them</span>
            </div>
            <div className='dop-tip'>
              <i className='fa-solid fa-lightbulb'></i> Plural feminine!
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Position Rules */}
      <div className='section-card green-border'>
        <h2>
          <span className='emoji'>📍</span> The Position Rule: Where Does It Go?
        </h2>
        <p className='section-intro'>
          This is the BIG difference! In English, the pronoun comes{" "}
          <strong>after</strong> the verb. In Spanish, it usually comes{" "}
          <strong>before</strong>!
        </p>

        <div className='position-rules'>
          <div className='rule-box standard-rule'>
            <h3>
              <i className='fa-solid fa-star'></i> Standard Rule: BEFORE the
              Verb
            </h3>
            <div className='rule-comparison'>
              <div className='english-example'>
                <span className='label'>English:</span>
                <span className='text'>I see her</span>
                <span className='note'>(pronoun after verb)</span>
              </div>
              <div className='arrow'>→</div>
              <div className='spanish-example'>
                <span className='label'>Spanish:</span>
                <span className='text'>
                  <strong className='highlight-green'>La</strong> veo
                </span>
                <span className='note'>(pronoun before verb)</span>
              </div>
            </div>

            <div className='more-examples'>
              <div className='example-item'>
                <span className='spanish'>Me siento cansado</span>
                <span className='english'>I feel tired</span>
              </div>
              <div className='example-item'>
                <span className='spanish'>Te quiero</span>
                <span className='english'>I love you</span>
              </div>
              <div className='example-item'>
                <span className='spanish'>Nos ayudan</span>
                <span className='english'>They help us</span>
              </div>
            </div>
          </div>

          <div className='rule-box exception-rule'>
            <h3>
              <i className='fa-solid fa-link'></i> Exception: ATTACHED to the
              End
            </h3>
            <p>The pronoun "hooks onto" the end of these three verb forms:</p>

            <div className='exception-list'>
              <div className='exception-item'>
                <div className='exception-type'>
                  <i className='fa-solid fa-1'></i> Infinitive (-ar, -er, -ir)
                </div>
                <div className='exception-examples'>
                  <div className='ex'>
                    <strong>Quiero recordar</strong>lo
                  </div>
                  <div className='ex-translation'>I want to remember it</div>
                  <div className='ex'>
                    Antes de saber<strong>lo</strong>
                  </div>
                  <div className='ex-translation'>Before knowing it</div>
                </div>
              </div>

              <div className='exception-item'>
                <div className='exception-type'>
                  <i className='fa-solid fa-2'></i> Gerund (-ndo form)
                </div>
                <div className='exception-examples'>
                  <div className='ex'>
                    Pensándo<strong>lo</strong> bien
                  </div>
                  <div className='ex-translation'>Thinking it over</div>
                </div>
              </div>

              <div className='exception-item'>
                <div className='exception-type'>
                  <i className='fa-solid fa-3'></i> Positive Commands
                </div>
                <div className='exception-examples'>
                  <div className='ex'>
                    ¡Dí<strong>me</strong>!
                  </div>
                  <div className='ex-translation'>Tell me!</div>
                  <div className='ex'>¡Házlo!</div>
                  <div className='ex-translation'>Do it!</div>
                </div>
              </div>
            </div>

            <div className='important-note'>
              <i className='fa-solid fa-exclamation-triangle'></i>
              <strong>Important:</strong> In negative commands, the pronoun goes
              BEFORE the verb: <strong>¡No me lo digas!</strong> (Don't tell
              me!)
            </div>
          </div>
        </div>
      </div>

      {/* Exercise 1: Matching */}
      <div className='section-card blue-border'>
        <h2>
          <span className='emoji'>🎯</span> Exercise 1: Match the Pronouns!
        </h2>
        <p>Match each Spanish DOP to its English meaning:</p>

        <div className='matching-exercise'>
          {[
            { key: "me", pronoun: "ME" },
            { key: "te", pronoun: "TE" },
            { key: "lo", pronoun: "LO" },
            { key: "la", pronoun: "LA" },
            { key: "nos", pronoun: "NOS" },
            { key: "los", pronoun: "LOS" },
            { key: "las", pronoun: "LAS" },
          ].map(({ key, pronoun }) => (
            <div className='matching-row' key={key}>
              <div className='matching-pronoun'>{pronoun}</div>
              <input
                type='text'
                className={`matching-input ${
                  matchingResults[key] === true
                    ? "correct"
                    : matchingResults[key] === false
                    ? "incorrect"
                    : ""
                }`}
                value={matchingAnswers[key]}
                onChange={(e) =>
                  setMatchingAnswers({
                    ...matchingAnswers,
                    [key]: e.target.value,
                  })
                }
                placeholder='Type the English meaning...'
              />
              {matchingResults[key] === true && (
                <span className='result-icon correct'>✓</span>
              )}
              {matchingResults[key] === false && (
                <span className='result-icon incorrect'>✗</span>
              )}
            </div>
          ))}
        </div>

        <button className='check-btn' onClick={checkMatching}>
          <i className='fa-solid fa-check'></i> Check My Answers
        </button>
      </div>

      {/* Exercise 2: Position Practice */}
      <div className='section-card yellow-border'>
        <h2>
          <span className='emoji'>📍</span> Exercise 2: Position Practice
        </h2>
        <p>Translate these sentences, paying attention to pronoun placement:</p>

        <div className='position-exercise'>
          <div className='position-row'>
            <div className='question-number'>1.</div>
            <div className='question-text'>
              <div className='english-prompt'>I saw it (masculine)</div>
              <input
                type='text'
                className={`position-input ${
                  positionResults.q1 === true
                    ? "correct"
                    : positionResults.q1 === false
                    ? "incorrect"
                    : ""
                }`}
                value={positionAnswers.q1}
                onChange={(e) =>
                  setPositionAnswers({
                    ...positionAnswers,
                    q1: e.target.value,
                  })
                }
                placeholder='Type in Spanish...'
              />
              {positionResults.q1 === true && (
                <span className='result-icon correct'>✓</span>
              )}
              {positionResults.q1 === false && (
                <span className='result-icon incorrect'>✗</span>
              )}
            </div>
          </div>

          <div className='position-row'>
            <div className='question-number'>2.</div>
            <div className='question-text'>
              <div className='english-prompt'>
                Don't tell me! (negative command)
              </div>
              <input
                type='text'
                className={`position-input ${
                  positionResults.q2 === true
                    ? "correct"
                    : positionResults.q2 === false
                    ? "incorrect"
                    : ""
                }`}
                value={positionAnswers.q2}
                onChange={(e) =>
                  setPositionAnswers({
                    ...positionAnswers,
                    q2: e.target.value,
                  })
                }
                placeholder='Type in Spanish...'
              />
              {positionResults.q2 === true && (
                <span className='result-icon correct'>✓</span>
              )}
              {positionResults.q2 === false && (
                <span className='result-icon incorrect'>✗</span>
              )}
            </div>
          </div>

          <div className='position-row'>
            <div className='question-number'>3.</div>
            <div className='question-text'>
              <div className='english-prompt'>
                Thinking it over (gerund form)
              </div>
              <input
                type='text'
                className={`position-input ${
                  positionResults.q3 === true
                    ? "correct"
                    : positionResults.q3 === false
                    ? "incorrect"
                    : ""
                }`}
                value={positionAnswers.q3}
                onChange={(e) =>
                  setPositionAnswers({
                    ...positionAnswers,
                    q3: e.target.value,
                  })
                }
                placeholder='Type in Spanish...'
              />
              {positionResults.q3 === true && (
                <span className='result-icon correct'>✓</span>
              )}
              {positionResults.q3 === false && (
                <span className='result-icon incorrect'>✗</span>
              )}
            </div>
          </div>

          <div className='position-row'>
            <div className='question-number'>4.</div>
            <div className='question-text'>
              <div className='english-prompt'>I love you (informal)</div>
              <input
                type='text'
                className={`position-input ${
                  positionResults.q4 === true
                    ? "correct"
                    : positionResults.q4 === false
                    ? "incorrect"
                    : ""
                }`}
                value={positionAnswers.q4}
                onChange={(e) =>
                  setPositionAnswers({
                    ...positionAnswers,
                    q4: e.target.value,
                  })
                }
                placeholder='Type in Spanish...'
              />
              {positionResults.q4 === true && (
                <span className='result-icon correct'>✓</span>
              )}
              {positionResults.q4 === false && (
                <span className='result-icon incorrect'>✗</span>
              )}
            </div>
          </div>
        </div>

        <button className='check-btn' onClick={checkPosition}>
          <i className='fa-solid fa-check'></i> Check My Answers
        </button>
      </div>

      {/* Summary */}
      <div className='summary-section'>
        <h2>
          <span className='emoji'>🎓</span> The Spanish Key System
        </h2>
        <div className='summary-box'>
          <p>
            <strong>In English:</strong> You put the object pronoun{" "}
            <strong>after</strong> the verb → "I saw him"
          </p>
          <p>
            <strong>In Spanish:</strong> You put the object pronoun{" "}
            <strong>before</strong> the verb → "Lo vi"
          </p>
          <p className='key-reminder'>
            🔑 Exception: Attach to the end of infinitives, gerunds, and
            positive commands!
          </p>
        </div>
      </div>
    </div>
  );
}

export default IIIPronounsOfDirectObject;
