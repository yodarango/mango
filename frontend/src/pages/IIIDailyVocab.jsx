import React from "react";
import { Link } from "react-router-dom";
import "./IIIDailyVocab.css";

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

      <section>
        <div>
          <p>
            <strong>tiempo</strong> means "time" in Spanish. It can talk about
            minutes and hours, or even about the weather. Think of “tempo” in
            English music — it helps you remember “tiempo.”
          </p>
          <ul>
            <li>¿Qué tiempo hace hoy? – What’s the weather like today?</li>
            <li>No tengo tiempo. – I don’t have time.</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>hombre</strong> means "man." It sounds a little like
            “human.” Use it when talking about a grown male person.
          </p>
          <ul>
            <li>El hombre trabaja mucho. – The man works a lot.</li>
            <li>Ese hombre es mi papá. – That man is my dad.</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>camino</strong> means "way" or "path." Think of the word
            “walk” or “caminar” in Spanish — they both come from the same root.
            It’s the road you walk on.
          </p>
          <ul>
            <li>
              Voy por el camino al colegio. – I’m going on the path to school.
            </li>
            <li>Este es el camino correcto. – This is the right way.</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>deber</strong> means "to owe" or "must/should." It’s about
            things you have to do. Think of “debt” in English — something you
            owe.
          </p>
          <ul>
            <li>Debes hacer tu tarea. – You must do your homework.</li>
            <li>Te debo un favor. – I owe you a favor.</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>parecer</strong> means "to seem" or "to appear." It’s about
            how something looks or feels. You can remember it by thinking of
            “appear.”
          </p>
          <ul>
            <li>Parece fácil. – It seems easy.</li>
            <li>Ella parece feliz. – She seems happy.</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>llegar</strong> means "to arrive" or "to reach." Think of
            “leg” in English — you use your legs to get somewhere!
          </p>
          <ul>
            <li>Llego a casa a las tres. – I arrive home at three.</li>
            <li>¿Cuándo llegas? – When do you arrive?</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
