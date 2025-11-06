// Helper script to generate quiz data for Subject Pronouns assignment
// This generates the JSON data structure to be inserted into the assignments.data field

function generateRandomId(length = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Subject Pronouns Quiz Data
const subjectPronounsQuiz = [
  {
    id: generateRandomId(),
    type: "multiple",
    question: "Which pronoun means 'I' in Spanish?",
    answer: ["Tú", "Yo", "Él", "Ella"],
    correct: 1,
    coins_worth: 50,
    time_alloted: 30,
  },
  {
    id: generateRandomId(),
    type: "multiple",
    question: "Which pronoun do you use when talking to a friend?",
    answer: ["Yo", "Tú", "Ustedes", "Nosotros"],
    correct: 1,
    coins_worth: 50,
    time_alloted: 30,
  },
  {
    id: generateRandomId(),
    type: "multiple",
    question: "What does 'Nosotros' mean?",
    answer: ["They", "We", "You all", "I"],
    correct: 1,
    coins_worth: 50,
    time_alloted: 30,
  },
  {
    id: generateRandomId(),
    type: "multiple",
    question: "Which pronoun means 'She'?",
    answer: ["Él", "Ella", "Ellos", "Ellas"],
    correct: 1,
    coins_worth: 50,
    time_alloted: 30,
  },
  {
    id: generateRandomId(),
    type: "multiple",
    question: "What is the correct pronoun for a group of boys?",
    answer: ["Ellas", "Nosotros", "Ellos", "Ustedes"],
    correct: 2,
    coins_worth: 50,
    time_alloted: 30,
  },
  {
    id: generateRandomId(),
    type: "multiple",
    question: "Which pronoun means 'You all'?",
    answer: ["Tú", "Nosotros", "Ustedes", "Ellos"],
    correct: 2,
    coins_worth: 50,
    time_alloted: 30,
  },
];

// Execute SQL using sqlite3
const { execSync } = require("child_process");

// Assignment configuration
const coins = 300;
const assignmentId = "1001";
const userIds = [1, 2, 3, 6];
const completed = 0;
const name = "Subject Pronouns";
const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days from now
const path = "/quiz/1001";
const coinsReceived = 0;

const jsonData = JSON.stringify(subjectPronounsQuiz);
const escapedJson = jsonData.replace(/'/g, "''"); // Escape single quotes for SQL

console.log("Inserting assignments...");

try {
  for (const userId of userIds) {
    const sql = `INSERT INTO assignments (coins, assignment_id, user_id, completed, name, due_date, path, coins_received, data)
                 VALUES (${coins}, '${assignmentId}', ${userId}, ${completed}, '${name}', '${dueDate}', '${path}', ${coinsReceived}, '${escapedJson}');`;

    console.log(`\nInserting for user ${userId}...`);
    execSync(`sqlite3 data.db "${sql}"`, { stdio: "inherit" });
  }

  console.log(
    "\n✅ Quiz data successfully inserted into database for all users!"
  );
} catch (error) {
  console.error("\n❌ Error executing SQL:", error.message);
  process.exit(1);
}
