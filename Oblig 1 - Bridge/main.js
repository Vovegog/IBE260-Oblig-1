"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname)));
app.use(function (inRequest, inResponse, inNext) {
    inResponse.header('Access-Control-Allow-Origin', '*');
    inResponse.header('Access-Control-Allow-Methods', 'GET,POST');
    inResponse.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    inNext();
});
function errorHandler(err) {
    console.error(err);
}
// Boolean to check if the game is running
let gameRunning = false;
// Create an array holding the 4 players with their hands
let players = [
    ['Trond', []],
    ['Kari', []],
    ['Per', []],
    ['Kai Åge', []]
];
// Make player 1 and 3 a team, and player 2 and 4 a team
let team1 = [players[0][0], players[2][0]];
let team2 = [players[1][0], players[3][0]];
// Initiate variable "deck"
let deck = [];
// Create a deck and shuffle it
function createDeck() {
    try {
        deck = [];
        let suits = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
        let ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
        for (let suit of suits) {
            for (let rank of ranks) {
                deck.push(`${rank} of ${suit}`);
            }
        }
        // console.log(deck); // Debugging
        // Shuffle the deck
        for (let i = deck.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        // console.log(deck); // Debugging
        // Assign the cards to the players
        for (let i = 0; i < deck.length; i++) {
            players[i % 4][1].push(deck[i]);
        }
        console.log(players);
    }
    catch (error) {
        errorHandler(error);
    }
}
// RESTful POST to start the game
app.post('/start', (req, res) => {
    try {
        if (gameRunning) {
            res.status(400).send('Game already running');
        }
        else {
            gameRunning = true;
            createDeck();
            res.status(200).send('Game started');
        }
    }
    catch (error) {
        errorHandler(error);
    }
});
// RESTful POST to restart the game
app.post('/restart', (req, res) => {
    try {
        players = [
            ['Trond', []],
            ['Kari', []],
            ['Per', []],
            ['Kai Åge', []]
        ];
        createDeck();
        res.status(200).send('Game restarted');
    }
    catch (error) {
        errorHandler(error);
    }
});
// RESTful GET to get the players and their hands
app.get('/players', (req, res) => {
    try {
        if (gameRunning) {
            res.status(200).json(players);
        }
        else {
            res.status(400).send('Game not running');
        }
    }
    catch (error) {
        errorHandler(error);
    }
});
// Let the players check the teams
app.get('/teams', (req, res) => {
    try {
        if (gameRunning) {
            res.status(200).json([team1, team2]);
        }
        else {
            res.status(400).send('Game not running');
        }
    }
    catch (error) {
        errorHandler(error);
    }
});
app.listen(8080, () => {
    console.log('Server started. Fuck you.');
});
