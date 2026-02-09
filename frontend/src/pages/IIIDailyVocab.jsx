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
            <strong>casa</strong> (fem.) — “house.” Tip: very common word;
            picture your house.
          </p>
          <ul>
            <li>Mi casa es blanca. (My house is white.)</li>
            <li>Regreso a casa. (I return home.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>izquierda</strong> (fem.) — “left.” Tip: sounds like
            “is-KEER-da.”
          </p>
          <ul>
            <li>Gira a la izquierda. (Turn left.)</li>
            <li>La tienda está a la izquierda. (The store is on the left.)</li>
          </ul>
        </div>

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
            <li>Busco mi libro. (I’m looking for my book.)</li>
            <li>¿Qué buscas? (What are you looking for?)</li>
          </ul>
        </div>

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
      </section>
    </div>
  );
};
