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
            <strong>amigo</strong> (masc.; amiga = fem.) — “friend.” Tip: -o
            boy, -a girl.
          </p>
          <ul>
            <li>Mi amigo es simpático. (My friend is nice.)</li>
            <li>Ella es mi amiga. (She is my friend.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>mente</strong> (fem.) — “mind.” Tip: think “mental.”
          </p>
          <ul>
            <li>Mi mente está cansada. (My mind is tired.)</li>
            <li>Usa tu mente. (Use your mind.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>cabeza</strong> (fem.) — “head.” Tip: think “cap” for your
            head.
          </p>
          <ul>
            <li>Me duele la cabeza. (My head hurts.)</li>
            <li>Muevo la cabeza. (I move my head.)</li>
          </ul>
        </div>
      </section>

      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>afirmar</strong> — “to affirm, to state.” Tip: like
            “affirm.”
          </p>
          <ul>
            <li>Afirmo que es verdad. (I state that it is true.)</li>
            <li>Él afirma su idea. (He affirms his idea.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>preguntar</strong> — “to ask.” Tip: question → preguntar.
          </p>
          <ul>
            <li>Quiero preguntar algo. (I want to ask something.)</li>
            <li>Ella pregunta mucho. (She asks a lot.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>ganar</strong> — “to win, earn, gain.” Tip: think “gain.”
          </p>
          <ul>
            <li>Quiero ganar el juego. (I want to win the game.)</li>
            <li>Gano dinero. (I earn money.)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
