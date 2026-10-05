const gameBoard = document.getElementById("gameBoard");

const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const mistakesDisplay = document.getElementById("mistakes");
const accuracyDisplay = document.getElementById("accuracy");

const restartBtn = document.getElementById("restartBtn");


/* -----------------------------
   GAME DATA
----------------------------- */

const symbols = [
    "🍎", "🍎",
    "🍌", "🍌",
    "🍊", "🍊",
    "🍇", "🍇"
];


let cards = [];

let firstCard = null;
let secondCard = null;

let lockBoard = false;

let score = 0;
let mistakes = 0;
let totalAttempts = 0;

let timeLeft = 60;

let timer;

let startTime;


/* -----------------------------
   SHUFFLE CARDS
----------------------------- */

function shuffle(array) {

    return array.sort(() => Math.random() - 0.5);

}


/* -----------------------------
   START GAME
----------------------------- */

function startGame() {

    gameBoard.innerHTML = "";

    score = 0;
    mistakes = 0;
    totalAttempts = 0;

    timeLeft = 60;

    firstCard = null;
    secondCard = null;

    lockBoard = false;

    startTime = Date.now();


    /* Reset display */

    scoreDisplay.textContent = score;

    mistakesDisplay.textContent = mistakes;

    accuracyDisplay.textContent = "0%";

    timerDisplay.textContent = timeLeft;


    /* Shuffle cards */

    cards = shuffle([...symbols]);


    /* Create cards */

    cards.forEach((symbol) => {

        const card = document.createElement("div");

        card.classList.add("card");

        card.dataset.symbol = symbol;

        card.textContent = "?";

        card.addEventListener("click", flipCard);

        gameBoard.appendChild(card);

    });


    /* Start timer */

    clearInterval(timer);

    timer = setInterval(() => {

        timeLeft--;

        timerDisplay.textContent = timeLeft;


        if (timeLeft <= 0) {

            clearInterval(timer);

            finishGame("Time Over!");

        }

    }, 1000);

}


/* -----------------------------
   FLIP CARD
----------------------------- */

function flipCard() {

    if (lockBoard) {
        return;
    }

    if (this === firstCard) {
        return;
    }

    if (this.classList.contains("matched")) {
        return;
    }


    this.textContent = this.dataset.symbol;

    this.classList.add("flipped");


    /* First card */

    if (!firstCard) {

        firstCard = this;

        return;

    }


    /* Second card */

    secondCard = this;

    totalAttempts++;

    checkMatch();

}


/* -----------------------------
   CHECK MATCH
----------------------------- */

function checkMatch() {

    const isMatch =
        firstCard.dataset.symbol === secondCard.dataset.symbol;


    if (isMatch) {

        /* Correct pair */

        firstCard.classList.add("matched");

        secondCard.classList.add("matched");

        score++;

        scoreDisplay.textContent = score;

        updateAccuracy();

        resetCards();

        checkWin();

    }

    else {

        /* Wrong pair */

        mistakes++;

        mistakesDisplay.textContent = mistakes;

        updateAccuracy();

        lockBoard = true;


        setTimeout(() => {

            firstCard.textContent = "?";

            secondCard.textContent = "?";

            firstCard.classList.remove("flipped");

            secondCard.classList.remove("flipped");

            resetCards();

        }, 800);

    }

}


/* -----------------------------
   ACCURACY
----------------------------- */

function updateAccuracy() {

    if (totalAttempts === 0) {

        accuracyDisplay.textContent = "0%";

        return;

    }


    const accuracy =
        Math.round((score / totalAttempts) * 100);


    accuracyDisplay.textContent =
        accuracy + "%";

}


/* -----------------------------
   RESET CARDS
----------------------------- */

function resetCards() {

    firstCard = null;

    secondCard = null;

    lockBoard = false;

}


/* -----------------------------
   CHECK WIN
----------------------------- */

function checkWin() {

    const matchedCards =
        document.querySelectorAll(".matched");


    if (matchedCards.length === symbols.length) {

        clearInterval(timer);

        finishGame("Congratulations! You completed the game.");

    }

}


/* -----------------------------
   FINISH GAME
----------------------------- */

function finishGame(message) {

    clearInterval(timer);


    const timeTaken =
        Math.round((Date.now() - startTime) / 1000);


    let accuracy = 0;


    if (totalAttempts > 0) {

        accuracy =
            Math.round((score / totalAttempts) * 100);

    }


    /* Performance data for AI/backend */

    const performanceData = {

        player_id: "P001",

        game_name: "memory",

        score: score,

        total_questions: totalAttempts,

        correct_answers: score,

        mistakes: mistakes,

        accuracy: accuracy,

        time_taken: timeTaken

    };


    console.log("Performance Data:");

    console.log(performanceData);


    alert(
        message +
        "\n\n" +
        "Score: " + score +
        "\n" +
        "Mistakes: " + mistakes +
        "\n" +
        "Accuracy: " + accuracy + "%" +
        "\n" +
        "Time Taken: " + timeTaken + " seconds"
    );

}


/* -----------------------------
   RESTART BUTTON
----------------------------- */

restartBtn.addEventListener(
    "click",
    startGame
);


/* -----------------------------
   START GAME AUTOMATICALLY
----------------------------- */

startGame();