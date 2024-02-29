import express, { Express, NextFunction, Request, Response } from 'express';
import path from 'path';
import { checkValidBid } from './bridgeRules';

const app: Express = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.use(function(inRequest: Request, inResponse: Response, inNext: NextFunction) {
    inResponse.header('Access-Control-Allow-Origin', '*');
    inResponse.header('Access-Control-Allow-Methods', 'GET,POST');
    inResponse.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    inNext();
});

// Create a class blueprint for the players to let them name theirselves
class Player {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
}

// ----------------- FUNCTIONS ----------------- //
export function errorHandler (err: any) {
    console.error(err);
}

// Make player 1 and 3 a team, and player 2 and 4 a team
function createTeams(){
    team1 = [players[0][0], players[2][0]];
    team2 = [players[1][0], players[3][0]];
}

// Reset turn to player 1
function resetTurn() {
    turn = players[0][0];
}

function setNextTurn() {
    previousTurn = turn;
    turn = players[(players.findIndex(player => player[0] === turn) + 1) % 4][0];
}

function isPlayedCardInHand(player: string, bid: [string, rank]): boolean {
    let found = false;
    let cardToSearchFor = bid[1] + " of " + bid[0];
    const currentPlayer = players.find(player => player[0] === turn);
    if (currentPlayer && currentPlayer[1].includes(cardToSearchFor)) {
        found = true;
    }
    return found;
}

// Create a deck and shuffle it
function createDeck() {
    try {
        let suits: string[] = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
        let ranks: string[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
        for (let suit of suits) {
            for (let rank of ranks) {
                deck.push(`${rank} of ${suit}`);
            }
        }
        // Shuffle the deck. I honestly can't tell you how this works, it's a shuffle algorithm I found online
        for (let i: number = deck.length - 1; i > 0; i--) {
            let j: number = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        // Assign the cards to the players
        for (let i: number = 0; i < deck.length; i++) {
            players[i % 4][1].push(deck[i]); // Assigns one card to each player, then loops back to the first player
        }                                    // Could be done with a slice of the deck, but whatever. It works and it's not a lot of code
    } catch (error) {
        errorHandler(error);
    }
} 
// ----------------- END OF FUNCTIONS ----------------- //

// Create a TypeScript type for the suits and ranks of the cards
export type rank = 0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | "Jack" | "Queen" | "King" | "Ace"; // 0 is default value for start of bidding phase

// ----------------- VARIABLES ----------------- //
// Boolean to check if the game is running
let gameRunning: boolean = false;

// Create an array holding the 4 players with their hands (of cards)
let players: [string, string[]][] = [];

// Create two arrays for the two teams
let team1: string[] = [];
let team2: string[] = [];

// Initiate variable "deck"
let deck: string[] = [];

// Declare variables for bidding and who put the bid
export let bidding: [string, rank] = ["", 0]; // [Suit, Rank]
let whoBid: string = '';

// Variable for storing passes in a row. 3 PASSES IN A ROW ENDS THE ROUND!!!
let passes: number = 0;

// Declare a variable for the round
let round: number = 1;

// Need to keep track of which players turn it is
let previousTurn: string = "";
let turn: string = "";

export let playedCard: [string /* Suit */, rank /* Rank */] = ["", 0]; // This is the card that is played, we use it to check if it can be played or not
// ----------------- END OF VARIABLES ----------------- //

// RESTful post to add a player
app.post('/addplayer', async (req: Request, res: Response) => {
    try {
        if (gameRunning) {
            res.status(400).json({ message: 'Game already running' });
        } else if (players.length < 4) {
            let player = new Player(req.body.name);
            players.push([player.name, []]);
            res.status(200).json({ message: `${player.name} added to the game` });
        } else {
            res.status(400).json({ message: 'Game already has 4 players' });
        }
    } catch (error) {
        errorHandler(error);
    }
});

// RESTful POST to start the game
app.post('/start', (req: Request, res: Response) => {
    try {
        if (gameRunning) {
            res.status(400).json({ message: 'Game already running' });
        } else if (players.length == 4) {
            gameRunning = true;
            createDeck();
            createTeams();
            resetTurn();
            /* Res.status sends out the message to display in the client, whose turn it is
            and the players hands to be displayed in the client, when we get to that in assignment 2 */
            res.status(200).json({ message: `Game started. It is now ${turn}'s turn to bid`, turn: turn, players: players });
        } else {
            res.status(400).json({ message: 'Game needs 4 players to start' });
        }
    } catch (error) {
        errorHandler(error);
    }
});

// RESTful POST to restart the game
app.post('/restart', async (req: Request, res: Response) => {
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
        } else {
            res.status(400).json({ message: 'Game is not running, there\'s nothing to restart.' });
        }
    } catch (error) {
        errorHandler(error);
    }
});

