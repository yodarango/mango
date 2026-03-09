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
            <strong>mundo</strong> (masc.) — “world.” Tip: sounds like
            “mundo/world.”
          </p>
          <ul>
            <li>El mundo es grande. (The world is big.)</li>
            <li>Viajo por el mundo. (I travel the world.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>hijo</strong> (masc.) — “son.” Tip: pronounce “EE-ho.”
          </p>
          <ul>
            <li>Mi hijo estudia aquí. (My son studies here.)</li>
            <li>El hijo juega. (The son plays.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>coche</strong> (masc.) — “car.” Tip: common word for car in
            Spain.
          </p>
          <ul>
            <li>El coche es rojo. (The car is red.)</li>
            <li>Mi coche es nuevo. (My car is new.)</li>
          </ul>
        </div>
      </section>

      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>perder</strong> — “to lose.” Tip: opposite of <em>ganar</em>{" "}
            (to win).
          </p>
          <ul>
            <li>No quiero perder el juego. (I don’t want to lose the game.)</li>
            <li>Perdí mi libro. (I lost my book.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>aparecer</strong> — “to appear, show up.” Tip: similar to
            “appear.”
          </p>
          <ul>
            <li>El gato apareció. (The cat appeared.)</li>
            <li>Ella aparece tarde. (She shows up late.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>trabajar</strong> — “to work.” Tip: related to{" "}
            <em>trabajo</em> (work).
          </p>
          <ul>
            <li>Trabajo en casa. (I work at home.)</li>
            <li>Ella trabaja mucho. (She works a lot.)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
