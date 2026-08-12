const COLORS = ["red", "green", "yellow", "blue"];

let currentPlayer = 0;
let diceValue = 0;
let rolling = false;
let gameOver = false;

/*
    Main 52-cell Ludo track.

    Coordinates are represented as:
    [row, column]

    Board is 15 x 15.
*/

const TRACK = [

    [6,1],[6,2],[6,3],[6,4],[6,5],

    [5,6],[4,6],[3,6],[2,6],[1,6],

    [0,6],[0,7],[0,8],

    [1,8],[2,8],[3,8],[4,8],[5,8],

    [6,9],[6,10],[6,11],[6,12],[6,13],

    [7,13],[8,13],

    [8,12],[8,11],[8,10],[8,9],

    [9,8],[10,8],[11,8],[12,8],[13,8],

    [14,8],[14,7],[14,6],

    [13,6],[12,6],[11,6],[10,6],[9,6],

    [8,5],[8,4],[8,3],[8,2],[8,1],

    [8,0],[7,0],[6,0]
];

/*
    Starting position of every player
*/

const START = {
    red: 0,
    green: 13,
    yellow: 26,
    blue: 39
};

/*
    Safe positions
*/

const SAFE = [
    0,
    8,
    13,
    21,
    26,
    34,
    39,
    47
];

/*
    Home lanes.

    Each player gets 6 finishing cells.
*/

const HOME_PATH = {

    red: [
        [7,1],
        [7,2],
        [7,3],
        [7,4],
        [7,5],
        [7,6]
    ],

    green: [
        [1,7],
        [2,7],
        [3,7],
        [4,7],
        [5,7],
        [6,7]
    ],

    yellow: [
        [7,13],
        [7,12],
        [7,11],
        [7,10],
        [7,9],
        [7,8]
    ],

    blue: [
        [13,7],
        [12,7],
        [11,7],
        [10,7],
        [9,7],
        [8,7]
    ]
};

/*
    Token state.

    -1 = yard
     0..51 = main track
    52..57 = home lane
    57 = finished
*/

const players = {

    red: {
        tokens: [-1,-1,-1,-1]
    },

    green: {
        tokens: [-1,-1,-1,-1]
    },

    yellow: {
        tokens: [-1,-1,-1,-1]
    },

    blue: {
        tokens: [-1,-1,-1,-1]
    }

};

/*
    Yard positions.

    These correspond to the four circles
    inside each colored home.
*/

const YARD = {

    red: [
        [1,1],
        [1,4],
        [4,1],
        [4,4]
    ],

    green: [
        [1,10],
        [1,13],
        [4,10],
        [4,13]
    ],

    yellow: [
        [10,10],
        [10,13],
        [13,10],
        [13,13]
    ],

    blue: [
        [10,1],
        [10,4],
        [13,1],
        [13,4]
    ]

};

const board = document.getElementById("board");
const dice = document.getElementById("dice");
const rollBtn = document.getElementById("rollBtn");
const message = document.getElementById("message");
const turnName = document.getElementById("turnName");

const winnerModal =
    document.getElementById("winnerModal");

const winnerTitle =
    document.getElementById("winnerTitle");

const playAgain =
    document.getElementById("playAgain");

const newGame =
    document.getElementById("newGame");

/* ----------------------------------
   CREATE BOARD
----------------------------------- */

function createBoard() {

    /*
        Create all 225 cells.
    */

    for (let r = 0; r < 15; r++) {

        for (let c = 0; c < 15; c++) {

            const cell =
                document.createElement("div");

            cell.className = "cell";

            cell.dataset.row = r;
            cell.dataset.col = c;

            /*
                Only show actual playing path.
            */

            const trackIndex =
                TRACK.findIndex(
                    p => p[0] === r && p[1] === c
                );

            if (trackIndex !== -1) {

                cell.dataset.track = trackIndex;

                if (SAFE.includes(trackIndex)) {
                    cell.classList.add("safe");
                }

                /*
                    Color starting cells.
                */

                if (trackIndex === 0)
                    cell.classList.add("red");

                if (trackIndex === 13)
                    cell.classList.add("green");

                if (trackIndex === 26)
                    cell.classList.add("yellow");

                if (trackIndex === 39)
                    cell.classList.add("blue");
            }

            /*
                Home lanes
            */

            for (const color of COLORS) {

                const path =
                    HOME_PATH[color];

                if (
                    path.some(
                        p => p[0] === r && p[1] === c
                    )
                ) {

                    cell.classList.add(color);
                }
            }

            board.appendChild(cell);
        }
    }

    createTokens();
}

