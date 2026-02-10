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
            <strong>chico</strong> (masc.) — “guy, boy.” Tip: chico = boy, chica
            = girl.
          </p>
          <ul>
            <li>Ese chico es mi amigo. (That guy/boy is my friend.)</li>
            <li>El chico está en la clase. (The boy is in the class.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>lugar</strong> (masc.) — “place.” Tip: think “location.”
          </p>
          <ul>
            <li>Este lugar es bonito. (This place is pretty.)</li>
            <li>Busco un lugar tranquilo. (I’m looking for a quiet place.)</li>
          </ul>
        </div>
      </section>

      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>quedar</strong> — “to stay, remain, be left.” Tip: “quedan”
            = “are left.”
          </p>
          <ul>
            <li>Me quiero quedar aquí. (I want to stay here.)</li>
            <li>Solo quedan dos. (Only two are left.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>realizar</strong> — “to carry out, perform, achieve.” Tip:
            looks like “realize,” but means accomplish.
          </p>
          <ul>
            <li>Quiero realizar mi meta. (I want to achieve my goal.)</li>
            <li>Realizamos un proyecto. (We carried out a project.)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
