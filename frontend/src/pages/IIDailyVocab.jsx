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
            <strong>vida</strong> (fem.) — “life.” Tip: “¡Viva!” means alive →
            life.
          </p>
          <ul>
            <li>La vida es bonita. (Life is beautiful.)</li>
            <li>Mi vida es feliz. (My life is happy.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>día</strong> (masc.) — “day.” Tip: looks like “day,” but
            with an accent.
          </p>
          <ul>
            <li>Buen día. (Good day.)</li>
            <li>Cada día estudio. (Every day I study.)</li>
          </ul>
        </div>
      </section>

      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>hablar</strong> — “to speak, to talk.” Tip: think “blah
            blah.”
          </p>
          <ul>
            <li>Hablo español. (I speak Spanish.)</li>
            <li>Vamos a hablar. (Let’s talk.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>dejar</strong> — “to leave, to let.” Tip: “let it go.”
          </p>
          <ul>
            <li>Deja el libro aquí. (Leave the book here.)</li>
            <li>¿Me dejas entrar? (Will you let me enter?)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
