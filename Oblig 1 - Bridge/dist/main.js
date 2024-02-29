"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.playedCard = void 0;
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
// Create an array holding the 4 players with their hands (of cards)
let players = [];
let team1 = [];
let team2 = [];
// Make player 1 and 3 a team, and player 2 and 4 a team
function createTeams() {
    team1 = [players[0][0], players[2][0]];
    team2 = [players[1][0], players[3][0]];
}
// Create a class for the players to let them name theirselves
class Player {
    constructor(name) {
        this.name = name;
    }
}
// Initiate variable "deck"
let deck = [];
// Declare variables for bidding and who put the bid
let bidding = ["", 0]; // [Suit, Rank] - "any" is used to allow for both string and number as Jack, Queen, King and Ace are strings
let whoBid = '';
// Variable for storing passes in a row. 3 PASSES IN A ROW ENDS THE ROUND!!!
let passes = 0;
// Declare a variable for the round
let round = 1;
// Need to keep track of which players turn it is
let previousTurn = "";
let turn = "";
// Set turn to player 1
function setTurn() {
    turn = players[0][0];
}
exports.playedCard = ["", 0]; // This is the card that is played, we use it to check if it can be played or not. Any, cuz Jack, Queen, King and Ace are strings
function setNextTurn() {
    previousTurn = turn;
    turn = players[(players.findIndex(player => player[0] === turn) + 1) % 4][0];
}
// Create a deck and shuffle it
function createDeck() {
    try {
        deck = []; // Important to reset the deck before creating a new one in case of restart of the game
        let suits = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
        let ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
        for (let suit of suits) {
            for (let rank of ranks) {
                deck.push(`${rank} of ${suit}`);
            }
        }
        // Shuffle the deck. I honestly can't tell you how this works, it's a shuffle algorithm I found online
        for (let i = deck.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        // Assign the cards to the players
        for (let i = 0; i < deck.length; i++) {
            players[i % 4][1].push(deck[i]); // Assigns one card to each player, then loops back to the first player
        } // Could be done with a slice of the deck, but whatever. It works and it's not a lot of code
    }
    catch (error) {
        errorHandler(error);
    }
}
function isPlayedCardInHand(player, bid) {
    let found = false;
    let cardToSearchFor = bid[1] + " of " + bid[0];
    const currentPlayer = players.find(player => player[0] === turn);
    if (currentPlayer && currentPlayer[1].includes(cardToSearchFor)) {
        found = true;
    }
    return found;
}
// RESTful post to add a player
app.post('/addplayer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (gameRunning) {
            res.status(400).json({ message: 'Game already running' });
        }
        else if (players.length < 4) {
            let player = new Player(req.body.name);
            players.push([player.name, []]);
            res.status(200).json({ message: `${player.name} added to the game` });
        }
        else {
            res.status(400).json({ message: 'Game already has 4 players' });
        }
    }
    catch (error) {
        errorHandler(error);
    }
}));
// RESTful POST to start the game
app.post('/start', (req, res) => {
    try {
        if (gameRunning) {
            res.status(400).json({ message: 'Game already running' });
        }
        else if (players.length == 4) {
            gameRunning = true;
            createDeck();
            createTeams();
            setTurn();
            /* Res.status sends out the message to display in the client, whose turn it is
            and the players hands to be displayed in the client, when we get to that in assignment 2 */
            res.status(200).json({ message: `Game started. It is now ${turn}'s turn to bid`, turn: turn, players: players });
            // console.log(`It is now ${turn}'s turn to bid`); // Debugging
        }
        else {
            res.status(400).json({ message: 'Game needs 4 players to start' });
        }
    }
    catch (error) {
        errorHandler(error);
    }
});
// RESTful POST to restart the game
app.post('/restart', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (gameRunning) {
            gameRunning = false;
            players = [];
            team1 = [];
            team2 = [];
            deck = [];
            bidding = ["", 0];
            whoBid = '';
            passes = 0;
            round = 1;
            res.status(200).json({ message: 'Game restarted. Start adding new players to start a new game' });
        }
        else {
            res.status(400).json({ message: 'Game not running' });
        }
    }
    catch (error) {
        errorHandler(error);
    }
}));
// RESTful GET to get the players and their hands. Mostly for debugging purposes, but could be used for the players to see their hands
app.get('/players', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (gameRunning) {
            res.status(200).json({ message: `Game is running. It is currently ${turn}'s turn to bid`, players: players });
            // console.log(`It is currently ${turn}'s turn to bid`); // Debugging
        }
        else {
            res.status(400).json({ message: 'Game not running. Players waiting to start game are ' + players.map(player => player[0]).join(', ') });
        }
    }
    catch (error) {
        errorHandler(error);
    }
}));
// Let the players check the teams
app.get('/teams', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (gameRunning) {
            res.status(200).json([team1, team2]);
        }
        else {
            res.status(400).json({ message: 'Game not running' });
        }
    }
    catch (error) {
        errorHandler(error);
    }
}));
// RESTful POST to play a card
app.post('/bid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if game is running
        if (!gameRunning) {
            res.status(400).json({ message: 'Game not running' });
        }
        // Check if it's the players turn
        if (req.body.player !== turn) {
            res.status(400).json({ message: `It is not your turn to bid. It is ${turn}'s turn to bid`, turn: turn });
        }
        else if (req.body.bid[0].toUpperCase() === "PASS") { // If player bids "pass"
            passes++;
            if (passes === 3) { // Check passes. If passes in a row is 3, the round is over
                round++; // Increase to round 2 and reset variables
                passes = 0;
                bidding = ["", 0];
                whoBid = '';
                setTurn();
                res.status(200).json({ message: `Round ${round - 1} is over. It is now ${turn}'s turn to bid`, turn: turn, round: round });
            }
            setNextTurn();
            res.status(200).json({ message: `${previousTurn} passed. It is now ${turn}'s turn to bid`, turn: turn });
        }
        else if (req.body.bid[1] < 1 && !("Jack" || "Queen" || "King" || "Ace")) { // If player bids a 0 or less than 0 (which is impossible), or a card that is not a Jack, Queen, King or Ace (since they don't have a numeric value)
            res.status(400).json(`You cannot bid 0, less than 0 or something that doesn't exist, ${turn}`);
        }
        else if (isPlayedCardInHand(req.body.player, req.body.bid) === false) { // If bid card is not in players hand, we return an error
            res.status(400).json(`You cannot bid a card you don't have, ${turn}`);
        }
        else {
            // We now assume the played bids are valid
            /* REMEMBER TO ADD "BRIDGERULES" FUNCTION TO CHECK IF THE BID IS VALID <----------- THIS IS DONE HERE */
            /* if bid is valid, set the bid and whoBid */
            bidding = req.body.bid;
            whoBid = turn;
            passes = 0;
            setNextTurn();
            res.status(200).json({ message: `The current bid is ${bidding[1]} of ${bidding[0]} by ${whoBid}. It is now ${turn}'s turn to bid`, turn: turn, bidding: bidding, whoBid: whoBid });
        }
    }
    catch (error) {
        errorHandler(error);
    }
}));
app.listen(80, () => {
    console.log('Server started. Fuck you.');
});
/* I MAY want to change all the console.log()'s over to res.status().send's instead?
Not sure what the difference is tbh. Will have to look it up */ 
