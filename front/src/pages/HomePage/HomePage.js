import React from 'react'
import PropTypes from 'prop-types'

const HomePage = (props) => {
  const { chatLog, sendPlay, table, hand } = props

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
    for (let i = 1, len = arr.length; i < len; i++) {
      // check if current value smaller than previous value
      if (arr[i] - 1 !== arr[i - 1]) {
        return false
      }
    }
    return true
  }

  const isSameSuite = (arr) => {
    for (let i = 1, len = arr.length; i < len; i++) {
      // check if current value smaller than previous value
      if (arr[i].suite !== arr[i - 1].suite) {
        return false
      }
    }
    return true
  }

  const fourSameRanks = (arr) => {
    const ranks = arr.map((c) => c.rank)
    let differences = 0
    for (let i = 1, len = ranks.length; i < len; i++) {
      // check if current value smaller than previous value
      if (ranks[i] !== ranks[i - 1]) {
        differences += 1
      }
    }
    return differences < 2
  }

  const twoAndThreeSameRanks = (arr) => {
    const ranks = arr.map((c) => c.rank)
    let differences = 0
    for (let i = 1, len = ranks.length; i < len; i++) {
      // check if current value smaller than previous value
      if (ranks[i].suite !== arr[i - 1]) {
        differences += 1
      }
    }
    return differences < 2
  }

  const isValidHand = (arr) => {
    const valid1 = arr.length === 1
    const valid2 = arr.length === 2 && arr[0].rank === arr[1].rank
    const valid3 = arr.length === 3 && arr[0].rank === arr[1].rank && arr[0].rank === arr[2].rank
    const straight = arr.length === 5 && isSequential(arr)
    const flush = arr.length === 5 && isSameSuite(arr)
    const straightFlush = arr.length === 5 && isSequential(arr) && isSameSuite(arr)
    const fourOfAKind = arr.length === 5 && fourSameRanks(arr)
    return valid1 || valid2 || valid3 || straight || flush || straightFlush || fourOfAKind
  }

  const handlePlayCard = () => {
    if (hand.length > 0) {
      // Check that combination is legit (possible to play)
      // Check that combination is legit (possible to play)
      sendPlay([hand[0]]) // Send a combination or a single card.
    }
  }

  return (
    <div className="homePage">
      <div className="homePageContainer">
        <h1>Big Two</h1>
        {generateChats()}
        <span style={{ color: '#888' }}>On the table: </span>
        {table.map((card) => (
          <span style={{ color: '#888' }} key={card}>
            {card}
          </span>
        ))}
        <br />
        <button type="button" disabled={hand.length === 0} onClick={handlePlayCard}>
          Play a card
        </button>
      </div>
    </div>
  )
}

HomePage.propTypes = {
  chatLog: PropTypes.arrayOf(PropTypes.object),
  sendPlay: PropTypes.func,
  table: PropTypes.arrayOf(PropTypes.string),
  hand: PropTypes.arrayOf(PropTypes.string),
}
HomePage.defaultProps = {
  chatLog: [],
  sendPlay: () => {},
  table: [],
  hand: [],
}

export default HomePage
