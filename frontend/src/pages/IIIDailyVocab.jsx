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
            <strong>amigo</strong> (masc., but “amiga” for girl friend) —
            “friend.” Tip: -o = boy, -a = girl.
          </p>
          <ul>
            <li>Mi amigo es simpático. (My friend is nice.)</li>
            <li>Ella es mi amiga. (She is my friend.)</li>
            <li>Busco a mi amigo. (I’m looking for my friend.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>mente</strong> (fem.) — “mind.” Tip: think “mental.”
          </p>
          <ul>
            <li>Mi mente está cansada. (My mind is tired.)</li>
            <li>Usa tu mente. (Use your mind.)</li>
            <li>La mente es poderosa. (The mind is powerful.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>cabeza</strong> (fem.) — “head.” Tip: think “cap” → covers
            your head.
          </p>
          <ul>
            <li>Me duele la cabeza. (My head hurts.)</li>
            <li>Protege tu cabeza. (Protect your head.)</li>
            <li>Ella mueve la cabeza. (She moves her head.)</li>
          </ul>
        </div>
      </section>

      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>afirmar</strong> — “to affirm, to state.” Tip: similar to
            “affirm.”
          </p>
          <ul>
            <li>Afirmo que es verdad. (I state that it’s true.)</li>
            <li>Él afirmó su idea. (He affirmed his idea.)</li>
            <li>
              La maestra afirma las reglas. (The teacher states the rules.)
            </li>
          </ul>
        </div>

        <div>
          <p>
            <strong>preguntar</strong> — “to ask.” Tip: question → preguntar.
          </p>
          <ul>
            <li>Quiero preguntar algo. (I want to ask something.)</li>
            <li>Ella pregunta mucho. (She asks a lot.)</li>
            <li>¿Puedo preguntar? (May I ask?)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>ganar</strong> — “to win, earn, gain.” Tip: think “gain.”
          </p>
          <ul>
            <li>Quiero ganar el juego. (I want to win the game.)</li>
            <li>Gano dinero. (I earn money.)</li>
            <li>Ella ganó un premio. (She won a prize.)</li>
          </ul>
        </div>
      </section>
      {/* <h3>Nouns</h3>
      <section>
        <div>
          <p>
            <strong>coche</strong> (masc.) — “car.” Tip: Spain uses “coche,”
            Mexico often uses “carro.”
          </p>
          <ul>
            <li>El coche es rojo. (The car is red.)</li>
            <li>Sube al coche. (Get in the car.)</li>
            <li>Tengo un coche nuevo. (I have a new car.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>mujer</strong> (fem.) — “woman.” Tip: pronounce “moo-HER.”
          </p>
          <ul>
            <li>Esa mujer es doctora. (That woman is a doctor.)</li>
            <li>La mujer habla inglés. (The woman speaks English.)</li>
            <li>Esa mujer es mi mamá. (That woman is my mom.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>amigo</strong> (masc.) — “friend.” Tip: ends in -o for boy
            friend; -a for girl friend (amiga).
          </p>
          <ul>
            <li>Él es mi amigo. (He is my friend.)</li>
            <li>Busco a mi amigo. (I’m looking for my friend.)</li>
            <li>Mi amigo es muy divertido. (My friend is very fun.)</li>
          </ul>
        </div>
      </section>

      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>obtener</strong> — “to obtain, get.” Tip: similar to
            “obtain.”
          </p>
          <ul>
            <li>Quiero obtener buena nota. (I want to get a good grade.)</li>
            <li>
              Puedes obtener información aquí. (You can get information here.)
            </li>
            <li>Obtuve el libro. (I obtained/got the book.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>lograr</strong> — “to achieve; to manage to.” Tip: think
            “long run → achieve.”
          </p>
          <ul>
            <li>Quiero lograr mis metas. (I want to achieve my goals.)</li>
            <li>Logramos terminar. (We managed to finish.)</li>
            <li>Ella logró su sueño. (She achieved her dream.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>esperar</strong> — “to wait; to hope; to expect.” Tip: one
            verb, three meanings!
          </p>
          <ul>
            <li>Espero el bus. (I wait for the bus.)</li>
            <li>Espero que estés bien. (I hope you are well.)</li>
            <li>Espero una respuesta. (I expect a response.)</li>
          </ul>
        </div>
      </section> */}
      {/* <h3>Nouns</h3>
      <section>
        <div>
          <p>
            <strong>mundo</strong> (masc.) — “world.” Tip: think “the whole
            mundo = world.”
          </p>
          <ul>
            <li>El mundo es grande. (The world is big.)</li>
            <li>
              Hay muchos países en el mundo. (There are many countries in the
              world.)
            </li>
            <li>Quiero viajar por el mundo. (I want to travel the world.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>hijo</strong> (masc.) — “son.” Tip: pronounce “EE-ho.”
          </p>
          <ul>
            <li>Mi hijo tiene diez años. (My son is ten years old.)</li>
            <li>Su hijo es muy amable. (Their son is very kind.)</li>
            <li>Veo a mi hijo cada día. (I see my son every day.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>coche</strong> (masc.) — “car.” Tip: used in Spain; in
            Mexico: “carro.”
          </p>
          <ul>
            <li>Tengo un coche nuevo. (I have a new car.)</li>
            <li>Sube al coche. (Get in the car.)</li>
            <li>El coche es rápido. (The car is fast.)</li>
          </ul>
        </div>
      </section>

      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>perder</strong> — “to lose.” Tip: think “I don’t want to
            lose PERDón.”
          </p>
          <ul>
            <li>No quiero perder mi libro. (I don’t want to lose my book.)</li>
            <li>Perdemos el juego. (We lose the game.)</li>
            <li>Perdí mis llaves. (I lost my keys.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>aparecer</strong> — “to appear, show up.” Tip: looks like
            “appear.”
          </p>
          <ul>
            <li>El gato apareció. (The cat appeared.)</li>
            <li>Ella aparece tarde. (She shows up late.)</li>
            <li>
              Algo apareció en la mesa. (Something showed up on the table.)
            </li>
          </ul>
        </div>

        <div>
          <p>
            <strong>trabajar</strong> — “to work.” Tip: similar to “trabajo”
            (work/noun).
          </p>
          <ul>
            <li>Trabajo en la escuela. (I work at the school.)</li>
            <li>Él trabaja mucho. (He works a lot.)</li>
            <li>Trabajamos juntos. (We work together.)</li>
          </ul>
        </div>
      </section> */}

      {/* <h3>Nouns</h3>

      <section>
        <div>
          <p>
            <strong>casa</strong> (fem.) — “house.” Tip: very common word;
            picture your house.
          </p>
          <ul>
            <li>Mi casa es grande. (My house is big.)</li>
            <li>Regreso a casa. (I return home.)</li>
            <li>La casa es blanca. (The house is white.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>izquierda</strong> (fem.) — “left.” Tip: “iz-QUIER-da” →
            sounds like “is weird-a.”
          </p>
          <ul>
            <li>Gira a la izquierda. (Turn left.)</li>
            <li>Mi mano izquierda. (My left hand.)</li>
            <li>
              El salón está a la izquierda. (The classroom is on the left.)
            </li>
          </ul>
        </div>

        <div>
          <p>
            <strong>derecha</strong> (fem.) — “right.” Tip: “de-RE-cha” → think
            “direct, correct.”
          </p>
          <ul>
            <li>Gira a la derecha. (Turn right.)</li>
            <li>Mi mano derecha. (My right hand.)</li>
            <li>La tienda está a la derecha. (The store is on the right.)</li>
          </ul>
        </div>
      </section>

      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>vivir</strong> — “to live.” Tip: looks like “vivid,” full of
            life.
          </p>
          <ul>
            <li>Vivo en una casa. (I live in a house.)</li>
            <li>Queremos vivir aquí. (We want to live here.)</li>
            <li>Ella vive cerca. (She lives nearby.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>buscar</strong> — “to search; to look for.” Tip: picture a
            “bus” that helps you look for things.
          </p>
          <ul>
            <li>Busco mi lápiz. (I’m looking for my pencil.)</li>
            <li>¿Qué buscas? (What are you looking for?)</li>
            <li>Buscamos un lugar. (We are looking for a place.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>entrar</strong> — “to enter; to go in.” Tip: looks like
            “enter.”
          </p>
          <ul>
            <li>Puedes entrar. (You may enter.)</li>
            <li>Entramos a la clase. (We go into the class.)</li>
            <li>No quiero entrar todavía. (I don’t want to go in yet.)</li>
          </ul>
        </div>
      </section> */}

      {/* <h3>Nouns</h3>
      <section>
        <div>
          <p>
            <strong>lugar</strong> (masc.) — “place.” Tip: think “location.”
          </p>
          <ul>
            <li>Este lugar es bonito. (This place is pretty.)</li>
            <li>Busco un lugar tranquilo. (I’m looking for a quiet place.)</li>
            <li>Vivimos en un buen lugar. (We live in a good place.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>sentimiento</strong> (masc.) — “feeling.” Tip: comes from{" "}
            <em>sentir</em> (to feel).
          </p>
          <ul>
            <li>Tengo un buen sentimiento. (I have a good feeling.)</li>
            <li>Ese sentimiento es fuerte. (That feeling is strong.)</li>
            <li>Habla de tus sentimientos. (Talk about your feelings.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>chica</strong> (fem.) — “girl.” Tip: chico = boy, chica =
            girl.
          </p>
          <ul>
            <li>La chica es amable. (The girl is kind.)</li>
            <li>Hay una chica nueva. (There is a new girl.)</li>
            <li>Esa chica es mi amiga. (That girl is my friend.)</li>
          </ul>
        </div>
      </section>

      <h3>Verbs</h3>

      <section>
        <div>
          <p>
            <strong>realizar</strong> — “to carry out, perform, achieve.” Tip:
            looks like “realize,” but means to accomplish.
          </p>
          <ul>
            <li>Quiero realizar mis metas. (I want to achieve my goals.)</li>
            <li>Realizamos un proyecto. (We carried out a project.)</li>
            <li>Ella realizó su sueño. (She achieved her dream.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>permitir</strong> — “to allow, permit.” Tip: exactly like
            “permit.”
          </p>
          <ul>
            <li>
              Mis padres me permiten salir. (My parents allow me to go out.)
            </li>
            <li>No está permitido correr. (Running is not allowed.)</li>
            <li>Permite que te ayude. (Allow me to help you.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>resultar</strong> — “to result, turn out.” Tip: like
            “result.”
          </p>
          <ul>
            <li>Todo resultó bien. (Everything turned out well.)</li>
            <li>El plan resultó difícil. (The plan turned out difficult.)</li>
            <li>¿Cómo resultó el proyecto? (How did the project turn out?)</li>
          </ul>
        </div>
      </section> */}

      {/* <h3>Nouns</h3>
      <section>
        <div>
          <p>
            <strong>nombre</strong> (masc.) — “name.” Tip: sounds like “number,”
            but it means “name.”
          </p>
          <ul>
            <li>Mi nombre es Ana. (My name is Ana.)</li>
            <li>¿Cuál es tu nombre? (What is your name?)</li>
            <li>Escribe tu nombre aquí. (Write your name here.)</li>
          </ul>
        </div>
        <div>
          <p>
            <strong>padre</strong> (masc.) — “father.” Tip: like “dad” in
            “paternal.”
          </p>
          <ul>
            <li>Mi padre es muy amable. (My father is very kind.)</li>
            <li>Veo a mi padre cada día. (I see my father every day.)</li>
            <li>
              Su padre trabaja en la escuela. (His/Her father works at the
              school.)
            </li>
          </ul>
        </div>
        <div>
          <p>
            <strong>chico</strong> (masc.) — “guy, boy.” Tip: think “little kid”
            → “chico.”
          </p>
          <ul>
            <li>Ese chico es mi amigo. (That guy/boy is my friend.)</li>
            <li>El chico juega fútbol. (The boy plays soccer.)</li>
            <li>
              Hay un chico nuevo en la clase. (There is a new guy/boy in class.)
            </li>
          </ul>
        </div>
      </section>

      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>crear</strong> — “to create.” Tip: looks like “create” →
            same meaning.
          </p>
          <ul>
            <li>Me gusta crear dibujos. (I like to create drawings.)</li>
            <li>
              Vamos a crear un proyecto. (We are going to create a project.)
            </li>
            <li>Puedes crear una idea nueva. (You can create a new idea.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>evitar</strong> — “to avoid, to prevent.” Tip: think “evade”
            → avoid.
          </p>
          <ul>
            <li>Quiero evitar problemas. (I want to avoid problems.)</li>
            <li>Evita correr en el pasillo. (Avoid running in the hallway.)</li>
            <li>Podemos evitar el ruido. (We can prevent the noise.)</li>
          </ul>
        </div>

        <div>
          <p>
            <strong>quedar</strong> — “to stay, remain, be left.” Tip: think
            “stay and <em>k</em>eep.”
          </p>
          <ul>
            <li>Me quiero quedar aquí. (I want to stay here.)</li>
            <li>Solo quedan dos. (Only two are left.)</li>
            <li>
              La camisa me queda bien. (The shirt fits me / stays well on me.)
            </li>
          </ul>
        </div>
      </section> */}
      {/* <section>
        <div>
          <p>
            <strong>conocer</strong> — “to know, to meet (people/places).” Tip:
            conocer = be familiar, meet.
          </p>
          <ul>
            <li>Quiero conocer a tu familia. (I want to meet your family.)</li>
            <li>Conozco esta ciudad. (I know this city.)</li>
            <li>¿Conoces a Mario? (Do you know Mario?)</li>
          </ul>
        </div>
        <div>
          <p>
            <strong>tomar</strong> — “to take, to drink.” Tip: “tomar agua” =
            drink water.
          </p>
          <ul>
            <li>Tomo agua cada día. (I drink water every day.)</li>
            <li>Tomamos el autobús. (We take the bus.)</li>
            <li>¿Quieres tomar jugo? (Do you want to drink juice?)</li>
          </ul>
        </div>
        <div>
          <p>
            <strong>encontrar</strong> — “to find, to encounter.” Tip: looks
            like “encounter.”
          </p>
          <ul>
            <li>Quiero encontrar mi libro. (I want to find my book.)</li>
            <li>No puedo encontrar mi lápiz. (I can’t find my pencil.)</li>
            <li>Encontramos una solución. (We found a solution.)</li>
          </ul>
        </div>
      </section> */}

      {/* <h3>Nouns</h3>
      <section>
        <div>
          <p>
            <strong>hogar</strong> (masc.) — “home” (cozy family place). Tip:
            “home” and “hogar” both start with “ho.”
          </p>
          <ul>
            <li>Mi hogar es tranquilo. (My home is calm.)</li>
            <li>Volvemos al hogar. (We go back home.)</li>
            <li>
              El hogar une a la familia. (Home brings the family together.)
            </li>
          </ul>
        </div>
        <div>
          <p>
            <strong>pensamiento</strong> (masc.) — “thought.” Tip: comes from{" "}
            <em>pensar</em> (to think).
          </p>
          <ul>
            <li>Tuve un buen pensamiento. (I had a good thought.)</li>
            <li>Es solo un pensamiento. (It’s just a thought.)</li>
            <li>Comparte tu pensamiento. (Share your thought.)</li>
          </ul>
        </div>
        <div>
          <p>
            <strong>dinero</strong> (masc.) — “money.” Tip: many kids know
            “dinero” from movies.
          </p>
          <ul>
            <li>No tengo dinero. (I don’t have money.)</li>
            <li>Ahorro dinero. (I save money.)</li>
            <li>¿Cuánto dinero cuesta? (How much money does it cost?)</li>
          </ul>
        </div>
      </section>

      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>conocer</strong> — “to know/meet (people/places).” Tip:
            conocer = meet or be familiar with.
          </p>
          <ul>
            <li>Quiero conocer a tu mamá. (I want to meet your mom.)</li>
            <li>Conozco esta ciudad. (I know this city.)</li>
            <li>¿Conoces a Ana? (Do you know Ana?)</li>
          </ul>
        </div>
        <div>
          <p>
            <strong>tomar</strong> — “to take; to drink.” Tip: “tomar agua” =
            drink water.
          </p>
          <ul>
            <li>Tomo agua. (I drink water.)</li>
            <li>Tomamos el bus. (We take the bus.)</li>
            <li>¿Quieres tomar jugo? (Do you want to drink juice?)</li>
          </ul>
        </div>
        <div>
          <p>
            <strong>encontrar</strong> — “to find; to encounter.” Tip: looks
            like “encounter.”
          </p>
          <ul>
            <li>Encuentro mi lápiz. (I find my pencil.)</li>
            <li>¿Dónde puedo encontrarlo? (Where can I find it?)</li>
            <li>Encontramos una solución. (We found a solution.)</li>
          </ul>
        </div>
      </section> */}
    </div>
  );
};

