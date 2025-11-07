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

      <section>
        <div>
          <p>
            <strong>tiempo</strong> means "time." You can use it when talking
            about hours or weather. Think of the English word “tempo,” which
            helps you remember it’s about time and rhythm.
          </p>
          <ul>
            <li>No tengo tiempo. – I don’t have time.</li>
            <li>Hace buen tiempo. – The weather is nice.</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>hombre</strong> means "man." It sounds a little like
            “human.” Use it when talking about an adult male.
          </p>
          <ul>
            <li>El hombre corre rápido. – The man runs fast.</li>
            <li>Ese hombre es mi abuelo. – That man is my grandfather.</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>deber</strong> means "to owe" or "must/should." It’s about
            something you need or have to do. You can remember it by thinking of
            the English word “debt.”
          </p>
          <ul>
            <li>Debes estudiar. – You must study.</li>
            <li>Te debo dinero. – I owe you money.</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>parecer</strong> means "to seem" or "to appear." Use it when
            something looks or feels a certain way. You can think of the English
            word “appear” to remember it.
          </p>
          <ul>
            <li>Parece difícil. – It seems hard.</li>
            <li>Él parece contento. – He seems happy.</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
