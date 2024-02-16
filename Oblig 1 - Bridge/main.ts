import express, { Express, NextFunction, Request, Response } from 'express';
import path from 'path';

const app: Express = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.use(function(inRequest: Request, inResponse: Response, inNext: NextFunction) {
    inResponse.header('Access-Control-Allow-Origin', '*');
    inResponse.header('Access-Control-Allow-Methods', 'GET,POST');
    inResponse.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    inNext();
});

function errorHandler (err: any) {
    console.error(err);
}

// Boolean to check if the game is running
let gameRunning: boolean = false;

// Create an array holding the 4 players with their hands (of cards)
let players: [string, string[]][] = [
    ['Trond', []],
    ['Kari', []],
    ['Per', []],
    ['Kai Åge', []]
];

// Make player 1 and 3 a team, and player 2 and 4 a team
let team1: string[] = [players[0][0], players[2][0]];
let team2: string[] = [players[1][0], players[3][0]];
/* Can theoretically add a 3rd index representing a numerical score for the team */

// Initiate variable "deck"
let deck: string[] = [];

// Declare variables for bidding and who put the bid
let bidding: number = 0;
let whoBid: string = '';

// Variable for storing passes in a row. 3 PASSES IN A ROW ENDS THE ROUND!!!
let passes: number = 0;

// Declare a variable for the round
let round: number = 1;

// Need to keep track of which players turn it is
let turn: string = players[0][0];

// Create a deck and shuffle it
function createDeck() {
    try {
        deck = []; // Important to reset the deck before creating a new one in case of restart of the game
        let suits: string[] = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
        let ranks: string[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
        for (let suit of suits) {
            for (let rank of ranks) {
                deck.push(`${rank} of ${suit}`);
            }
        }
        // console.log(deck); // Debugging

        // Shuffle the deck. I honestly can't tell you how this works, it's a shuffle algorithm I found online
        for (let i: number = deck.length - 1; i > 0; i--) {
            let j: number = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        // console.log(deck); // Debugging

        // Assign the cards to the players
        for (let i: number = 0; i < deck.length; i++) {
            players[i % 4][1].push(deck[i]); // Assigns one card to each player, then loops back to the first player
        }                                    // Could be done with a slice of the deck, but whatever. It works and it's not a lot of code
        // console.log(players); // Debugging
    } catch (error) {
        errorHandler(error);
    }
}

// RESTful POST to start the game
app.post('/start', (req: Request, res: Response) => {
    try {
        if (gameRunning) {
            res.status(400).send('Game already running');
        } else {
            gameRunning = true;
            createDeck();
            /* Res.status sends out the message to display in the client, whose turn it is
            and the players hands to be displayed in the client, when we get to that in assignment 2 */
            res.status(200).json( { message: `Game started. It is now ${turn}'s turn to bid`, turn: turn, players: players } );
            // console.log(`It is now ${turn}'s turn to bid`); // Debugging
        }
    } catch (error) {
        errorHandler(error);
    }
});

// RESTful POST to restart the game
app.post('/restart', async (req: Request, res: Response) => {
    try {
        players = [
            ['Trond', []],
            ['Kari', []],
            ['Per', []],
            ['Kai Åge', []]
        ];
        createDeck();
        // Reset the game variables
        round = 1;
        turn = players[0][0];
        bidding = 0;
        passes = 0;
        // Res.status sends out the message to display in the client, and whose turn it is
        res.status(200).json( { message: `Game restarted. It is now ${turn}'s turn to bid`, turn: turn } );
        // console.log(`It is now ${turn}'s turn to bid`); // Debugging
    } catch (error) {
        errorHandler(error);
    }
});


// RESTful GET to get the players and their hands. Mostly for debugging purposes, but could be used for the players to see their hands
app.get('/players', async (req: Request, res: Response) => {
    try {
        if (gameRunning) {
            res.status(200).json( { message: `Game is running. It is currently ${turn}'s turn to bid`, players: players } );
            // console.log(`It is currently ${turn}'s turn to bid`); // Debugging
        } else {
            res.status(400).send('Game not running');
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
            res.status(400).send('Game not running');
        }
    } catch (error) {
        errorHandler(error);
    }
});

// RESTful POST to make a bid
app.post('/bid', async (req: Request, res: Response) => {
    // Check if player is allowed to bid
    try {
        if (req.body.player !== turn) {
            res.status(400).send(`It is not your turn to bid. It is ${turn}'s turn to bid`);
            // console.log(`It is not ${req.body.player}'s turn to bid, it is ${turn}'s turn to bid`) // Debugging
            return;
        } else { 
            // If player bids "pass"
            if (req.body.bid === "PASS") {
                passes++;
                // Check passes. If passes in a row is 3, the round is over
                if (passes === 3) {
                    // console.log(`Round ${round} is over`); // Debugging
                    round++;
                    // Reset passes to 0 for next round
                    passes = 0;
                    // Reset the bidding to 0 for next round
                    bidding = 0;
                    // Reset the turn to player 1 for next round
                    turn = players[0][0];
                    // Reset the players hands for next round *NOT WORKING YET*
                    res.status(200).json( { message: `Round ${round-1} is over. It is now ${turn}'s turn to bid`, turn: turn, round: round } );
                    // console.log(`Game is now in round number ${round}`); // Debugging
                    // If round ends: Exit the function
                    return;
                }

            // Instead of console.log, we use res.status().json() to send the message to the client
            res.status(200).json( { message: `${turn} passed. It is now ${players[(players.findIndex(player => player[0] === turn) + 1) % 4][0]}'s turn to bid`, turn: turn } );
            // console.log(`${turn} passed. It is now ${players[(players.findIndex(player => player[0] === turn) + 1) % 4][0]}'s turn to bid`); // Debugging

            // Pass the turn to the next player
            turn = players[(players.findIndex(player => player[0] === turn) + 1) % 4][0];

            } else if (req.body.bid <= 0 ) { // If player bids a 0 or less than 0 (which is impossible)
                res.status(400).send(`You cannot bid 0 or less than the current bid, ${turn}`);
                return;
            } else if (req.body.bid < bidding) { // If player bids lower than the current bid (which is impossible)
                res.status(400).send(`You cannot bid lower than the current bid, ${turn}`);
                return;
            } else { // If player bids a number higher than the current bid
                bidding = req.body.bid;
                whoBid = turn;
                passes = 0;
                // Pass the turn to the next player
                turn = players[(players.findIndex(player => player[0] === turn) + 1) % 4][0];
                res.status(200).json( { message: `The current bid is ${bidding} by ${whoBid}. It is now ${turn}'s turn to bid`, turn: turn, bidding: bidding, whoBid: whoBid } );
                // console.log(`The current bid is ${bidding} by ${whoBid}. It is now ${turn}'s turn to bid`); // Debugging
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