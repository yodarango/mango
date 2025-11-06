import { useState, useEffect } from "react";
import "./III_Numbers.css";

function IIINumbers() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    // Check if quiz is already completed
    const savedState = localStorage.getItem("III_numbers");
    if (savedState) {
      const state = JSON.parse(savedState);
      setQuizCompleted(state.completed || false);
    }
  }, []);

  const handleOpenQuiz = () => {
    setShowQuiz(true);
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
    // Recheck completion status
    const savedState = localStorage.getItem("III_numbers");
    if (savedState) {
      const state = JSON.parse(savedState);
      setQuizCompleted(state.completed || false);
    }
  };

  return (
    <div className='numbers-container'>
      <div className='numbers-header'>
        <div>
          <h1>
            <i className='fa-solid fa-hashtag'></i> Numbers Assignment
          </h1>
          <p className='subtitle'>
            Understanding Spanish numbers 1-1000: The Four Groups
          </p>
        </div>
        <button
          onClick={handleOpenQuiz}
          className={`take-quiz-btn ${quizCompleted ? "completed" : ""}`}
        >
          {quizCompleted ? (
            <>
              <i className='fa-solid fa-eye'></i> View Results
            </>
          ) : (
            <>
              <i className='fa-solid fa-pen-to-square'></i> Take Quiz
            </>
          )}
        </button>
      </div>
      <div className='numbers-content'>
        {/* Introduction */}
        <div className='intro-section'>
          <p>
            Spanish numbers from 1-1000 follow{" "}
            <strong>four distinct patterns</strong>. Once you understand these
            groups, counting in Spanish becomes much easier!
          </p>
        </div>

        {/* Group 1: 1-10 */}
        <div className='number-group group-1'>
          <div className='group-header'>
            <span className='group-number'>Group 1</span>
            <h2>Numbers 1-10: Unique Words</h2>
          </div>
          <div className='group-description'>
            <p>
              <strong>Pattern:</strong> Each number is completely different from
              the others.
            </p>
            <p className='english-comparison'>
              <i className='fa-solid fa-language'></i>
              <strong>Like English:</strong> Just like "one, two, three" are all
              different words, Spanish numbers 1-10 are unique and must be
              memorized individually.
            </p>
          </div>
          <div className='numbers-grid'>
            <div className='number-card'>
              <span className='digit'>1</span>
              <span className='spanish'>uno</span>
            </div>
            <div className='number-card'>
              <span className='digit'>2</span>
              <span className='spanish'>dos</span>
            </div>
            <div className='number-card'>
              <span className='digit'>3</span>
              <span className='spanish'>tres</span>
            </div>
            <div className='number-card'>
              <span className='digit'>4</span>
              <span className='spanish'>cuatro</span>
            </div>
            <div className='number-card'>
              <span className='digit'>5</span>
              <span className='spanish'>cinco</span>
            </div>
            <div className='number-card'>
              <span className='digit'>6</span>
              <span className='spanish'>seis</span>
            </div>
            <div className='number-card'>
              <span className='digit'>7</span>
              <span className='spanish'>siete</span>
            </div>
            <div className='number-card'>
              <span className='digit'>8</span>
              <span className='spanish'>ocho</span>
            </div>
            <div className='number-card'>
              <span className='digit'>9</span>
              <span className='spanish'>nueve</span>
            </div>
            <div className='number-card'>
              <span className='digit'>10</span>
              <span className='spanish'>diez</span>
            </div>
          </div>
        </div>

        {/* Group 2: 11-20 */}
        <div className='number-group group-2'>
          <div className='group-header'>
            <span className='group-number'>Group 2</span>
            <h2>Numbers 11-20: Two Sub-patterns</h2>
          </div>
          <div className='group-description'>
            <p>
              <strong>Pattern A (11-15):</strong> All end in{" "}
              <span className='highlight'>-ce</span>
            </p>
            <p>
              <strong>Pattern B (16-19):</strong> Composed of{" "}
              <span className='highlight'>diez</span> (10) + single digit
            </p>
            <p className='english-comparison'>
              <i className='fa-solid fa-language'></i>
              <strong>Like English:</strong> Similar to how "sixteen" = "six" +
              "teen", Spanish 16-19 combine "diez" with the single digit (e.g.,
              dieciséis = diez + seis).
            </p>
          </div>

          <div className='sub-pattern'>
            <h3>Pattern A: Numbers ending in -ce</h3>
            <div className='numbers-grid'>
              <div className='number-card'>
                <span className='digit'>11</span>
                <span className='spanish'>
                  on<span className='highlight-text'>ce</span>
                </span>
              </div>
              <div className='number-card'>
                <span className='digit'>12</span>
                <span className='spanish'>
                  do<span className='highlight-text'>ce</span>
                </span>
              </div>
              <div className='number-card'>
                <span className='digit'>13</span>
                <span className='spanish'>
                  tre<span className='highlight-text'>ce</span>
                </span>
              </div>
              <div className='number-card'>
                <span className='digit'>14</span>
                <span className='spanish'>
                  cator<span className='highlight-text'>ce</span>
                </span>
              </div>
              <div className='number-card'>
                <span className='digit'>15</span>
                <span className='spanish'>
                  quin<span className='highlight-text'>ce</span>
                </span>
              </div>
            </div>
          </div>

          <div className='sub-pattern'>
            <h3>Pattern B: Diez + single digit</h3>
            <div className='numbers-grid'>
              <div className='number-card'>
                <span className='digit'>16</span>
                <span className='spanish'>
                  <span className='highlight-text'>dieci</span>séis
                </span>
                <span className='formula'>diez + seis</span>
              </div>
              <div className='number-card'>
                <span className='digit'>17</span>
                <span className='spanish'>
                  <span className='highlight-text'>dieci</span>siete
                </span>
                <span className='formula'>diez + siete</span>
              </div>
              <div className='number-card'>
                <span className='digit'>18</span>
                <span className='spanish'>
                  <span className='highlight-text'>dieci</span>ocho
                </span>
                <span className='formula'>diez + ocho</span>
              </div>
              <div className='number-card'>
                <span className='digit'>19</span>
                <span className='spanish'>
                  <span className='highlight-text'>dieci</span>nueve
                </span>
                <span className='formula'>diez + nueve</span>
              </div>
              <div className='number-card'>
                <span className='digit'>20</span>
                <span className='spanish'>veinte</span>
              </div>
            </div>
          </div>
        </div>

        {/* Group 3: 20-100 */}
        <div className='number-group group-3'>
          <div className='group-header'>
            <span className='group-number'>Group 3</span>
            <h2>Numbers 20-100: The -enta Pattern</h2>
          </div>
          <div className='group-description'>
            <p>
              <strong>Pattern:</strong> All decimal numbers (30, 40, 50, etc.)
              end in <span className='highlight'>-enta</span>
            </p>
            <p className='english-comparison'>
              <i className='fa-solid fa-language'></i>
              <strong>Like English:</strong> Similar to how English uses "-ty"
              (thirty, forty, fifty), Spanish uses "-enta" for multiples of ten.
            </p>
          </div>
          <div className='numbers-grid'>
            <div className='number-card'>
              <span className='digit'>30</span>
              <span className='spanish'>
                trein<span className='highlight-text'>ta</span>
              </span>
            </div>
            <div className='number-card'>
              <span className='digit'>40</span>
              <span className='spanish'>
                cuar<span className='highlight-text'>enta</span>
              </span>
            </div>
            <div className='number-card'>
              <span className='digit'>50</span>
              <span className='spanish'>
                cincu<span className='highlight-text'>enta</span>
              </span>
            </div>
            <div className='number-card'>
              <span className='digit'>60</span>
              <span className='spanish'>
                ses<span className='highlight-text'>enta</span>
              </span>
            </div>
            <div className='number-card'>
              <span className='digit'>70</span>
              <span className='spanish'>
                set<span className='highlight-text'>enta</span>
              </span>
            </div>
            <div className='number-card'>
              <span className='digit'>80</span>
              <span className='spanish'>
                och<span className='highlight-text'>enta</span>
              </span>
            </div>
            <div className='number-card'>
              <span className='digit'>90</span>
              <span className='spanish'>
                nov<span className='highlight-text'>enta</span>
              </span>
            </div>
            <div className='number-card'>
              <span className='digit'>100</span>
              <span className='spanish'>cien</span>
            </div>
          </div>
          <div className='pattern-note'>
            <i className='fa-solid fa-lightbulb'></i>
            <p>
              <strong>Note:</strong> Numbers in between (like 31, 42, 53)
              combine the decimal + "y" + single digit.
              <br />
              Example: 31 = treinta y uno, 42 = cuarenta y dos
            </p>
          </div>
        </div>

        {/* Group 4: 100-1000 */}
        <div className='number-group group-4'>
          <div className='group-header'>
            <span className='group-number'>Group 4</span>
            <h2>Numbers 100-1000: Single Digit + -cientos</h2>
          </div>
          <div className='group-description'>
            <p>
              <strong>Pattern:</strong> All hundreds are formed by combining a
              single digit (2-9) + <span className='highlight'>cientos</span>
            </p>
            <p className='english-comparison'>
              <i className='fa-solid fa-language'></i>
              <strong>Like English:</strong> Just like "two hundred" = "two" +
              "hundred", Spanish uses the single digit + "cientos" (e.g.,
              doscientos = dos + cientos).
            </p>
          </div>
          <div className='numbers-grid'>
            <div className='number-card'>
              <span className='digit'>100</span>
              <span className='spanish'>cien</span>
              <span className='formula'>(special form)</span>
            </div>
            <div className='number-card'>
              <span className='digit'>200</span>
              <span className='spanish'>
                <span className='highlight-text'>dos</span>cientos
              </span>
              <span className='formula'>2 + cientos</span>
            </div>
            <div className='number-card'>
              <span className='digit'>300</span>
              <span className='spanish'>
                <span className='highlight-text'>tres</span>cientos
              </span>
              <span className='formula'>3 + cientos</span>
            </div>
            <div className='number-card'>
              <span className='digit'>400</span>
              <span className='spanish'>
                <span className='highlight-text'>cuatro</span>cientos
              </span>
              <span className='formula'>4 + cientos</span>
            </div>
            <div className='number-card'>
              <span className='digit'>500</span>
              <span className='spanish'>
                <span className='highlight-text'>quinien</span>tos
              </span>
              <span className='formula'>5 + cientos*</span>
            </div>
            <div className='number-card'>
              <span className='digit'>600</span>
              <span className='spanish'>
                <span className='highlight-text'>seis</span>cientos
              </span>
              <span className='formula'>6 + cientos</span>
            </div>
            <div className='number-card'>
              <span className='digit'>700</span>
              <span className='spanish'>
                <span className='highlight-text'>sete</span>cientos
              </span>
              <span className='formula'>7 + cientos*</span>
            </div>
            <div className='number-card'>
              <span className='digit'>800</span>
              <span className='spanish'>
                <span className='highlight-text'>ocho</span>cientos
              </span>
              <span className='formula'>8 + cientos</span>
            </div>
            <div className='number-card'>
              <span className='digit'>900</span>
              <span className='spanish'>
                <span className='highlight-text'>nove</span>cientos
              </span>
              <span className='formula'>9 + cientos*</span>
            </div>
            <div className='number-card'>
              <span className='digit'>1000</span>
              <span className='spanish'>mil</span>
            </div>
          </div>
          <div className='pattern-note'>
            <i className='fa-solid fa-lightbulb'></i>
            <p>
              <strong>Note:</strong> Some hundreds have slight spelling changes
              (marked with *) but still follow the pattern.
              <br />
              Example: 500 = quinientos (not cincocientos), 700 = setecientos
              (not sietecientos)
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className='summary-section'>
          <h2>
            <i className='fa-solid fa-star'></i> Quick Summary
          </h2>
          <div className='summary-grid'>
            <div className='summary-card'>
              <div className='summary-title'>Group 1 (1-10)</div>
              <div className='summary-content'>
                All unique words - memorize them!
              </div>
            </div>
            <div className='summary-card'>
              <div className='summary-title'>Group 2 (11-20)</div>
              <div className='summary-content'>
                11-15 end in -ce, 16-19 use diez + digit
              </div>
            </div>
            <div className='summary-card'>
              <div className='summary-title'>Group 3 (20-100)</div>
              <div className='summary-content'>
                Decimals end in -enta (like English -ty)
              </div>
            </div>
            <div className='summary-card'>
              <div className='summary-title'>Group 4 (100-1000)</div>
              <div className='summary-content'>
                Digit + cientos (like English digit + hundred)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IIINumbers;