// RESTful GET to get the players and their hands. Mostly for debugging purposes, but could be used for the players to see their hands
app.get('/players', async (req: Request, res: Response) => {
    try {
        if (gameRunning) {
            res.status(200).json({ message: `Game is running. It is currently ${turn}'s turn to bid`, turn: turn, players: players });
        } else {
            res.status(400).json({ message: 'Game is not running. Players waiting to start game are ' + players.map(player => player[0]).join(', ') });
        }
    } catch (error) {
        errorHandler(error);
    }
});

// Let the players check the teams
app.get('/teams', async (req: Request, res: Response) => {
    try {
        if (gameRunning) {
            res.status(200).json([team1, team2]);
        } else {
            res.status(400).json({ message: 'Game not running' });
        }
    } catch (error) {
        errorHandler(error);
    }
});

// RESTful POST to play a card
app.post('/bid', async (req: Request, res: Response) => {
    try {
        // Check if game is running
        if (!gameRunning) {
            res.status(400).json({ message: 'Game not running' });
        }
        // Check if it's the players turn
        if (req.body.player !== turn) {
            res.status(400).json({ message: `It is not your turn to bid. It is ${turn}'s turn to bid`, turn: turn });
        } else if (req.body.bid[0].toUpperCase() === "PASS") { // If player bids "pass"
            passes++;
            if (passes === 3) { // Check passes. If passes in a row is 3, the round is over
                round++;        // Increase to round 2 and reset variables
                passes = 0;
                bidding = ["", 0];
                whoBid = '';
                resetTurn();
                res.status(200).json({ message: `Round ${round-1} is over. It is now ${turn}'s turn to bid`, turn: turn, round: round });
            }
            setNextTurn();
            res.status(200).json({ message: `${previousTurn} passed. It is now ${turn}'s turn to bid`, turn: turn });
        } else if (req.body.bid[1] <= 0 || (req.body.bid[1]) > 7) { // If player bids a 0 or less than 0, or more than 7
            res.status(400).json(`You cannot bid 0, less than 0 or higher than 7, ${turn}`);
        } else if (isPlayedCardInHand(req.body.player, req.body.bid) === false) { // If bid card is not in players hand, we return an error
            res.status(400).json(`You cannot bid a card you don't have, ${turn}`);
        } else {
            // We now assume the played bids are valid. Now we check legality of the bid
            playedCard = req.body.bid;
            // If there has been no previous bid, we set the bid and whoBid. No need to check its legality
            if (bidding[0] === "" && bidding[1] === 0) {
                bidding = playedCard;
                whoBid = turn;
                passes = 0;
                setNextTurn();
                res.status(200).json({ message: `The current bid is ${bidding[1]} of ${bidding[0]} by ${whoBid}. It is now ${turn}'s turn to bid`, turn: turn, bidding: bidding, whoBid: whoBid });
            } else if (checkValidBid(playedCard) === true) {  // This is where we will call the function from bridgeRules.ts
                bidding = playedCard;                 /* if bid is valid, set the bid and whoBid */
                whoBid = turn;
                passes = 0;
                setNextTurn();
                res.status(200).json({ message: `The current bid is ${bidding[1]} of ${bidding[0]} by ${whoBid}. It is now ${turn}'s turn to bid`, turn: turn, bidding: bidding, whoBid: whoBid });
            } else {
                res.status(400).json({ message: `Something went wrong. Your bid might be invalid, please try again ${turn}.` });
            }
        }
        } catch (error) {
            errorHandler(error);
        }
});


app.listen(80, () => {
    console.log('Server started. Fuck you.');
});

/* I MAY want to change all the console.log()'s over to res.status().send's instead?
Not sure what the difference is tbh. Will have to look it up */
