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

// Create an array holding the 4 players with their hands
let players: [string, string[]][] = [
    ['Trond', []],
    ['Kari', []],
    ['Per', []],
    ['Kai Åge', []]
];

// Make player 1 and 3 a team, and player 2 and 4 a team
let team1: string[] = [players[0][0], players[2][0]];
let team2: string[] = [players[1][0], players[3][0]];

// Initiate variable "deck"
let deck: string[] = [];

// Declare a variable for bidding
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
        deck = [];
        let suits: string[] = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
        let ranks: string[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
        for (let suit of suits) {
            for (let rank of ranks) {
                deck.push(`${rank} of ${suit}`);
            }
        }
        // console.log(deck); // Debugging

        // Shuffle the deck
        for (let i: number = deck.length - 1; i > 0; i--) {
            let j: number = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        // console.log(deck); // Debugging

        // Assign the cards to the players
        for (let i: number = 0; i < deck.length; i++) {
            players[i % 4][1].push(deck[i]);
        }
        console.log(players);
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
            res.status(200).send('Game started');
            console.log(`It is now ${turn}'s turn to bid`);
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
        round = 0;
        turn = players[0][0];
        bidding = 0;
        passes = 0;
        res.status(200).send('Game restarted');
        console.log(`It is now ${turn}'s turn to bid`);
    } catch (error) {
        errorHandler(error);
    }
});


// RESTful GET to get the players and their hands
app.get('/players', async (req: Request, res: Response) => {
    try {
        if (gameRunning) {
            res.status(200).json(players);
            console.log(`It is currently ${turn}'s turn to bid`);
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
    if (req.body.player !== turn) {
        res.status(400).send(`It is not your turn to bid. It is ${turn}'s turn to bid`);
        console.log(`It is not ${req.body.player}'s turn to bid, it is ${turn}'s turn to bid`)
        return;
    } else { 
        // If player bids "pass"
        if (req.body.bid === "PASS") {
            passes++;
            // Console out that the player passed, and who's next up to bid
            console.log(`${turn} passed. It is now ${players[(players.findIndex(player => player[0] === turn) + 1) % 4][0]}'s turn to bid`);
            // Pass the turn to the next player
            turn = players[(players.findIndex(player => player[0] === turn) + 1) % 4][0];
            // If passes is 3, the round is over
            if (passes === 3) {
                console.log(`Round ${round} is over`);
                round++;
                // Reset passes to 0 for next round
                passes = 0;
                // Reset the bidding to 0 for next round
                bidding = 0;
                // Reset the turn to player 1 for next round
                turn = players[0][0];
                // Reset the players hands for next round *NOT WORKING YET*
                console.log(`Game is now in round number ${round}`);
            }
        } else if (req.body.bid <= 0 ) { // If player bids a 0 or less than current bid (which is impossible)
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
            // Console out which players turn is next, as well as the current bid
            console.log(`The current bid is ${bidding} by ${whoBid}. It is now ${turn}'s turn to bid`);
        }
    } 
});

app.listen(80, () => {
    console.log('Server started. Fuck you.');
});
