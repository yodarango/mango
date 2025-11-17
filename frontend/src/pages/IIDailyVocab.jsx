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
            <strong>trabajo</strong> (masc.) — “work, job.” Tip: think “I{" "}
            <em>try</em> hard at work” → “tra-BA-jo.”
          </p>
          <ul>
            <li>Tengo mucho trabajo hoy. (I have a lot of work today.)</li>
            <li>Me gusta mi trabajo. (I like my job.)</li>
            <li>Terminé el trabajo. (I finished the work.)</li>
          </ul>
        </div>
        <div>
          <p>
            <strong>llamada</strong> (fem.) — “call (phone call).” Tip: comes
            from <em>llamar</em> (to call).
          </p>
          <ul>
            <li>Hice una llamada a mi mamá. (I made a call to my mom.)</li>
            <li>Recibí una llamada importante. (I got an important call.)</li>
            <li>La llamada fue muy corta. (The call was very short.)</li>
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
            <li>Paso tiempo con mis amigos. (I spend time with my friends.)</li>
            <li>El tren va a pasar. (The train is going to pass.)</li>
          </ul>
        </div>
        <div>
          <p>
            <strong>llevar</strong> — “to carry, to take, to wear.” Tip: you
            “carry” what you “wear.”
          </p>
          <ul>
            <li>Llevo mi mochila. (I carry my backpack.)</li>
            <li>
              Ella lleva una chaqueta roja. (She is wearing a red jacket.)
            </li>
            <li>Llevamos comida a la fiesta. (We take food to the party.)</li>
          </ul>
        </div>
      </section>

      {/* <h3>Nouns</h3> 
      <section>
        <div>
          <p>
            <strong>vida</strong> (fem.) — “life.” Tip: “¡Viva!” = alive → think
            life.
          </p>
          <ul>
            <li>La vida es buena. (Life is good.)</li>
            <li>
              Mi vida en la escuela es feliz. (My life at school is happy.)
            </li>
            <li>Cuida tu vida. (Take care of your life.)</li>
          </ul>
        </div>
        <div>
          <p>
            <strong>día</strong> (masc.) — “day.” Tip: looks like “day,” but
            with an accent: día.
          </p>
          <ul>
            <li>Cada día aprendo algo. (Every day I learn something.)</li>
            <li>El día está soleado. (The day is sunny.)</li>
            <li>Buen día, clase. (Good day, class.)</li>
          </ul>
        </div>
      </section>

      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>hablar</strong> — “to speak; to talk.” Tip: think “blah
            blah” → talking.
          </p>
          <ul>
            <li>Hablamos español en clase. (We speak Spanish in class.)</li>
            <li>¿Puedo hablar contigo? (Can I talk with you?)</li>
            <li>Ella habla muy claro. (She speaks very clearly.)</li>
          </ul>
        </div>
        <div>
          <p>
            <strong>dejar</strong> — “to leave; to allow/let.” Tip: “leave it”
            on the desk; “let” someone do it.
          </p>
          <ul>
            <li>Deja el libro aquí. (Leave the book here.)</li>
            <li>¿Me dejas salir? (Will you let me go out?)</li>
            <li>Dejé mi mochila en casa. (I left my backpack at home.)</li>
          </ul>
        </div>
      </section> */}
    </div>
  );
};

// put this into json and use them for other classes
{
  /* <h3>Nouns</h3>
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
      </section> */
}
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