/* ----------------------------------
   CREATE TOKENS
----------------------------------- */

function createTokens() {

    COLORS.forEach(color => {

        for (let i = 0; i < 4; i++) {

            const token =
                document.createElement("div");

            token.className =
                `token ${color}`;

            token.dataset.color = color;
            token.dataset.index = i;

            token.addEventListener(
                "click",
                () => tokenClicked(color,i)
            );

            board.appendChild(token);
        }
    });

    renderTokens();
}

/* ----------------------------------
   FIND CELL
----------------------------------- */

function getCell(row,col) {

    return document.querySelector(
        `.cell[data-row="${row}"][data-col="${col}"]`
    );
}

/* ----------------------------------
   TOKEN POSITION
----------------------------------- */

function getTokenPosition(color,index) {

    const state =
        players[color].tokens[index];

    /*
        Token is inside yard.
    */

    if (state === -1) {

        const pos =
            YARD[color][index];

        return {
            row: pos[0],
            col: pos[1]
        };
    }

    /*
        Token is on main track.
    */

    if (state < 52) {

        const start =
            START[color];

        const absolute =
            (start + state) % 52;

        const pos =
            TRACK[absolute];

        return {
            row: pos[0],
            col: pos[1]
        };
    }

    /*
        Token is in home lane.
    */

    const homeIndex =
        state - 52;

    if (homeIndex >= 0 && homeIndex < 6) {

        const pos =
            HOME_PATH[color][homeIndex];

        return {
            row: pos[0],
            col: pos[1]
        };
    }

    /*
        Finished token.
    */

    return null;
}

/* ----------------------------------
   RENDER
----------------------------------- */

function renderTokens() {

    COLORS.forEach(color => {

        for (let i = 0; i < 4; i++) {

            const token =
                document.querySelector(
                    `.token[data-color="${color}"][data-index="${i}"]`
                );

            const pos =
                getTokenPosition(color,i);

            if (!pos) {

                token.style.display = "none";
                continue;
            }

            token.style.display = "block";

            token.style.left =
                `${(pos.col / 15) * 100 + 1.4}%`;

            token.style.top =
                `${(pos.row / 15) * 100 + 1.4}%`;

            /*
                If multiple tokens are on same cell,
                slightly offset them.
            */

            const stackOffset =
                getStackOffset(color,i);

            token.style.transform =
                `translate(${stackOffset.x}px,${stackOffset.y}px)`;
        }
    });

    updateScores();
}

/* ----------------------------------
   STACK OFFSET
----------------------------------- */

function getStackOffset(color,index) {

    const pos =
        getTokenPosition(color,index);

    if (!pos)
        return {x:0,y:0};

    let same = [];

    COLORS.forEach(c => {

        for (let i=0;i<4;i++) {

            if (c === color && i === index)
                continue;

            const p =
                getTokenPosition(c,i);

            if (
                p &&
                p.row === pos.row &&
                p.col === pos.col
            ) {
                same.push([c,i]);
            }
        }
    });

    const n = same.length;

    if (n === 0)
        return {x:0,y:0};

    const offsets = [
        [-6,-6],
        [6,-6],
        [-6,6],
        [6,6]
    ];

    return offsets[n % offsets.length];
}

/* ----------------------------------
   VALID MOVES
----------------------------------- */

function getValidMoves(color, dice) {

    const moves = [];

    players[color].tokens.forEach(
        (state,index) => {

            /*
                Yard token requires 6.
            */

            if (state === -1) {

                if (dice === 6)
                    moves.push(index);

                return;
            }

            /*
                Already finished.
            */

            if (state === 57)
                return;

            /*
                Cannot exceed finish.
            */

            if (state + dice <= 57) {

                moves.push(index);
            }
        }
    );

    return moves;
}

