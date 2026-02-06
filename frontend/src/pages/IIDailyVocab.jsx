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
            <strong>pensamiento</strong> (masc.) — “thought.” Tip: comes from{" "}
            <em>pensar</em> (to think).
          </p>
          <ul>
            <li>Tengo un pensamiento bueno. (I have a good thought.)</li>
            <li>Ese pensamiento es importante. (That thought is important.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>dinero</strong> (masc.) — “money.” Tip: many people already
            know “dinero.”
          </p>
          <ul>
            <li>No tengo dinero. (I don’t have money.)</li>
            <li>Necesito dinero. (I need money.)</li>
          </ul>
        </div>
      </section>

      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>tomar</strong> — “to take; to drink.” Tip:{" "}
            <em>tomar agua</em> = drink water.
          </p>
          <ul>
            <li>Tomo agua. (I drink water.)</li>
            <li>Tomamos el autobús. (We take the bus.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>encontrar</strong> — “to find; to encounter.” Tip: looks
            like “encounter.”
          </p>
          <ul>
            <li>No puedo encontrar mi libro. (I can’t find my book.)</li>
            <li>Encontré mi lápiz. (I found my pencil.)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
