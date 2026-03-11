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
            <strong>coche</strong> (masc.) — “car.” Tip: common word for car in
            Spain.
          </p>
          <ul>
            <li>El coche es rojo. (The car is red.)</li>
            <li>Mi coche es nuevo. (My car is new.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>mujer</strong> (fem.) — “woman.” Tip: pronounce “moo-HER.”
          </p>
          <ul>
            <li>La mujer trabaja aquí. (The woman works here.)</li>
            <li>Esa mujer es amable. (That woman is kind.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>amigo</strong> (masc.) — “friend.” Tip: amiga = female
            friend.
          </p>
          <ul>
            <li>Mi amigo estudia mucho. (My friend studies a lot.)</li>
            <li>Tengo un amigo nuevo. (I have a new friend.)</li>
          </ul>
        </div>
      </section>

      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>obtener</strong> — “to obtain, to get.” Tip: similar to
            “obtain.”
          </p>
          <ul>
            <li>Quiero obtener un premio. (I want to get a prize.)</li>
            <li>Obtiene buenos resultados. (He/She gets good results.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>lograr</strong> — “to achieve, manage to.” Tip: reaching a
            goal.
          </p>
          <ul>
            <li>Logro terminar la tarea. (I manage to finish the homework.)</li>
            <li>Queremos lograr la meta. (We want to achieve the goal.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>esperar</strong> — “to wait, hope, expect.” Tip: same root
            as “hope.”
          </p>
          <ul>
            <li>Espero el autobús. (I wait for the bus.)</li>
            <li>Espero verte mañana. (I hope to see you tomorrow.)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
