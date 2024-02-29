// This is where we will write all our bridge rules/logic
import { playedCard, rank, errorHandler, bidding } from "./main";

const rankDictionary = { "2": 1, "3": 2, "4": 3, "5": 4, "6": 5, "7": 6, "8": 7, "9": 8, "10": 9, "J": 10, "Q": 11, "K": 12, "A": 13 }; // Dictionary to convert the rank of the card to a numbered value
const suitDictionary = { "Clubs": 1, "Diamonds": 2, "Hearts": 3, "Spades": 4 }; // Dictionary to convert the suit of the card to a number, in ascending order of value

export function checkValidBid(playedcard: [string, rank]): boolean {
    try {
        let valid = false;

        // We need to check if the played card has a value higher than the current bid (bidding). If it doesn't, return false
        const playedCardSuit: keyof typeof suitDictionary = playedcard[0] as keyof typeof suitDictionary;   // Convert the suit of the played card to a number
        const playedCardValue: keyof typeof rankDictionary = playedcard[1] as keyof typeof rankDictionary;  // Convert the rank of the played card to a number
        
        // Now we convert the current bid to numbers as well, for easy comparison later
        const currentBidSuit: keyof typeof suitDictionary = bidding[0] as keyof typeof suitDictionary;   // Convert the suit of the current bid to a number
        const currentBidValue: keyof typeof rankDictionary = bidding[1] as keyof typeof rankDictionary;  // Convert the rank of the current bid to a number
        
        // Now we can compare the played card to the current bid
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