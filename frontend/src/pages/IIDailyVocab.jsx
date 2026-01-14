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
            <strong>camino</strong> (masc.) — “way, road.” Tip: think of a path
            you walk on.
          </p>
          <ul>
            <li>Este es el camino correcto. (This is the right way.)</li>
            <li>
              El camino a la escuela es corto. (The way to school is short.)
            </li>
          </ul>
        </div>

        <div>
          <p>
            <strong>gente</strong> (fem., singular) — “people.” Tip: singular
            word, many people.
          </p>
          <ul>
            <li>La gente es amable. (People are kind.)</li>
            <li>Hay mucha gente aquí. (There are many people here.)</li>
          </ul>
        </div>
      </section>

      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>llegar</strong> — “to arrive, to reach.” Tip: you arrive at
            a place.
          </p>
          <ul>
            <li>Llego a casa. (I arrive home.)</li>
            <li>¿Cuándo llegas? (When do you arrive?)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>tratar</strong> — “to try, to treat.” Tip:{" "}
            <em>tratar de</em> = to try to.
          </p>
          <ul>
            <li>Trato de aprender. (I try to learn.)</li>
            <li>El doctor me trata bien. (The doctor treats me well.)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
