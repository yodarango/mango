### Come se preparare una lessione:

1. Vai danotebookLM e domandali, secondo dove mi trovi, cosa dovrei insegnare prossimo
2. chiedili di farmi un outline con la query:

#### Spanish III

I am Spanish high school teacher, make me a teaching outline including excercises and activities that I can use in the classroom to make the concept of **\_\_\_\_** clear to my students. Leverage as much similarities with the english.

#### Spanish II

I am Spanish teacher of third grade, make me a teaching outline including excercises and activities that I can use in the classroom to make the concept of **\_\_\_\_** clear to my students. Leverage as much similarities with the english. Becuase these students are young, avoid complicated and grammatical jargon. Be simple.

3. Appicica il outline in augment con la query:

#### Spanish III

I am Spanish high school teacher and this is my teaching outline below. I want you to create a new directory under @pages/lessons with the title **\_\_\_\_** and then a `jsx` and `css` title bearing the same name as the folder. Then I want you to create me in the new jsx and css files a lesson that explains this in clear language to my students with enough visual elements like emojies, colors, exaples, animations, etc. I also want you to create interactive content wher users can answer questions via input, multiple choice, aranging cards, etc. anyting that will allow them to interact in order to memorize the content. The responses to the answer do not have to be saved to the db, they must remain in local storage with a name that bears the same title as the lesson. At the top of the lesson create a link to **\_\_\_\_** so that they can take the quiz on the material. Do not forget to add the link to this lesson under @resourcesClassThree.jsx and the corresponding path **\_\_\_\_** to @App.jsx

#### Spanish II

I am Spanish teacher of thrid grade and this is my teaching outline below. I want you to create a new directory under @pages/lessons with the title **\_\_\_\_** and then a `jsx` and `css` title bearing the same name as the folder. Then I want you to create me in the new jsx and css files a lesson that explains this in clear language to my students with enough visual elements like emojies, colors, exaples, animations, etc. I also want you to create interactive content wher users can answer questions via input, multiple choice, aranging cards, etc. anyting that will allow them to interact in order to memorize the content. The responses to the answer do not have to be saved to the db, they must remain in local storage with a name that bears the same title as the lesson. At the top of the lesson create a link to **\_\_\_\_** so that they can take the quiz on the material. Becuase these students are young, avoid complicated and grammatical jargon. Be simple. Do not forget to add the link to this lesson under @resourcesClassTwo.jsx and the corresponding path **\_\_\_\_** to @App.jsx

4. Appicica il outline in un nuovo proggeto di agument e crea un video
5. Include il video nel compoenent di react

### Come preparare le domande per una lessione

#### query per NotebookLM

I am a teacher of spanish for 5th grade students and I have a quizzing app that takes in an array of object types for quizes like so:
A. multiple choice question:
{
"id": "a7b3c9d2",
"type": "multiple" ,
"question": "What is the capital of Spain?",
"answer": ["Madrid", "Barcelona", "Valencia", "Seville"],
"correct": 0 (index of the correct answer),
"coins_worth": 10,
"time_alloted": 30
}

B. The user inputs the answer
{
"id": "x4y8z1w5",
"type": "input",
"question": "How do you say 'hello' in Spanish?",
"answer": "hola" (expectedanswer),
"correct": null,
"coins_worth": 5,
"time_alloted": 20
}

based on this lesson, create 10 questions for the 5ht grade students. 5 input and five typed. Randomly mix them in one array. time_alloted for multiple choice should be **\_\_\_\_** and **\_\_\_\_** for typed. coins worth for multiple choice should be 50 and 100 for typed

### Come se preparare daily vocab:

1. `sync_test.sh`
2. Crea un nuovo compito
3. copia asignment.data dalla db
4. strarre le parole in chat gpt con la query:

#### query

I am a spanish teacher of 5th grade. I have created a new daily vocab assignemnt for my students with the follwoing words in each object (ignore the rest of the fields in the object just pay attention to eng and spa) **\_\_\_\_**

Now create me a very consice description for each and an example of their usage in daily conversation with examples so my students can see how they are used. Give tips on how to memorize them, perhaps by leveraging similarities with english equivalents, memonic tactics, or any other strategies used by poluglots to memorize vocab. Use very simple language suitable for these students.

give me the output in the follwign html format:
a <section> tag as the main parent
a <div> tag wrapper for each word
a <p> tag for the description inside the div
a <ul> for the examples inside the div sibling to <p>

do not give me a file but an output i can copy
do not include styles

5. appicica questo sotto il componento @dailyVocab
