/* --------------------------------
   MINDCARE HOME PAGE
   GAME NAVIGATION
-------------------------------- */

function openGame(gameName) {

    /* -----------------------------
       MEMORY MATCH
    ----------------------------- */

    if (gameName === "memory") {

        window.location.href =
            "games/memory.html";

    }


    /* -----------------------------
       SEQUENCE MEMORY
    ----------------------------- */

    else if (gameName === "sequence") {

        window.location.href =
            "games/sequence.html";

    }


    /* -----------------------------
       OBJECT RECOGNITION
    ----------------------------- */

    else if (gameName === "object") {

        window.location.href =
            "games/object.html";

    }

}