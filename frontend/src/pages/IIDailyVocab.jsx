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
            <strong>trabajo</strong> (masc.) — “work, job.” Tip: related to the
            verb <em>trabajar</em>.
          </p>
          <ul>
            <li>Tengo mucho trabajo. (I have a lot of work.)</li>
            <li>Mi trabajo es importante. (My job is important.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>llamada</strong> (fem.) — “call.” Tip: comes from{" "}
            <em>llamar</em> (to call).
          </p>
          <ul>
            <li>Recibí una llamada. (I got a call.)</li>
            <li>Hice una llamada a mi mamá. (I made a call to my mom.)</li>
          </ul>
        </div>
      </section>

      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>pasar</strong> — “to pass, to happen, to spend (time).” Tip:
            looks like “pass.”
          </p>
          <ul>
            <li>¿Qué pasa? (What’s happening?)</li>
            <li>Paso tiempo con mi familia. (I spend time with my family.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>llevar</strong> — “to carry, to take, to wear.” Tip: you
            carry what you wear.
          </p>
          <ul>
            <li>Llevo mi mochila. (I carry my backpack.)</li>
            <li>Ella lleva un abrigo. (She is wearing a coat.)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
