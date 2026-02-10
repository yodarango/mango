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
            <strong>madre</strong> (fem.) — “mother.” Tip: formal word for mom.
          </p>
          <ul>
            <li>Mi madre es amable. (My mother is kind.)</li>
            <li>La madre de Juan es doctora. (Juan’s mother is a doctor.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>curso</strong> (masc.) — “course, class.” Tip: like “course”
            in English.
          </p>
          <ul>
            <li>Este curso es fácil. (This course is easy.)</li>
            <li>Tengo un curso de español. (I have a Spanish class.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>papá</strong> (masc.) — “dad.” Tip: accent on the last
            syllable: pa-PÁ.
          </p>
          <ul>
            <li>Mi papá trabaja mucho. (My dad works a lot.)</li>
            <li>Voy con mi papá. (I go with my dad.)</li>
          </ul>
        </div>
      </section>

      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>considerar</strong> — “to consider.” Tip: almost the same as
            English.
          </p>
          <ul>
            <li>Debes considerar la idea. (You should consider the idea.)</li>
            <li>Considero tu plan. (I consider your plan.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>señalar</strong> — “to point out, indicate.” Tip: like
            “signal.”
          </p>
          <ul>
            <li>Señala la respuesta. (Point to the answer.)</li>
            <li>El maestro señala el mapa. (The teacher points at the map.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>presentar</strong> — “to present, introduce.” Tip: like
            “present.”
          </p>
          <ul>
            <li>Voy a presentar a mi amigo. (I will introduce my friend.)</li>
            <li>Presenta tu proyecto. (Present your project.)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
