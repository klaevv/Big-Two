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
      if (arr[i] - 1 === arr[i - 1]) {
        return false
      }
    }

    return true
  }

  const handlePlayCard = () => {
    const valid1 = hand.length === 1
    const valid2 = hand.length === 2 && hand[0].rank === hand[1].rank
    const valid3 =
      hand.length === 3 && hand[0].rank === hand[1].rank && hand[0].rank === hand[2].rank
    const straight = hand.length === 5 && isSequential(hand)
    if (valid1 || valid2 || valid3 || straight) {
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
