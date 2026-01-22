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
            <strong>hogar</strong> (masc.) — “home.” Tip: home as a warm family
            place.
          </p>
          <ul>
            <li>Mi hogar es tranquilo. (My home is calm.)</li>
            <li>Volvemos al hogar. (We return home.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>pensamiento</strong> (masc.) — “thought.” Tip: from{" "}
            <em>pensar</em> (to think).
          </p>
          <ul>
            <li>Tengo un pensamiento bueno. (I have a good thought.)</li>
            <li>Ese pensamiento es importante. (That thought is important.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>dinero</strong> (masc.) — “money.” Tip: common word used in
            English too.
          </p>
          <ul>
            <li>No tengo dinero. (I don’t have money.)</li>
            <li>Ahorro dinero. (I save money.)</li>
          </ul>
        </div>
      </section>
      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>conocer</strong> — “to know, to meet (people/places).” Tip:
            conocer = be familiar with.
          </p>
          <ul>
            <li>Quiero conocer a tu familia. (I want to meet your family.)</li>
            <li>Conozco esta ciudad. (I know this city.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>tomar</strong> — “to take, to drink.” Tip:{" "}
            <em>tomar agua</em> = drink water.
          </p>
          <ul>
            <li>Tomo agua. (I drink water.)</li>
            <li>Tomamos el autobús. (We take the bus.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>encontrar</strong> — “to find, to encounter.” Tip: looks
            like “encounter.”
          </p>
          <ul>
            <li>Quiero encontrar mi libro. (I want to find my book.)</li>
            <li>Encontramos la respuesta. (We found the answer.)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