/* ----------------------------------
   ROLL DICE
----------------------------------- */

rollBtn.addEventListener(
    "click",
    rollDice
);

function rollDice() {

    if (rolling || gameOver)
        return;

    rolling = true;

    rollBtn.disabled = true;

    dice.classList.add("rolling");

    let count = 0;

    const animation =
        setInterval(() => {

            dice.textContent =
                Math.floor(Math.random()*6)+1;

            count++;

            if (count >= 9) {

                clearInterval(animation);

                diceValue =
                    Math.floor(Math.random()*6)+1;

                dice.textContent =
                    diceValue;

                dice.classList.remove("rolling");

                rolling = false;

                processRoll();
            }

        },60);
}

/* ----------------------------------
   PROCESS ROLL
----------------------------------- */

function processRoll() {

    const color =
        COLORS[currentPlayer];

    const validMoves =
        getValidMoves(color,diceValue);

    /*
        No valid move.
    */

    if (validMoves.length === 0) {

        message.textContent =
            `${color.toUpperCase()} cannot move.`;

        setTimeout(() => {

            if (diceValue === 6) {

                message.textContent =
                    `${color.toUpperCase()} gets another turn.`;

                rollBtn.disabled = false;

            } else {

                nextTurn();
            }

        },800);

        return;
    }

    /*
        Highlight valid tokens.
    */

    clearMovable();

    validMoves.forEach(index => {

        const token =
            document.querySelector(
                `.token[data-color="${color}"][data-index="${index}"]`
            );

        token.classList.add("movable");
    });

    /*
        Automatic move if only one token.
    */

    if (validMoves.length === 1) {

        setTimeout(() => {

            moveToken(
                color,
                validMoves[0]
            );

        },350);

        return;
    }

    message.textContent =
        `${color.toUpperCase()} — choose a token`;
}

/* ----------------------------------
   TOKEN CLICK
----------------------------------- */

function tokenClicked(color,index) {

    if (gameOver)
        return;

    if (
        color !== COLORS[currentPlayer]
    )
        return;

    const valid =
        getValidMoves(color,diceValue);

    if (!valid.includes(index))
        return;

    moveToken(color,index);
}

/* ----------------------------------
   MOVE TOKEN
----------------------------------- */

function moveToken(color,index) {

    clearMovable();

    const oldState =
        players[color].tokens[index];

    let newState;

    /*
        Token coming out of yard.
    */

    if (oldState === -1) {

        newState = 0;

    } else {

        newState =
            oldState + diceValue;
    }

    /*
        Animate step-by-step.
    */

    animateMovement(
        color,
        index,
        oldState,
        newState
    );
}

/* ----------------------------------
   ANIMATE
----------------------------------- */

function animateMovement(
    color,
    index,
    from,
    to
) {

    let current = from;

    /*
        Yard -> starting position.
    */

    if (current === -1) {

        players[color].tokens[index] = 0;

        renderTokens();

        setTimeout(() => {

            finishMove(color,index);

        },180);

        return;
    }

    const interval =
        setInterval(() => {

            current++;

            players[color].tokens[index] =
                current;

            renderTokens();

            if (current >= to) {

                clearInterval(interval);

                setTimeout(() => {

                    finishMove(
                        color,
                        index
                    );

                },150);
            }

        },120);
}

/* ----------------------------------
   FINISH MOVE
----------------------------------- */

function finishMove(color,index) {

    const state =
        players[color].tokens[index];

    /*
        Finished.
    */

    if (state === 57) {

        message.textContent =
            `${color.toUpperCase()} token reached HOME!`;

        checkWinner(color);

        if (gameOver)
            return;

        extraTurn();
        return;
    }

    /*
        Check capture.
    */

    const captured =
        captureOpponents(
            color,
            index
        );

    /*
        Check if all tokens home.
    */

    if (checkWinner(color))
        return;

    /*
        Six = extra turn
    */

    if (diceValue === 6) {

        extraTurn();
        return;
    }

    /*
        Capture = extra turn
    */

    if (captured) {

        message.textContent =
            `${color.toUpperCase()} captured a token!`;

        extraTurn();
        return;
    }

    /*
        Normal turn.
    */

    nextTurn();
}

