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
            <strong>casa</strong> (fem.) — “house, home.” Tip: easy word;
            imagine your house.
          </p>
          <ul>
            <li>Mi casa es grande. (My house is big.)</li>
            <li>Voy a casa. (I go home.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>izquierda</strong> (fem.) — “left.” Tip: used when giving
            directions.
          </p>
          <ul>
            <li>Gira a la izquierda. (Turn left.)</li>
            <li>La tienda está a la izquierda. (The store is on the left.)</li>
          </ul>
        </div>
      </section>

      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>vivir</strong> — “to live.” Tip: looks like “vivid.”
          </p>
          <ul>
            <li>Vivo en una casa. (I live in a house.)</li>
            <li>Ella vive aquí. (She lives here.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>buscar</strong> — “to search, to look for.” Tip: imagine
            looking for a bus.
          </p>
          <ul>
            <li>Busco mi libro. (I look for my book.)</li>
            <li>¿Qué buscas? (What are you looking for?)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
