// This is where we will write all our bridge rules/logic
import { playedCard, rank, errorHandler, bidding } from "./main";

const rankDictionary = { "2": 1, "3": 2, "4": 3, "5": 4, "6": 5, "7": 6, "8": 7, "9": 8, "10": 9, "Jack": 10, "Queen": 11, "King": 12, "Ace": 13 }; // Dictionary to convert the rank of the card to a numbered value
const suitDictionary = { "Clubs": 1, "Diamonds": 2, "Hearts": 3, "Spades": 4 }; // Dictionary to convert the suit of the card to a number, in ascending order of value
type Suit = keyof typeof suitDictionary;
type Rank = keyof typeof rankDictionary;

export function checkValidBid(playedcard: [string, rank]): boolean {
    try {
        let valid = false;

        // We need to check if the played card has a value higher than the current bid (bidding). If it doesn't, return false
        const playedCardSuit: Suit = playedcard[0] as Suit;   // Convert the suit of the played card to a number
        const playedCardValue: Rank = playedcard[1] as Rank;  // Convert the rank of the played card to a number
        
        // Now we convert the current bid to numbers as well, for easy comparison later
        const currentBidSuit: Suit = bidding[0] as Suit;   // Convert the suit of the current bid to a number
        const currentBidValue: Rank = bidding[1] as Rank;  // Convert the rank of the current bid to a number
        /*--------------------------------------------------------------------------------------------*/
        /* 
            I tried to properly type the 4 consts above, but I ran into trouble every time
            when I tried to do it for bidding and playedcard. Couldn't figure out how to do it properly.
            That's why I ended up using "as Suit" and "as Rank" to cast the types to the correct ones,
            even though it's not "proper" TypeScript.
        */        
        /*--------------------------------------------------------------------------------------------*/

        // Now we can compare the played card to the current bid
        if (rankDictionary[playedCardValue] > rankDictionary["8"]) { // If the value of the played card is higher than 7, it's not valid
            valid = false;
            return valid;
        }
        if (suitDictionary[playedCardSuit] > suitDictionary[currentBidSuit]) { // If the suit of the played card is higher than the current bid, it's valid
            valid = true;
        
        } else if (suitDictionary[playedCardSuit] === suitDictionary[currentBidSuit]) { // If the suits are the same, we need to compare the values
            if (rankDictionary[playedCardValue] > rankDictionary[currentBidValue]) { // If the value of the played card is higher than the current bid, it's valid
                valid = true;
            }
        } else {            // If the suit of the played card is lower than the current bid, it's not valid
            valid = false;  // This is also the only case left, so we don't need any more checks
        }
        return valid;
    } catch (err) {
        errorHandler(err);
        return false;
    }
}