/* ----------------------------------
   CAPTURE
----------------------------------- */

function captureOpponents(color,index) {

    const state =
        players[color].tokens[index];

    /*
        Cannot capture from home lane.
    */

    if (state >= 52)
        return false;

    const absolute =
        (
            START[color] + state
        ) % 52;

    /*
        Safe cells cannot be captured.
    */

    if (SAFE.includes(absolute))
        return false;

    let captured = false;

    COLORS.forEach(opponent => {

        if (opponent === color)
            return;

        players[opponent].tokens.forEach(
            (oppState,oppIndex) => {

                if (
                    oppState >= 0 &&
                    oppState < 52
                ) {

                    const oppAbsolute =
                        (
                            START[opponent] +
                            oppState
                        ) % 52;

                    if (
                        oppAbsolute === absolute
                    ) {

                        /*
                            Send opponent home.
                        */

                        players[opponent]
                            .tokens[oppIndex] = -1;

                        captured = true;
                    }
                }
            }
        );
    });

    renderTokens();

    return captured;
}

/* ----------------------------------
   EXTRA TURN
----------------------------------- */

function extraTurn() {

    const color =
        COLORS[currentPlayer];

    message.textContent =
        `${color.toUpperCase()} gets another turn!`;

    rollBtn.disabled = false;
}

/* ----------------------------------
   NEXT TURN
----------------------------------- */

function nextTurn() {

    currentPlayer++;

    if (
        currentPlayer >= COLORS.length
    ) {
        currentPlayer = 0;
    }

    updateTurn();

    rollBtn.disabled = false;
}

/* ----------------------------------
   UPDATE TURN
----------------------------------- */

function updateTurn() {

    const color =
        COLORS[currentPlayer];

    turnName.textContent =
        color.toUpperCase();

    document
        .querySelectorAll(".player")
        .forEach(p =>
            p.classList.remove("active")
        );

    const active =
        document.getElementById(
            `player-${color}`
        );

    if (active)
        active.classList.add("active");

    message.textContent =
        `${color.toUpperCase()}'s turn — Roll the dice`;

    clearMovable();
}

/* ----------------------------------
   CLEAR MOVABLE
----------------------------------- */

function clearMovable() {

    document
        .querySelectorAll(".token")
        .forEach(token =>
            token.classList.remove("movable")
        );
}

/* ----------------------------------
   WINNER
----------------------------------- */

function checkWinner(color) {

    const finished =
        players[color].tokens
            .filter(x => x === 57)
            .length;

    if (finished !== 4)
        return false;

    gameOver = true;

    winnerTitle.textContent =
        `${color.toUpperCase()} WINS!`;

    winnerModal.classList.remove("hidden");

    rollBtn.disabled = true;

    return true;
}

/* ----------------------------------
   SCORES
----------------------------------- */

function updateScores() {

    COLORS.forEach(color => {

        const finished =
            players[color].tokens
                .filter(x => x === 57)
                .length;

        const score =
            document.getElementById(
                `score-${color}`
            );

        if (score)
            score.textContent =
                `${finished}/4`;
    });
}

/* ----------------------------------
   NEW GAME
----------------------------------- */

function resetGame() {

    COLORS.forEach(color => {

        players[color].tokens =
            [-1,-1,-1,-1];
    });

    currentPlayer = 0;

    diceValue = 0;

    gameOver = false;

    rolling = false;

    dice.textContent = "6";

    winnerModal.classList.add("hidden");

    rollBtn.disabled = false;

    renderTokens();

    updateTurn();
}

newGame.addEventListener(
    "click",
    resetGame
);

playAgain.addEventListener(
    "click",
    resetGame
);

/* ----------------------------------
   START
----------------------------------- */

createBoard();

updateTurn();
