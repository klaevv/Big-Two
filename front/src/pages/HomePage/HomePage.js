import React, { useState } from 'react'
import PropTypes from 'prop-types'

const HomePage = (props) => {
  const { chatLog, sendPlay, table, hand, myTurn, ready, sendReady, gameStarted, sendPass } = props
  const [selected, setSelected] = useState([])

  const generateChats = () => {
    return chatLog.map((item) => (
      <div className="chat" key={`chat-${item.name}-${item.timestamp}`}>
        <b className="name" style={{ color: '#888' }}>
          {item.name}
        </b>
      </div>
    ))
  }

  const isSequential = (arr) => {
    const ranks = arr.map((c) => c.rank)
    for (let i = 1, len = ranks.length; i < len; i++) {
      // check if current rank smaller than previous value by one
      if (ranks[i] - 1 !== ranks[i - 1]) {
        return false
      }
    }
    return true
  }

  const isSameSuite = (arr) => {
    const suites = arr.map((c) => c.suites)
    for (let i = 1, len = suites.length; i < len; i++) {
      // check if current suite is different than previous value
      if (suites[i] !== suites[i - 1]) {
        return false
      }
    }
    return true
  }

  const fourSameRanks = (arr) => {
    const ranks = arr.map((c) => c.rank)
    let differences = 0
    for (let i = 1, len = ranks.length; i < len; i++) {
      // check if current rank is different than previous value
      if (ranks[i] !== ranks[i - 1]) {
        differences += 1
      }
    }
    return differences < 2
  }

  function distinct(value, index, self) {
    return self.indexOf(value) === index
  }

  const twoAndThreeSameRanks = (arr) => {
    const suites = arr.map((c) => c.suites)
    if (arr.filter(distinct).length !== 2) {
      return false
    }
    const countObj = {}
    for (let i = 0, len = suites.length; i < len; i++) {
      countObj[suites[i]] = (countObj[suites[i]] || 0) + 1
    }
    return (countObj[0] === 2 && countObj[1] === 3) || (countObj[0] === 3 && countObj[1] === 2)
  }

  // eslint-disable-next-line no-unused-vars
  const isValidHand = (arr) => {
    const single = arr.length === 1
    const pairs = arr.length === 2 && arr[0].rank === arr[1].rank
    const triples = arr.length === 3 && arr[0].rank === arr[1].rank && arr[0].rank === arr[2].rank
    const straight = arr.length === 5 && isSequential(arr)
    const flush = arr.length === 5 && isSameSuite(arr)
    const straightFlush = arr.length === 5 && isSequential(arr) && isSameSuite(arr)
    const fourOfAKind = arr.length === 5 && fourSameRanks(arr)
    const fullHouse = arr.length === 5 && twoAndThreeSameRanks(arr)
    return (
      single || pairs || triples || straight || flush || straightFlush || fourOfAKind || fullHouse
    )
  }

  const handlePlayCards = () => {
    if (hand.length > 0) { // Check that combination is legit (possible to play)
      sendPlay(selected) // Send a combination or a single card.
    }
  }

  const handleCardSelected = (e) => {
    const selectedIndex = e.target.name
    const selectedCard = hand[selectedIndex]

    if (e.target.checked) {
      setSelected(prev => [...prev, selectedCard])
    } else {
      setSelected(prev => prev.filter(c => !(c.suit === selectedCard.suit && c.rank === selectedCard.rank)))
    }
  }

  const handleReady = () => {
    sendReady()
  }

  // are all clients ready?

  const actionButtonDisabled = hand.length === 0 || !myTurn || !gameStarted


  // TODO: Sort hand

  return (
    <div className="homePage">
      <div className="homePageContainer">
        <h1>Big Two</h1>
        {generateChats()}
        <span style={{ color: '#888' }}>On the table: </span>
        {table.map(card => (
          <span style={{ color: '#888' }} key={`span-${card.suit}-${card.rank}`}>
            {card.suit}{card.rank},
          </span>
        ))}
        <br />
        <button type="button" disabled={actionButtonDisabled} onClick={handlePlayCards}>Play selected cards</button>
        <br />
        <button type="button" hidden={ready} onClick={handleReady}>Ready to start</button>
        <br />
        <button type="button" disabled={actionButtonDisabled} onClick={sendPass}>Pass</button>
        <br />
        <form>
          {hand.map((card, index) => (
            <div key={`div-${card.suit}-${card.rank}`}>
              <input
                type="checkbox"
                key={`input-${card.suit}-${card.rank}`}
                id={`card-${card.suit}-${card.rank}`}
                name={index}
                onChange={handleCardSelected}
              />
              <label
                key={`label-${card.suit}-${card.rank}`}
                htmlFor={`card-${card.suit}-${card.rank}`}
                style={{ color: '#888' }}
              >
                {card.suit}{card.rank}
              </label>
            </div>
          ))}
        </form>
      </div>
    </div>
  )
}

HomePage.propTypes = {
  chatLog: PropTypes.arrayOf(PropTypes.object),
  sendPlay: PropTypes.func,
  sendPass: PropTypes.func,
  table: PropTypes.arrayOf(PropTypes.object),
  hand: PropTypes.arrayOf(PropTypes.object),
  myTurn: PropTypes.bool,
  ready: PropTypes.bool,
  sendReady: PropTypes.func,
  gameStarted: PropTypes.bool,
  // peers: PropTypes.arrayOf(PropTypes.object),
}
HomePage.defaultProps = {
  chatLog: [],
  sendPlay: () => { },
  sendPass: () => { },
  table: [],
  hand: [],
  myTurn: false,
  ready: false,
  sendReady: () => { },
  gameStarted: false,
  // peers: [],
}

export default HomePage
