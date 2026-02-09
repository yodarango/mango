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
            <strong>nombre</strong> (masc.) — “name.” Tip: sounds like “number,”
            but it means name.
          </p>
          <ul>
            <li>Mi nombre es Carlos. (My name is Carlos.)</li>
            <li>¿Cuál es tu nombre? (What is your name?)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>padre</strong> (masc.) — “father.” Tip: formal word for dad.
          </p>
          <ul>
            <li>Mi padre trabaja mucho. (My father works a lot.)</li>
            <li>El padre de Ana es doctor. (Ana’s father is a doctor.)</li>
          </ul>
        </div>
      </section>

      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>crear</strong> — “to create.” Tip: almost the same as
            “create.”
          </p>
          <ul>
            <li>Quiero crear un dibujo. (I want to create a drawing.)</li>
            <li>Creamos una historia. (We create a story.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>evitar</strong> — “to avoid, to prevent.” Tip: think
            “evade.”
          </p>
          <ul>
            <li>Evita correr. (Avoid running.)</li>
            <li>Podemos evitar problemas. (We can avoid problems.)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
