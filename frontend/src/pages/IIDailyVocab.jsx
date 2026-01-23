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
            <strong>noche</strong> (fem.) — “night.” Tip: think “nocturnal.”
          </p>
          <ul>
            <li>Buenas noches. (Good night.)</li>
            <li>La noche es oscura. (The night is dark.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>hogar</strong> (masc.) — “home.” Tip: home as a warm family
            place.
          </p>
          <ul>
            <li>Mi hogar es tranquilo. (My home is calm.)</li>
            <li>Regreso al hogar. (I return home.)</li>
          </ul>
        </div>
      </section>

      <h3> Verbs</h3>
      <section>
        <div>
          <p>
            <strong>existir</strong> — “to exist.” Tip: same as “exist.”
          </p>
          <ul>
            <li>Los animales existen. (Animals exist.)</li>
            <li>No puede existir sin agua. (It can’t exist without water.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>conocer</strong> — “to know, to meet.” Tip: conocer = people
            or places.
          </p>
          <ul>
            <li>Quiero conocer a tu padre. (I want to meet your father.)</li>
            <li>Conozco esta ciudad. (I know this city.)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
