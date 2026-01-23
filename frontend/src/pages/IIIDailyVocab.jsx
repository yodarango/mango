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
            <strong>nombre</strong> (masc.) — “name.” Tip: sounds like “number,”
            but means name.
          </p>
          <ul>
            <li>Mi nombre es Ana. (My name is Ana.)</li>
            <li>¿Cuál es tu nombre? (What is your name?)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>padre</strong> (masc.) — “father.” Tip: formal word for dad.
          </p>
          <ul>
            <li>Mi padre trabaja aquí. (My father works here.)</li>
            <li>Su padre es amable. (His/Her father is kind.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>chico</strong> (masc.) — “guy, boy.” Tip: chico = boy.
          </p>
          <ul>
            <li>Ese chico es mi amigo. (That guy is my friend.)</li>
            <li>El chico corre rápido. (The boy runs fast.)</li>
          </ul>
        </div>
      </section>

      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>crear</strong> — “to create.” Tip: looks like “create.”
          </p>
          <ul>
            <li>Quiero crear un dibujo. (I want to create a drawing.)</li>
            <li>Creamos una idea. (We create an idea.)</li>
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

        <div>
          <p>
            <strong>quedar</strong> — “to stay, remain, be left.” Tip: stay and
            keep.
          </p>
          <ul>
            <li>Me quiero quedar aquí. (I want to stay here.)</li>
            <li>Solo quedan dos. (Only two are left.)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
