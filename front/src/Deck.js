/* eslint-disable */

// https://codereview.stackexchange.com/questions/149894/making-a-semi-random-order-of-an-array-based-on-a-string/150016

// creates a random number generator function.
function createRandomGenerator(seed) {
  const a = 5486230734;  // some big numbers
  const b = 6908969830;
  const m = 9853205067;
  var x = seed;
  // returns a random value 0 <= num < 1
  return function (seed = x) {  // seed is optional. If supplied sets a new seed
    x = (seed * a + b) % m;
    return x / m;
  }
}
// function creates a 32bit hash of a string    
function stringTo32BitHash(str) {
  var v = 0;
  for (var i = 0; i < str.length; i += 1) {
    v += str.charCodeAt(i) << (i % 24);
  }
  return v % 0xFFFFFFFF;
}
// shuffle array using the str as a key.
function shuffleArray(str, arr) {
  var rArr = [];
  var random = createRandomGenerator(stringTo32BitHash(str));
  while (arr.length > 1) {
    rArr.push(arr.splice(Math.floor(random() * arr.length), 1)[0]);
  }
  rArr.push(arr[0]);
  return rArr;
}

// Create a deck of cards and shuffle it based on stringSeed as a seed.
function createShuffledDeck(stringSeed) {
  // TODO: If peerCount > 4, use two/three/etc decks for scaling
  var suits = ["H", "S", "C", "D"]
  var numbers = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
  var cards = []

  for (var s = 0; s < suits.length; s++) {
    var suit = suits[s]
    for (var n = 0; n < numbers.length; n++) {
      var num = numbers[n]
      var card = {
        suit: suit,
        rank: num,
      }
      cards.push(card)
    }
  }

  return shuffleArray(stringSeed, cards)
}

// TODO: Create tests: e.g. no duplicate cards, even split, all cards dealed etc
function getHand(cards, myIndex, peerCount, cardCount) {
  const handSize = Math.floor(cardCount / peerCount)
  const startIndex = Math.floor(myIndex * handSize)
  const endIndex = startIndex + handSize
  return cards.slice(startIndex, endIndex)
}

module.exports = {
  createShuffledDeck: createShuffledDeck,
  getHand: getHand,
}
