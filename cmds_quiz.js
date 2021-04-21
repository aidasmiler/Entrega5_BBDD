const { User, Quiz, Score } = require("./model.js").models;

// Show all quizzes in DB including <id> and <author>
exports.list = async (rl) => {
  let quizzes = await Quiz.findAll({
    include: [
      {
        model: User,
        as: "author",
      },
    ],
  });
  quizzes.forEach((q) =>
    rl.log(`  "${q.question}" (by ${q.author.name}, id=${q.id})`)
  );
};

// Create quiz with <question> and <answer> in the DB
exports.create = async (rl) => {
  let name = await rl.questionP("Enter user");
  let user = await User.findOne({ where: { name } });
  if (!user) throw new Error(`User ('${name}') doesn't exist!`);

  let question = await rl.questionP("Enter question");
  if (!question) throw new Error("Response can't be empty!");

  let answer = await rl.questionP("Enter answer");
  if (!answer) throw new Error("Response can't be empty!");

  await Quiz.create({ question, answer, authorId: user.id });
  rl.log(`   User ${name} creates quiz: ${question} -> ${answer}`);
};

// Test (play) quiz identified by <id>
exports.test = async (rl) => {
  let id = await rl.questionP("Enter quiz Id");
  let quiz = await Quiz.findByPk(Number(id));
  if (!quiz) throw new Error(`  Quiz '${id}' is not in DB`);

  let answered = await rl.questionP(quiz.question);

  if (answered.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
    rl.log(`  The answer "${answered}" is right!`);
  } else {
    rl.log(`  The answer "${answered}" is wrong!`);
  }
};

// Update quiz (identified by <id>) in the DB
exports.update = async (rl) => {
  let id = await rl.questionP("Enter quizId");
  let quiz = await Quiz.findByPk(Number(id));

  let question = await rl.questionP(`Enter question (${quiz.question})`);
  if (!question) throw new Error("Response can't be empty!");

  let answer = await rl.questionP(`Enter answer (${quiz.answer})`);
  if (!answer) throw new Error("Response can't be empty!");

  quiz.question = question;
  quiz.answer = answer;
  await quiz.save({ fields: ["question", "answer"] });

  rl.log(`  Quiz ${id} updated to: ${question} -> ${answer}`);
};

// Delete quiz & favourites (with relation: onDelete: 'cascade')
exports.delete = async (rl) => {
  let id = await rl.questionP("Enter quiz Id");
  let n = await Quiz.destroy({ where: { id } });

  if (n === 0) throw new Error(`  ${id} not in DB`);
  rl.log(`  ${id} deleted from DB`);
};

// Play all quizzes
exports.play = async (rl) => {
  let hayEstos = await Quiz.findAll(); //Aquí tenemos los quizzes que hay

  let quizzesIds = []; //Aquí metemos los ids de los quizzes para reordenarlos luego
  hayEstos.forEach((quiz) => {
    quizzesIds.push(quiz.id);
  });

  quizzesIds = quizzesIds.sort(() => Math.random() - 0.5); //ordenamos aleatoriamente el array

  cuantosHay = quizzesIds.length;
  let score = 0;
  //let gameover = false;

  if (cuantosHay === 0) throw new Error(`  There are no more quizzes`);
  for (let i = 0; i < quizzesIds.length; i++) {
    let id = quizzesIds[i];
    let quiz = await Quiz.findByPk(Number(id));
    let answered = await rl.questionP(quiz.question);
    cuantosHay--;
    if (answered.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
      rl.log(`  The answer "${answered}" is right!`);
      score++;
      if (cuantosHay === 0) {
        //gameover = true;
        rl.log(`  Score: "${score}"`);
      }
    } else {
      rl.log(`  The answer "${answered}" is wrong!`);
      //gameover = true;
      rl.log(`  Score: "${score}"`);
      break;
    }
  }

  let name = await rl.questionP("Enter your user name");
  if (!name) throw new Error("Response can't be empty!");
  let user = await User.findOne({ where: { name } });
  let age = 0;
  if (!user) {
    await User.create({ name, age });
  }
  user = await User.findOne({ where: { name } });
  await Score.create({
    wins: score,
    userId: user.id,
  });
};

exports.score = async (rl) => {
  //let users = await User.findAll();
  let scores = await Score.findAll({
    include: [{model: User, as: 'user'}],
    order:[ ['wins', 'DESC'] ]
  });
  //scores.sort((scores, b) => b -scores);
  let date = new Date();
  let dateToString = date.toUTCString();
  scores.forEach((score) =>
 // users.forEach((user) =>
    //rl.log(`  ${user.name} |${user.id.score}| ${dateToString}`),
    {rl.log(score['user']['name'] + "|" + score['wins'] + "|" + dateToString )}
  /*)*/);
  
};


/*exports.score = async (rl) => {

  //let users = await User.findAll();
  let users = await User.findAll();
  //let score = await Score.findAll();
  
  users.forEach( u => rl.log(`  ${u.name} Score is ${u.userId.score} `));
  //score.forEach( u => rl.log(`  ${score.userId} Score is ${u.wins} `));
  
}*/
