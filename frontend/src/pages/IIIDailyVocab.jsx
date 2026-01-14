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
            <strong>gente</strong> (fem.) — “people.” Tip: always say{" "}
            <em>la gente</em>.
          </p>
          <ul>
            <li>La gente escucha. (People listen.)</li>
            <li>La gente habla. (People talk.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>vida</strong> (fem.) — “life.” Tip: “¡Viva!” = life.
          </p>
          <ul>
            <li>La vida es buena. (Life is good.)</li>
            <li>Mi vida es feliz. (My life is happy.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>día</strong> (masc.) — “day.” Tip: accent on the í.
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
            <strong>tratar</strong> — “to try.” Tip: repeat helps memory.
          </p>
          <ul>
            <li>Trato de ayudar. (I try to help.)</li>
            <li>Trata de escuchar. (Try to listen.)</li>
          </ul>
        </div>

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
