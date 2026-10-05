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

const gameBoard =
    document.getElementById("gameBoard");

const startBtn =
    document.getElementById("startBtn");

const restartBtn =
    document.getElementById("restartBtn");


/* --------------------------------
   CARD DATA
-------------------------------- */

const allSymbols = [
    "🍎",
    "🍌",
    "🍊",
    "🍇",
    "🍉",
    "🍓",
    "🍍",
    "🥝"
];


/* --------------------------------
   DIFFICULTY
-------------------------------- */

const difficultySettings = {

    easy: {
        pairs: 4,
        time: 60
    },

    medium: {
        pairs: 6,
        time: 75
    },

    hard: {
        pairs: 8,
        time: 90
    }

};


/* --------------------------------
   GAME VARIABLES
-------------------------------- */

let currentDifficulty = "easy";

let cards = [];

let firstCard = null;

let secondCard = null;

let lockBoard = false;

let matchedPairs = 0;

let score = 0;

let mistakes = 0;

let totalQuestions = 0;

let timeTaken = 0;

let startTime = null;

let gameRunning = false;

let totalPairs = 4;


/* --------------------------------
   SHUFFLE
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

    const settings =
        difficultySettings[
            currentDifficulty
        ];

    totalPairs =
        settings.pairs;

    cards = [];

    firstCard = null;

    secondCard = null;

    lockBoard = false;

    matchedPairs = 0;

    score = 0;

    mistakes = 0;

    totalQuestions = 0;

    timeTaken = 0;

    gameRunning = true;

    startTime = Date.now();


    scoreDisplay.textContent = "0";

    mistakesDisplay.textContent = "0";

    accuracyDisplay.textContent = "0%";

    timerDisplay.textContent = "0";

    roundDisplay.textContent =
        "Pairs: 0 / " + totalPairs;


    createCards();

}


/* --------------------------------
   CREATE CARDS
-------------------------------- */

function createCards() {

    gameBoard.innerHTML = "";

    const selectedSymbols =
        allSymbols.slice(0, totalPairs);

    cards = [
        ...selectedSymbols,
        ...selectedSymbols
    ];

    shuffle(cards);


    cards.forEach(
        (symbol, index) => {

            const card =
                document.createElement("div");

            card.classList.add(
                "memory-card"
            );

            card.dataset.symbol =
                symbol;

            card.dataset.index =
                index;

            card.textContent = "❓";


            card.addEventListener(
                "click",
                function() {

                    flipCard(card);

                }
            );


            gameBoard.appendChild(card);

        }
    );

}


/* --------------------------------
   FLIP CARD
-------------------------------- */

function flipCard(card) {

    if (!gameRunning) {
        return;
    }

    if (lockBoard) {
        return;
    }

    if (card === firstCard) {
        return;
    }

    if (
        card.classList.contains(
            "matched"
        )
    ) {
        return;
    }


    card.textContent =
        card.dataset.symbol;


    card.classList.add("flipped");


    if (!firstCard) {

        firstCard = card;

        return;

    }


    secondCard = card;

    totalQuestions++;

    checkMatch();

}


/* --------------------------------
   CHECK MATCH
-------------------------------- */

function checkMatch() {

    const isMatch =
        firstCard.dataset.symbol ===
        secondCard.dataset.symbol;


    if (isMatch) {

        score++;

        matchedPairs++;

        firstCard.classList.add(
            "matched"
        );

        secondCard.classList.add(
            "matched"
        );

        scoreDisplay.textContent =
            score;


        resetBoard();


        roundDisplay.textContent =
            "Pairs: " +
            matchedPairs +
            " / " +
            totalPairs;


        if (
            matchedPairs >=
            totalPairs
        ) {

            setTimeout(
                finishGame,
                500
            );

        }

    }

    else {

        mistakes++;

        mistakesDisplay.textContent =
            mistakes;


        updateAccuracy();

        lockBoard = true;


        setTimeout(
            () => {

                firstCard.textContent =
                    "❓";

                secondCard.textContent =
                    "❓";

                firstCard.classList.remove(
                    "flipped"
                );

                secondCard.classList.remove(
                    "flipped"
                );


                resetBoard();

            },
            800
        );

    }

}


/* --------------------------------
   RESET BOARD
-------------------------------- */

function resetBoard() {

    firstCard = null;

    secondCard = null;

    lockBoard = false;

    updateAccuracy();

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
            (score /
            totalQuestions) *
            100
        );


    accuracyDisplay.textContent =
        accuracy + "%";

}


/* --------------------------------
   TIMER
-------------------------------- */

setInterval(
    function() {

        if (
            !gameRunning ||
            !startTime
        ) {

            return;

        }


        timeTaken =
            Math.floor(
                (Date.now() -
                    startTime) /
                1000
            );


        timerDisplay.textContent =
            timeTaken;


        const timeLimit =
            difficultySettings[
                currentDifficulty
            ].time;


        if (
            timeTaken >=
            timeLimit
        ) {

            finishGame();

        }

    },
    1000
);


/* --------------------------------
   FINISH GAME
-------------------------------- */

function finishGame() {

    if (!gameRunning) {
        return;
    }

    gameRunning = false;


    timeTaken =
        Math.floor(
            (Date.now() -
                startTime) /
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


    const performanceData = {

        player_id:
            "P001",

        game_name:
            "memory",

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
        "Memory Match Performance Data:"
    );

    console.log(
        performanceData
    );


    alert(

        "Memory Match Completed! 🎉\n\n" +

        "Pairs Matched: " +
        matchedPairs +
        " / " +
        totalPairs +

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