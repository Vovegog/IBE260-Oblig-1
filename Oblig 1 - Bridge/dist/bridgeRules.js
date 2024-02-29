"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkValidBid = void 0;
// This is where we will write all our bridge rules/logic
const main_1 = require("./main");
const rankDictionary = { "2": 1, "3": 2, "4": 3, "5": 4, "6": 5, "7": 6, "8": 7, "9": 8, "10": 9, "Jack": 10, "Queen": 11, "King": 12, "Ace": 13 }; // Dictionary to convert the rank of the card to a numbered value
const suitDictionary = { "Clubs": 1, "Diamonds": 2, "Hearts": 3, "Spades": 4 }; // Dictionary to convert the suit of the card to a number, in ascending order of value
function checkValidBid(playedcard) {
    try {
        let valid = false;
        // We need to check if the played card has a value higher than the current bid (bidding). If it doesn't, return false
        const playedCardSuit = playedcard[0]; // Convert the suit of the played card to a number
        const playedCardValue = playedcard[1]; // Convert the rank of the played card to a number
        // Now we convert the current bid to numbers as well, for easy comparison later
        const currentBidSuit = main_1.bidding[0]; // Convert the suit of the current bid to a number
        const currentBidValue = main_1.bidding[1]; // Convert the rank of the current bid to a number
        // Now we can compare the played card to the current bid
        if (rankDictionary[playedCardValue] > rankDictionary["8"]) { // If the value of the played card is higher than 7, it's not valid
            valid = false;
            return valid;
        }
        if (suitDictionary[playedCardSuit] > suitDictionary[currentBidSuit]) { // If the suit of the played card is higher than the current bid, it's valid
            valid = true;
        }
        else if (suitDictionary[playedCardSuit] === suitDictionary[currentBidSuit]) { // If the suits are the same, we need to compare the values
            if (rankDictionary[playedCardValue] > rankDictionary[currentBidValue]) { // If the value of the played card is higher than the current bid, it's valid
                valid = true;
            }
        }
        else { // If the suit of the played card is lower than the current bid, it's not valid
            valid = false; // This is also the only case left, so we don't need any more checks
        }
        return valid;
    }
    catch (err) {
        (0, main_1.errorHandler)(err);
        return false;
    }
}
exports.checkValidBid = checkValidBid;
