import React from 'react'
import PropTypes from 'prop-types'

const HomePage = (props) => {
  const { chatLog, sendPlay, table, hand, myTurn, sendPass } = props

  const generateChats = () => {
    return chatLog.map((item) => (
      <div className="chat" key={`chat-${item.name}-${item.timestamp}`}>
        <b className="name" style={{ color: '#888' }}>{item.name}</b>
      </div>
    ))
  }

  const handlePlayCard = () => {
    if (hand.length > 0) { // Check that combination is legit (possible to play)
      sendPlay([hand[0]]) // Send a combination or a single card.
    }
  }

  const actionButtonDisabled = hand.length === 0 || !myTurn

  return (
    <div className="homePage">
      <div className="homePageContainer">
        <h1>Big Two</h1>
        {generateChats()}
        <span style={{ color: '#888' }}>On the table: </span>
        {table.map(card => <span style={{ color: '#888' }} key={card}>{card}</span>)}
        <br />
        <button type="button" disabled={actionButtonDisabled} onClick={handlePlayCard}>Play a card</button>
        <br />
        <button type="button" disabled={actionButtonDisabled} onClick={sendPass}>Pass</button>
      </div>
    </div>
  )
}

HomePage.propTypes = {
  chatLog: PropTypes.arrayOf(PropTypes.object),
  sendPlay: PropTypes.func,
  sendPass: PropTypes.func,
  table: PropTypes.arrayOf(PropTypes.string),
  hand: PropTypes.arrayOf(PropTypes.string),
  myTurn: PropTypes.bool,
}
HomePage.defaultProps = {
  chatLog: [],
  sendPlay: () => {},
  sendPass: () => {},
  table: [],
  hand: [],
  myTurn: false,
}

export default HomePage
