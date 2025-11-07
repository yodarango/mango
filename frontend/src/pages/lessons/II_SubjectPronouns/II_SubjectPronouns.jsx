import { Link } from "react-router-dom";
import "./II_SubjectPronouns.css";

function IISubjectPronouns() {
  return (
    <div className='pronouns-container'>
      <div className='pronouns-header'>
        <div>
          <h1>
            <i className='fa-solid fa-users'></i> Subject Pronouns
          </h1>
          <p className='subtitle'>Learn who's who in Spanish! 🌟</p>
        </div>
        <Link to='/assignments' className={`take-quiz-btn`}>
          Take Quiz
        </Link>
      </div>

      {/* Introduction */}
      <div className='intro-section'>
        <h2>👋 What are Subject Pronouns?</h2>
        <p className='intro-text'>
          Subject pronouns are special words we use instead of people's names!
          They tell us <strong>WHO</strong> is doing something.
        </p>
        <div className='example-box'>
          <p>
            <strong>Example:</strong> Instead of saying "Maria is responsible"
            we can say{" "}
            <span className='highlight-green'>"Ella es responsible"</span> (She
            is responsible)
          </p>
        </div>
      </div>

      {/* Singular Pronouns */}
      <div className='section-card purple-border'>
        <h2>
          <span className='emoji'>👤</span> Singular Pronouns (One Person)
        </h2>

        <div className='pronoun-grid'>
          {/* YO */}
          <div className='pronoun-card yo-card'>
            <div className='pronoun-emoji'>🙋‍♂️</div>
            <div className='pronoun-spanish'>YO</div>
            <div className='pronoun-english'>I</div>
            <div className='pronoun-example'>
              <strong>Yo soy estudiante</strong>
              <br />
              <span className='translation'>I am a student</span>
            </div>
            <div className='pronoun-tip'>
              <i className='fa-solid fa-lightbulb'></i> Use when talking about
              yourself!
            </div>
          </div>

          {/* TÚ */}
          <div className='pronoun-card tu-card'>
            <div className='pronoun-emoji'>👉</div>
            <div className='pronoun-spanish'>TÚ</div>
            <div className='pronoun-english'>You (friend)</div>
            <div className='pronoun-example'>
              <strong>Tú eres inteligente</strong>
              <br />
              <span className='translation'>You are intelligent</span>
            </div>
            <div className='pronoun-tip'>
              <i className='fa-solid fa-lightbulb'></i> Use with friends and
              kids!
            </div>
          </div>

          {/* ÉL */}
          <div className='pronoun-card el-card'>
            <div className='pronoun-emoji'>👦</div>
            <div className='pronoun-spanish'>ÉL</div>
            <div className='pronoun-english'>He</div>
            <div className='pronoun-example'>
              <strong>Él es responsable</strong>
              <br />
              <span className='translation'>He is responsible</span>
            </div>
            <div className='pronoun-tip'>
              <i className='fa-solid fa-lightbulb'></i> For boys and men!
            </div>
          </div>

          {/* ELLA */}
          <div className='pronoun-card ella-card'>
            <div className='pronoun-emoji'>👧</div>
            <div className='pronoun-spanish'>ELLA</div>
            <div className='pronoun-english'>She</div>
            <div className='pronoun-example'>
              <strong>Ella es amable</strong>
              <br />
              <span className='translation'>She is kind</span>
            </div>
            <div className='pronoun-tip'>
              <i className='fa-solid fa-lightbulb'></i> For girls and women!
            </div>
          </div>
        </div>
      </div>

      {/* Plural Pronouns */}
      <div className='section-card orange-border'>
        <h2>
          <span className='emoji'>👥</span> Plural Pronouns (More Than One)
        </h2>

        <div className='pronoun-grid'>
          {/* NOSOTROS */}
          <div className='pronoun-card nosotros-card'>
            <div className='pronoun-emoji'>👫</div>
            <div className='pronoun-spanish'>NOSOTROS</div>
            <div className='pronoun-english'>We</div>
            <div className='pronoun-example'>
              <strong>Nosotros somos estudiantes</strong>
              <br />
              <span className='translation'>We are students</span>
            </div>
            <div className='pronoun-tip'>
              <i className='fa-solid fa-lightbulb'></i> You + other people!
            </div>
          </div>

          {/* USTEDES */}
          <div className='pronoun-card ustedes-card'>
            <div className='pronoun-emoji'>👉👉</div>
            <div className='pronoun-spanish'>USTEDES</div>
            <div className='pronoun-english'>You all</div>
            <div className='pronoun-example'>
              <strong>Ustedes son importantes</strong>
              <br />
              <span className='translation'>You all are important</span>
            </div>
            <div className='pronoun-tip'>
              <i className='fa-solid fa-lightbulb'></i> Talking to a group!
            </div>
          </div>

          {/* ELLOS */}
          <div className='pronoun-card ellos-card'>
            <div className='pronoun-emoji'>👦👦</div>
            <div className='pronoun-spanish'>ELLOS</div>
            <div className='pronoun-english'>They (boys/mixed)</div>
            <div className='pronoun-example'>
              <strong>Ellos son estudiantes</strong>
              <br />
              <span className='translation'>They are students</span>
            </div>
            <div className='pronoun-tip'>
              <i className='fa-solid fa-lightbulb'></i> For groups of boys or
              mixed!
            </div>
          </div>

          {/* ELLAS */}
          <div className='pronoun-card ellas-card'>
            <div className='pronoun-emoji'>👧👧</div>
            <div className='pronoun-spanish'>ELLAS</div>
            <div className='pronoun-english'>They (girls)</div>
            <div className='pronoun-example'>
              <strong>Ellas son inteligentes</strong>
              <br />
              <span className='translation'>They are intelligent</span>
            </div>
            <div className='pronoun-tip'>
              <i className='fa-solid fa-lightbulb'></i> Only for groups of
              girls!
            </div>
          </div>
        </div>
      </div>

      {/* Color Examples */}
      <div className='section-card green-border'>
        <h2>
          <span className='emoji'>🎨</span> Practice with Colors!
        </h2>
        <div className='color-examples'>
          <div className='color-card red-card'>
            <div
              className='color-circle'
              style={{ background: "#ff0000" }}
            ></div>
            <p>
              <strong>Yo soy rojo</strong>
            </p>
            <p className='small'>I am red</p>
          </div>
          <div className='color-card blue-card'>
            <div
              className='color-circle'
              style={{ background: "#0000ff" }}
            ></div>
            <p>
              <strong>Tú eres azul</strong>
            </p>
            <p className='small'>You are blue</p>
          </div>
          <div className='color-card green-card'>
            <div
              className='color-circle'
              style={{ background: "#00ff00" }}
            ></div>
            <p>
              <strong>Ella es verde</strong>
            </p>
            <p className='small'>She is green</p>
          </div>
          <div className='color-card yellow-card'>
            <div
              className='color-circle'
              style={{ background: "#ffeb3b" }}
            ></div>
            <p>
              <strong>Nosotros somos amarillos</strong>
            </p>
            <p className='small'>We are yellow</p>
          </div>
        </div>
      </div>

      {/* Memory Tips */}
      <div className='tips-section'>
        <h2>
          <i className='fa-solid fa-brain'></i> Memory Tips!
        </h2>
        <div className='tips-grid'>
          <div className='tip-card'>
            <div className='tip-icon'>🎯</div>
            <h4>Yo = Me!</h4>
            <p>Point to yourself when you say "Yo"</p>
          </div>
          <div className='tip-card'>
            <div className='tip-icon'>👉</div>
            <h4>Tú = You!</h4>
            <p>Point to a friend when you say "Tú"</p>
          </div>
          <div className='tip-card'>
            <div className='tip-icon'>👥</div>
            <h4>Nosotros = Us!</h4>
            <p>"Nos" sounds like "us" in English!</p>
          </div>
          <div className='tip-card'>
            <div className='tip-icon'>🎭</div>
            <h4>Ellos/Ellas</h4>
            <p>Both start with "ELL" - they're similar!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IISubjectPronouns;
