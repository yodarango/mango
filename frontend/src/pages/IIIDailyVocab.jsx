import { Link } from "react-router-dom";
import "./IIIDailyVocab.css";
import React from "react";

export const IIIDailyVocab = () => {
  return (
    <div className='daily-vocab-iii'>
      <Link to='/assignments'>
        <i className='fa-solid fa-pen-to-square'></i>
        Take the Quiz
      </Link>
      <header>
        <h1>
          <i className='fa-solid fa-book-open'></i>
          Daily Vocabulary
        </h1>
        <p>Master these essential Spanish words with memory tricks!</p>
      </header>

      <h3>Nouns</h3>
      <section>
        <div>
          <p>
            <strong>lugar</strong> (masc.) — “place.” Tip: think “location.”
          </p>
          <ul>
            <li>Este lugar es bonito. (This place is pretty.)</li>
            <li>Busco un lugar tranquilo. (I’m looking for a quiet place.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>sentimiento</strong> (masc.) — “feeling.” Tip: from{" "}
            <em>sentir</em> (to feel).
          </p>
          <ul>
            <li>Tengo un sentimiento bueno. (I have a good feeling.)</li>
            <li>Ese sentimiento es fuerte. (That feeling is strong.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>chica</strong> (fem.) — “girl.” Tip: chico = boy, chica =
            girl.
          </p>
          <ul>
            <li>La chica es simpática. (The girl is nice.)</li>
            <li>Hay una chica nueva. (There is a new girl.)</li>
          </ul>
        </div>
      </section>

      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>realizar</strong> — “to carry out, perform, achieve.” Tip:
            looks like “realize,” but means accomplish.
          </p>
          <ul>
            <li>Quiero realizar mi meta. (I want to achieve my goal.)</li>
            <li>Realizamos un proyecto. (We carried out a project.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>permitir</strong> — “to allow, permit.” Tip: like “permit.”
          </p>
          <ul>
            <li>
              Mis padres me permiten salir. (My parents allow me to go out.)
            </li>
            <li>No está permitido correr. (Running is not allowed.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>resultar</strong> — “to result, turn out.” Tip: same root as
            “result.”
          </p>
          <ul>
            <li>Todo resultó bien. (Everything turned out well.)</li>
            <li>El plan resultó difícil. (The plan turned out difficult.)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
