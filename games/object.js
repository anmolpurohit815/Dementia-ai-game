/* --------------------------------
   ELEMENTS
-------------------------------- */

const difficultySelect =
    document.getElementById("difficulty");

const scoreDisplay =
    document.getElementById("score");

const mistakesDisplay =
    document.getElementById("mistakes");

const accuracyDisplay =
    document.getElementById("accuracy");

const timerDisplay =
    document.getElementById("timer");

const roundDisplay =
    document.getElementById("roundDisplay");

const objectDisplay =
    document.getElementById("objectDisplay");

const optionButtons = [
    document.getElementById("option1"),
    document.getElementById("option2"),
    document.getElementById("option3"),
    document.getElementById("option4")
];

const startBtn =
    document.getElementById("startBtn");

const restartBtn =
    document.getElementById("restartBtn");


/* --------------------------------
   OBJECT DATA
-------------------------------- */

const objects = [
    {
        emoji: "🍎",
        name: "Apple"
    },

    {
        emoji: "🍌",
        name: "Banana"
    },

    {
        emoji: "🍊",
        name: "Orange"
    },

    {
        emoji: "🍇",
        name: "Grapes"
    },

    {
        emoji: "🍉",
        name: "Watermelon"
    },

    {
        emoji: "🍓",
        name: "Strawberry"
    },

    {
        emoji: "🍍",
        name: "Pineapple"
    },

    {
        emoji: "🥝",
        name: "Kiwi"
    },

    {
        emoji: "🚗",
        name: "Car"
    },

    {
        emoji: "🚲",
        name: "Bicycle"
    },

    {
        emoji: "📚",
        name: "Book"
    },

    {
        emoji: "⚽",
        name: "Football"
    }
];


/* --------------------------------
   DIFFICULTY SETTINGS
-------------------------------- */

const difficultySettings = {

    easy: {
        optionCount: 2
    },

    medium: {
        optionCount: 3
    },

    hard: {
        optionCount: 4
    }

};


/* --------------------------------
   GAME VARIABLES
-------------------------------- */

let currentDifficulty = "easy";

let currentObject = null;

let score = 0;

let mistakes = 0;

let totalQuestions = 0;

let timeTaken = 0;

let startTime = null;

let gameRunning = false;

let currentRound = 0;

const totalRounds = 10;


/* --------------------------------
   SHUFFLE ARRAY
-------------------------------- */

function shuffle(array) {

    return array.sort(
        () => Math.random() - 0.5
    );

}


/* --------------------------------
   START GAME
-------------------------------- */

function startGame() {

    currentDifficulty =
        difficultySelect.value;

    score = 0;

    mistakes = 0;

    totalQuestions = 0;

    timeTaken = 0;

    currentRound = 0;

    gameRunning = true;

    startTime = Date.now();


    scoreDisplay.textContent = "0";

    mistakesDisplay.textContent = "0";

    accuracyDisplay.textContent = "0%";

    timerDisplay.textContent = "0";

    roundDisplay.textContent =
        "Round 0 / " + totalRounds;


    objectDisplay.textContent =
        "Get Ready...";


    optionButtons.forEach(
        button => {

            button.disabled = true;

        }
    );


    setTimeout(() => {

        if (gameRunning) {

            generateQuestion();

        }

    }, 1000);

}


/* --------------------------------
   GENERATE QUESTION
-------------------------------- */

function generateQuestion() {

    if (!gameRunning) {

        return;

    }


    if (currentRound >= totalRounds) {

        finishGame();

        return;

    }


    currentRound++;


    roundDisplay.textContent =
        "Round " +
        currentRound +
        " / " +
        totalRounds;


    const settings =
        difficultySettings[
            currentDifficulty
        ];


    /* Choose random object */

    currentObject =
        objects[
            Math.floor(
                Math.random() * objects.length
            )
        ];


    /* Show object */

    objectDisplay.textContent =
        currentObject.emoji;


    objectDisplay.style.fontSize =
        "100px";


    /* Create wrong options */

    let wrongObjects =
        objects.filter(
            object =>
                object.name !==
                currentObject.name
        );


    wrongObjects =
        shuffle(wrongObjects);


    let selectedOptions = [
        currentObject
    ];


    for (
        let i = 0;
        i < settings.optionCount - 1;
        i++
    ) {

        selectedOptions.push(
            wrongObjects[i]
        );

    }


    selectedOptions =
        shuffle(selectedOptions);


    /* Show options */

    optionButtons.forEach(
        (button, index) => {

            if (
                index <
                settings.optionCount
            ) {

                button.style.display =
                    "inline-block";

                button.textContent =
                    selectedOptions[index]
                        .name;

                button.disabled =
                    false;

                button.dataset.answer =
                    selectedOptions[index]
                        .name;

            }
            else {

                button.style.display =
                    "none";

            }

        }
    );

}


