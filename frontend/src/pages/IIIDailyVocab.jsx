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

      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>la gente</strong> (fem., singular form) — “the people.” Tip:
            remember: <em>la gente</em> (singular word, plural idea).
          </p>
          <ul>
            <li>
              La gente del barrio es alegre. (People in the neighborhood are
              cheerful.)
            </li>
            <li>Hay poca gente hoy. (There are few people today.)</li>
            <li>Esa gente canta muy bien. (Those people sing very well.)</li>
          </ul>
        </div>
        <div>
          <p>
            <strong>la vida</strong> (fem.) — “the life.” Tip: “viva” sounds
            like “live!” → think life.
          </p>
          <ul>
            <li>La vida es bonita. (Life is beautiful.)</li>
            <li>
              Mi vida en la escuela es feliz. (My life at school is happy.)
            </li>
            <li>Cuida tu vida. (Take care of your life.)</li>
          </ul>
        </div>
        <div>
          <p>
            <strong>el día</strong> (masc.) — “the day.” Tip: accent on{" "}
            <em>í</em>. Think “day = día.”
          </p>
          <ul>
            <li>El día está soleado. (The day is sunny.)</li>
            <li>Buen día, clase. (Good day, class.)</li>
            <li>Cada día aprendo algo. (Every day I learn something.)</li>
          </ul>
        </div>
      </section>

      <h3>Nouns</h3>
      <section>
        <div>
          <p>
            <strong>tratar</strong> — “to try / to treat.” Tip: pair it with{" "}
            <em>de</em> when you try to do something.
          </p>
          <ul>
            <li>Quiero tratar de leer más. (I want to try to read more.)</li>
            <li>Tratan de llegar temprano. (They try to arrive early.)</li>
            <li>Ella me trata con respeto. (She treats me with respect.)</li>
          </ul>
        </div>
        <div>
          <p>
            <strong>hablar</strong> — “to speak / to talk.” Tip: looks like
            “blah blah” → talking.
          </p>
          <ul>
            <li>¿Puedo hablar contigo? (Can I talk with you?)</li>
            <li>Hablamos español en clase. (We speak Spanish in class.)</li>
            <li>Él habla muy claro. (He speaks very clearly.)</li>
          </ul>
        </div>
        <div>
          <p>
            <strong>dejar</strong> — “to leave / to allow / to let.” Tip:
            “leave” something on a desk; “let” someone do something.
          </p>
          <ul>
            <li>
              Deja el cuaderno en la mesa. (Leave the notebook on the table.)
            </li>
            <li>¿Me dejas salir? (Will you let me go out?)</li>
            <li>Dejé mi mochila en casa. (I left my backpack at home.)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

// put these into json and use them for future classes
{
  /* <section>
  <div>
    <p>
      <strong>tiempo</strong> means "time" in Spanish. It can talk about minutes
      and hours, or even about the weather. Think of “tempo” in English music —
      it helps you remember “tiempo.”
    </p>
    <ul>
      <li>¿Qué tiempo hace hoy? – What’s the weather like today?</li>
      <li>No tengo tiempo. – I don’t have time.</li>
    </ul>
  </div>

  <div>
    <p>
      <strong>hombre</strong> means "man." It sounds a little like “human.” Use
      it when talking about a grown male person.
    </p>
    <ul>
      <li>El hombre trabaja mucho. – The man works a lot.</li>
      <li>Ese hombre es mi papá. – That man is my dad.</li>
    </ul>
  </div>

  <div>
    <p>
      <strong>camino</strong> means "way" or "path." Think of the word “walk” or
      “caminar” in Spanish — they both come from the same root. It’s the road
      you walk on.
    </p>
    <ul>
      <li>Voy por el camino al colegio. – I’m going on the path to school.</li>
      <li>Este es el camino correcto. – This is the right way.</li>
    </ul>
  </div>

  <div>
    <p>
      <strong>deber</strong> means "to owe" or "must/should." It’s about things
      you have to do. Think of “debt” in English — something you owe.
    </p>
    <ul>
      <li>Debes hacer tu tarea. – You must do your homework.</li>
      <li>Te debo un favor. – I owe you a favor.</li>
    </ul>
  </div>

  <div>
    <p>
      <strong>parecer</strong> means "to seem" or "to appear." It’s about how
      something looks or feels. You can remember it by thinking of “appear.”
    </p>
    <ul>
      <li>Parece fácil. – It seems easy.</li>
      <li>Ella parece feliz. – She seems happy.</li>
    </ul>
  </div>

  <div>
    <p>
      <strong>llegar</strong> means "to arrive" or "to reach." Think of “leg” in
      English — you use your legs to get somewhere!
    </p>
    <ul>
      <li>Llego a casa a las tres. – I arrive home at three.</li>
      <li>¿Cuándo llegas? – When do you arrive?</li>
    </ul>
  </div>
</section>; */
}
