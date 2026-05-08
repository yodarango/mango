import React from "react";
import { Link } from "react-router-dom";
import "./IIDailyVocab.css";

export const IIDailyVocab = () => {
  return (
    <div className='daily-vocab-ii'>
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
            <strong>derecha</strong> (fem.) — “right.” Tip: think “direct →
            derecha.”
          </p>
          <ul>
            <li>Gira a la derecha. (Turn right.)</li>
            <li>Mi mano derecha. (My right hand.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>madre</strong> (fem.) — “mother.” Tip: more formal than
            “mamá.”
          </p>
          <ul>
            <li>Mi madre es amable. (My mother is kind.)</li>
            <li>La madre trabaja mucho. (The mother works a lot.)</li>
          </ul>
        </div>
      </section>

      <H3>Verbs</H3>
      <section>
        <div>
          <p>
            <strong>entrar</strong> — “to enter, to go in.” Tip: looks like
            “enter.”
          </p>
          <ul>
            <li>Puedes entrar. (You may enter.)</li>
            <li>Entramos a la clase. (We go into the class.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>considerar</strong> — “to consider.” Tip: same as English.
          </p>
          <ul>
            <li>Debes considerar la idea. (You should consider the idea.)</li>
            <li>Considero tu plan. (I consider your plan.)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