/* --------------------------------
   CHECK ANSWER
-------------------------------- */

function checkAnswer(event) {

    if (!gameRunning) {

        return;

    }


    const selectedAnswer =
        event.target.dataset.answer;


    totalQuestions++;


    if (
        selectedAnswer ===
        currentObject.name
    ) {

        score++;

        scoreDisplay.textContent =
            score;

    }
    else {

        mistakes++;

        mistakesDisplay.textContent =
            mistakes;

    }


    updateAccuracy();


    /* Disable options */

    optionButtons.forEach(
        button => {

            button.disabled = true;

        }
    );


    /* Next round */

    setTimeout(() => {

        if (!gameRunning) {

            return;

        }


        if (
            currentRound >=
            totalRounds
        ) {

            finishGame();

        }
        else {

            generateQuestion();

        }

    }, 500);

}


/* --------------------------------
   ACCURACY
-------------------------------- */

function updateAccuracy() {

    if (totalQuestions === 0) {

        accuracyDisplay.textContent =
            "0%";

        return;

    }


    const accuracy =
        Math.round(
            (score / totalQuestions) * 100
        );


    accuracyDisplay.textContent =
        accuracy + "%";

}


/* --------------------------------
   TIMER
-------------------------------- */

setInterval(() => {

    if (
        !gameRunning ||
        !startTime
    ) {

        return;

    }


    timeTaken =
        Math.floor(
            (Date.now() - startTime) /
            1000
        );


    timerDisplay.textContent =
        timeTaken;

}, 1000);


/* --------------------------------
   FINISH GAME
-------------------------------- */

function finishGame() {

    gameRunning = false;


    timeTaken =
        Math.floor(
            (Date.now() - startTime) /
            1000
        );


    const accuracy =
        totalQuestions === 0
            ? 0
            : Math.round(
                (score /
                totalQuestions) *
                100
            );


    /* Performance Data */

    const performanceData = {

        player_id: "P001",

        game_name:
            "object_recognition",

        difficulty:
            currentDifficulty,

        score:
            score,

        total_questions:
            totalQuestions,

        correct_answers:
            score,

        mistakes:
            mistakes,

        accuracy:
            accuracy,

        time_taken:
            timeTaken

    };


    console.log(
        "Object Recognition Performance Data:"
    );


    console.log(
        performanceData
    );


    /* Final Screen */

    objectDisplay.textContent =
        "🎉 Game Completed!";


    roundDisplay.textContent =
        "Completed 10 / 10";


    optionButtons.forEach(
        button => {

            button.disabled = true;

        }
    );


    alert(

        "Object Recognition Completed! 🎉\n\n" +

        "Rounds: " +
        totalQuestions +

        "\nScore: " +
        score +

        "\nMistakes: " +
        mistakes +

        "\nAccuracy: " +
        accuracy +

        "%\nTime: " +
        timeTaken +

        " seconds"

    );

}


/* --------------------------------
   OPTION BUTTON EVENTS
-------------------------------- */

optionButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            checkAnswer
        );

    }
);


/* --------------------------------
   START / RESTART
-------------------------------- */

startBtn.addEventListener(
    "click",
    startGame
);


restartBtn.addEventListener(
    "click",
    startGame
);


/* --------------------------------
   DIFFICULTY CHANGE
-------------------------------- */

difficultySelect.addEventListener(
    "change",
    function() {

        if (gameRunning) {

            startGame();

        }

    }
);