// put these into json and use them for future classes
{
  /* <h3>Nouns</h3>
      <section>
        <div>
          <p>
            <strong>el trabajo</strong> (masc.) — “the work/job.” Tip: looks
            like “labor,” both about effort.
          </p>
          <ul>
            <li>Tengo mucho trabajo hoy. (I have a lot of work today.)</li>
            <li>Mi trabajo es enseñar. (My job is to teach.)</li>
            <li>El trabajo está terminado. (The work is finished.)</li>
          </ul>
        </div>
        <div>
          <p>
            <strong>la llamada</strong> (fem.) — “the call.” Tip: comes from{" "}
            <em>llamar</em> (to call) → add “-ada” = the act of calling.
          </p>
          <ul>
            <li>Recibí una llamada de mi mamá. (I got a call from my mom.)</li>
            <li>Haz una llamada, por favor. (Make a call, please.)</li>
            <li>La llamada fue importante. (The call was important.)</li>
          </ul>
        </div>
        <div>
          <p>
            <strong>la noche</strong> (fem.) — “the night.” Tip: sounds like
            “nocturnal,” which means “night.”
          </p>
          <ul>
            <li>Buenas noches. (Good night.)</li>
            <li>La noche está tranquila. (The night is calm.)</li>
            <li>Trabajo por la noche. (I work at night.)</li>
          </ul>
        </div>
      </section>

      <h3>Verbs</h3>
      <section>
        <div>
          <p>
            <strong>pasar</strong> — “to pass / to happen / to spend (time).”
            Tip: sounds like “pass” in English → easy!
          </p>
          <ul>
            <li>¿Qué pasa? (What’s happening?)</li>
            <li>Paso mucho tiempo leyendo. (I spend a lot of time reading.)</li>
            <li>El autobús va a pasar. (The bus is going to pass.)</li>
          </ul>
        </div>
        <div>
          <p>
            <strong>llevar</strong> — “to carry / to take / to wear.” Tip: think
            “you carry it → you wear it.”
          </p>
          <ul>
            <li>Llevo mi mochila. (I carry my backpack.)</li>
            <li>¿Qué ropa llevas hoy? (What clothes are you wearing today?)</li>
            <li>Llevamos comida al picnic. (We take food to the picnic.)</li>
          </ul>
        </div>
        <div>
          <p>
            <strong>existir</strong> — “to exist.” Tip: looks and sounds almost
            the same as English “exist.”
          </p>
          <ul>
            <li>Dios existe. (God exists.)</li>
            <li>¿Crees que existen los aliens? (Do you think aliens exist?)</li>
            <li>No puede existir sin agua. (It can’t exist without water.)</li>
          </ul>
        </div>
      </section> */
}
{
  /* <section>
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
</section> */
}
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
