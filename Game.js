const colors = ["red", "green", "yellow", "blue"];

let currentPlayer = 0;
let diceValue = 6;
let gameStarted = false;
let soundEnabled = true;

const scores = {
    red: 0,
    green: 0,
    yellow: 0,
    blue: 0
};

const rollBtn = document.getElementById("rollBtn");
const dice = document.getElementById("dice");
const diceNumber = document.getElementById("diceNumber");
const message = document.getElementById("message");
const turnText = document.getElementById("turnText");

const winnerModal = document.getElementById("winnerModal");
const winnerText = document.getElementById("winnerText");

const soundBtn = document.getElementById("soundBtn");

function rollDice() {

    if (dice.classList.contains("rolling")) {
        return;
    }

    dice.classList.add("rolling");
    rollBtn.disabled = true;

    let counter = 0;

    const animation = setInterval(() => {

        diceNumber.textContent =
            Math.floor(Math.random() * 6) + 1;

        counter++;

        if (counter >= 8) {

            clearInterval(animation);

            diceValue =
                Math.floor(Math.random() * 6) + 1;

            diceNumber.textContent = diceValue;

            dice.classList.remove("rolling");

            rollBtn.disabled = false;

            handleDiceResult();
        }

    }, 70);
}

function handleDiceResult() {

    const color = colors[currentPlayer];

    message.textContent =
        `${color.toUpperCase()} rolled ${diceValue}`;

    if (diceValue === 6) {

        message.textContent =
            `${color.toUpperCase()} got a 6! Roll again or move a token.`;

        activateTokens(color);

        return;
    }

    moveRandomToken(color);

    setTimeout(() => {

        currentPlayer++;

        if (currentPlayer >= colors.length) {
            currentPlayer = 0;
        }

        updateTurn();

    }, 700);
}

function activateTokens(color) {

    const tokens =
        document.querySelectorAll(`.${color}-token`);

    tokens.forEach(token => {

        token.classList.add("selectable");

        token.onclick = () => {

            moveToken(token, color);

            tokens.forEach(t =>
                t.classList.remove("selectable")
            );

            tokens.forEach(t =>
                t.onclick = null
            );

            setTimeout(() => {
                updateTurn();
            }, 700);
        };
    });
}

function moveRandomToken(color) {

    const tokens =
        Array.from(
            document.querySelectorAll(`.${color}-token`)
        );

    const token =
        tokens[Math.floor(Math.random() * tokens.length)];

    moveToken(token, color);
}

function moveToken(token, color) {

    token.style.transform =
        "translateY(-10px) scale(1.2)";

    setTimeout(() => {

        token.style.transform =
            "translateY(0) scale(1)";

        scores[color]++;

        updateScore(color);

        checkWinner(color);

    }, 350);
}

function updateScore(color) {

    const scoreElement =
        document.getElementById(`${color}Score`);

    scoreElement.textContent =
        scores[color];
}

function updateTurn() {

    const color = colors[currentPlayer];

    turnText.textContent =
        color.toUpperCase();

    message.textContent =
        `${color.toUpperCase()}'s turn — Roll the dice`;

    document
        .querySelectorAll(".player-card")
        .forEach(card =>
            card.classList.remove("active")
        );

    const playerCard =
        document.getElementById(`${color}Player`);

    if (playerCard) {
        playerCard.classList.add("active");
    }

    rollBtn.disabled = false;
}

function checkWinner(color) {

    if (scores[color] >= 20) {

        winnerText.textContent =
            `${color.toUpperCase()} WINS!`;

        winnerModal.classList.remove("hidden");

        rollBtn.disabled = true;
    }
}

function newGame() {

    currentPlayer = 0;

    Object.keys(scores).forEach(color => {
        scores[color] = 0;
        updateScore(color);
    });

    document
        .querySelectorAll(".token")
        .forEach(token => {

            token.style.transform =
                "translateY(0) scale(1)";

            token.classList.remove("selectable");

            token.onclick = null;
        });

    diceNumber.textContent = "6";

    winnerModal.classList.add("hidden");

    updateTurn();
}

soundBtn.addEventListener("click", () => {

    soundEnabled = !soundEnabled;

    soundBtn.textContent =
        soundEnabled ? "🔊" : "🔇";
});

rollBtn.addEventListener("click", rollDice);

document
    .getElementById("newGameBtn")
    .addEventListener("click", newGame);

document
    .getElementById("playAgain")
    .addEventListener("click", newGame);

updateTurn();
