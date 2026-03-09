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
            <strong>sentimiento</strong> (masc.) — “feeling.” Tip: from{" "}
            <em>sentir</em> (to feel).
          </p>
          <ul>
            <li>Tengo un buen sentimiento. (I have a good feeling.)</li>
            <li>Ese sentimiento es fuerte. (That feeling is strong.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>chica</strong> (fem.) — “girl.” Tip: chico = boy, chica =
            girl.
          </p>
          <ul>
            <li>La chica es simpática. (The girl is nice.)</li>
            <li>Hay una chica en la clase. (There is a girl in the class.)</li>
          </ul>
        </div>
      </section>

      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>permitir</strong> — “to allow, to permit.” Tip: similar to
            “permit.”
          </p>
          <ul>
            <li>
              Mis padres me permiten salir. (My parents allow me to go out.)
            </li>
            <li>No se permite correr. (Running is not allowed.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>resultar</strong> — “to result, to turn out.” Tip: same root
            as “result.”
          </p>
          <ul>
            <li>El plan resultó bien. (The plan turned out well.)</li>
            <li>Todo resulta fácil. (Everything turns out easy.)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
