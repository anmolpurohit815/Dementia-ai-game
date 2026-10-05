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

const sequenceDisplay =
    document.getElementById("sequenceDisplay");

const sequenceInput =
    document.getElementById("sequenceInput");

const submitBtn =
    document.getElementById("submitBtn");

const startBtn =
    document.getElementById("startBtn");

const restartBtn =
    document.getElementById("restartBtn");


/* --------------------------------
   DIFFICULTY SETTINGS
-------------------------------- */

const difficultySettings = {

    easy: {
        length: 3,
        showTime: 3000
    },

    medium: {
        length: 5,
        showTime: 4000
    },

    hard: {
        length: 7,
        showTime: 5000
    }

};


/* --------------------------------
   GAME VARIABLES
-------------------------------- */

let currentDifficulty = "easy";

let currentSequence = [];

let score = 0;

let mistakes = 0;

let totalQuestions = 0;

let timeTaken = 0;

let startTime = null;

let gameRunning = false;

let currentRound = 0;

const totalRounds = 10;


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

    sequenceInput.value = "";

    sequenceInput.disabled = true;

    submitBtn.disabled = true;

    sequenceDisplay.textContent =
        "Get Ready...";

    setTimeout(() => {

        if (gameRunning) {
            generateSequence();
        }

    }, 1000);
}


/* --------------------------------
   GENERATE SEQUENCE
-------------------------------- */

function generateSequence() {

    if (!gameRunning) {
        return;
    }

    if (currentRound >= totalRounds) {

        finishGame();

        return;
    }

    currentRound++;

    const settings =
        difficultySettings[currentDifficulty];

    currentSequence = [];

    for (
        let i = 0;
        i < settings.length;
        i++
    ) {

        const number =
            Math.floor(Math.random() * 9) + 1;

        currentSequence.push(number);
    }

    sequenceDisplay.textContent =
        currentSequence.join(" → ");

    sequenceInput.value = "";

    sequenceInput.disabled = true;

    submitBtn.disabled = true;

    setTimeout(() => {

        if (!gameRunning) {
            return;
        }

        sequenceDisplay.textContent =
            "???";

        sequenceInput.disabled = false;

        submitBtn.disabled = false;

        sequenceInput.focus();

    }, settings.showTime);
}


/* --------------------------------
   CHECK ANSWER
-------------------------------- */

function checkAnswer() {

    if (!gameRunning) {
        return;
    }

    const userInput =
        sequenceInput.value.trim();

    if (userInput === "") {

        alert(
            "Please enter the sequence."
        );

        return;
    }

    const userSequence =
        userInput
            .split(/[\s,]+/)
            .map(Number);

    totalQuestions++;

    const isCorrect =
        userSequence.length ===
            currentSequence.length &&

        userSequence.every(
            (value, index) =>
                value === currentSequence[index]
        );

    if (isCorrect) {

        score++;

        scoreDisplay.textContent =
            score;

    } else {

        mistakes++;

        mistakesDisplay.textContent =
            mistakes;
    }

    updateAccuracy();

    sequenceInput.value = "";

    sequenceInput.disabled = true;

    submitBtn.disabled = true;

    /* Next round */

    setTimeout(() => {

        if (gameRunning) {

            if (currentRound >= totalRounds) {

                finishGame();

            } else {

                generateSequence();

            }

        }

    }, 800);
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

    if (!gameRunning || !startTime) {
        return;
    }

    timeTaken =
        Math.floor(
            (Date.now() - startTime) / 1000
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
            (Date.now() - startTime) / 1000
        );

    const accuracy =
        totalQuestions === 0
            ? 0
            : Math.round(
                (score / totalQuestions) * 100
            );


    /* Performance Data */

    const performanceData = {

        player_id: "P001",

        game_name: "sequence",

        difficulty:
            currentDifficulty,

        score: score,

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
        "Sequence Performance Data:"
    );

    console.log(
        performanceData
    );


    /* Final Result */

    sequenceDisplay.textContent =
        "Game Completed! 🎉";

    sequenceInput.disabled = true;

    submitBtn.disabled = true;


    alert(

        "Sequence Memory Completed! 🎉\n\n" +

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
   BUTTONS
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
   SUBMIT BUTTON
-------------------------------- */

submitBtn.addEventListener(
    "click",
    checkAnswer
);


/* --------------------------------
   ENTER KEY
-------------------------------- */

sequenceInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            checkAnswer();

        }

    }
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