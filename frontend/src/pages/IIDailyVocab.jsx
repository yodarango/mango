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
            <strong>el camino</strong> (gender: boy) — the way/road. Think of a{" "}
            <em>camino</em> trail. Tip: starts like “cam-” in “camp,” a place
            with paths.
          </p>
          <ul>
            <li>
              El camino a la escuela es corto. (The way to school is short.)
            </li>
            <li>¿Cuál es el mejor camino? (What is the best way?)</li>
            <li>Voy por otro camino. (I’m going another way.)</li>
          </ul>
        </div>
        <div>
          <p>
            <strong>la gente</strong> (gender: girl) — the people. Tip: sounds
            like “gentle” → think “kind people.”
          </p>
          <ul>
            <li>Hay mucha gente aquí. (There are many people here.)</li>
            <li>La gente es amable. (People are kind.)</li>
            <li>Esa gente vive cerca. (Those people live nearby.)</li>
          </ul>
        </div>
      </section>

      <section>
        <div>
          <p>
            <strong>llegar</strong> — “to arrive / to reach.” Tip: think “leg” →
            you arrive with your legs.
          </p>
          <ul>
            <li>Yo llego a las ocho. (I arrive at eight.)</li>
            <li>¿Cuándo llegas? (When do you arrive?)</li>
            <li>Llegamos tarde. (We arrive late.)</li>
          </ul>
        </div>
        <div>
          <p>
            <strong>tratar</strong> — “to try / to treat.” Tip: looks like
            “treat.” <em>Tratar de</em> = to try (to do something).
          </p>
          <ul>
            <li>Voy a tratar de estudiar. (I’m going to try to study.)</li>
            <li>Trato de ayudar. (I try to help.)</li>
            <li>El doctor me trata bien. (The doctor treats me well.)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

// put this into json and use them for other classes
{
  /* <section>
  <div>
    <p>
      <strong>tiempo</strong> means "time." You can use it when talking about
      hours or weather. Think of the English word “tempo,” which helps you
      remember it’s about time and rhythm.
    </p>
    <ul>
      <li>No tengo tiempo. – I don’t have time.</li>
      <li>Hace buen tiempo. – The weather is nice.</li>
    </ul>
  </div>

  <div>
    <p>
      <strong>hombre</strong> means "man." It sounds a little like “human.” Use
      it when talking about an adult male.
    </p>
    <ul>
      <li>El hombre corre rápido. – The man runs fast.</li>
      <li>Ese hombre es mi abuelo. – That man is my grandfather.</li>
    </ul>
  </div>

  <div>
    <p>
      <strong>deber</strong> means "to owe" or "must/should." It’s about
      something you need or have to do. You can remember it by thinking of the
      English word “debt.”
    </p>
    <ul>
      <li>Debes estudiar. – You must study.</li>
      <li>Te debo dinero. – I owe you money.</li>
    </ul>
  </div>

  <div>
    <p>
      <strong>parecer</strong> means "to seem" or "to appear." Use it when
      something looks or feels a certain way. You can think of the English word
      “appear” to remember it.
    </p>
    <ul>
      <li>Parece difícil. – It seems hard.</li>
      <li>Él parece contento. – He seems happy.</li>
    </ul>
  </div>
</section>; */
}
