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
        }
    } catch (error) {
        errorHandler(error);
    }
});

// RESTful POST to restart the game
app.post('/restart', (req: Request, res: Response) => {
    try {
        players = [
            ['Trond', []],
            ['Kari', []],
            ['Per', []],
            ['Kai Åge', []]
        ];
        createDeck();
        res.status(200).send('Game restarted');
    } catch (error) {
        errorHandler(error);
    }
});


// RESTful GET to get the players and their hands
app.get('/players', (req: Request, res: Response) => {
    try {
        if (gameRunning) {
            res.status(200).json(players);
        } else {
            res.status(400).send('Game not running');
        }
    } catch (error) {
        errorHandler(error);
    }
});

// Let the players check the teams
app.get('/teams', (req: Request, res: Response) => {
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


app.listen(8080, () => {
    console.log('Server started. Fuck you.');
});
