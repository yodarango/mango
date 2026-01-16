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
            <strong>trabajo</strong> (masc.) — “work, job.” Tip: related to{" "}
            <em>trabajar</em>.
          </p>
          <ul>
            <li>Tengo mucho trabajo. (I have a lot of work.)</li>
            <li>Mi trabajo es divertido. (My job is fun.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>llamada</strong> (fem.) — “call.” Tip: from <em>llamar</em>.
          </p>
          <ul>
            <li>Recibí una llamada. (I got a call.)</li>
            <li>Hice una llamada. (I made a call.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>noche</strong> (fem.) — “night.” Tip: think “nocturnal.”
          </p>
          <ul>
            <li>Buenas noches. (Good night.)</li>
            <li>La noche es tranquila. (The night is calm.)</li>
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
            <li>Lleva una chaqueta. (He/She is wearing a jacket.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>existir</strong> — “to exist.” Tip: same as “exist.”
          </p>
          <ul>
            <li>Los animales existen. (Animals exist.)</li>
            <li>No puede existir sin agua. (It can’t exist without water.)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
