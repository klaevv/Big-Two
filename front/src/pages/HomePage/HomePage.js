import React from 'react'
import PropTypes from 'prop-types'

const HomePage = (props) => {
  const { chatLog, sendPlay, table, hand, myTurn, ready, sendReady, peers } = props

  const generateChats = () => {
    return chatLog.map((item) => (
      <div className="chat" key={`chat-${item.name}-${item.timestamp}`}>
        <b className="name" style={{ color: '#888' }}>{item.name}</b>
      </div>
    ))
  }

  const handlePlayCard = () => {
    if (hand.length > 0) { // Check that combination is legit (possible to play)
      // console.log("Played ${hand[0]}")
      sendPlay([hand[0]]) // Send a combination or a single card.
    }
  }

  const handleReady = () => {
    sendReady()
  }

  // are all clients ready?
  // const showReadyButton = peers.map(p => Object.prototype.hasOwnProperty.call(p, 'ready') ? p.ready : false).some(val => val)

  const playButtonDisabled = hand.length === 0 || !myTurn


  return (
    <div className="homePage">
      <div className="homePageContainer">
        <h1>Big Two</h1>
        {generateChats()}
        <span style={{ color: '#888' }}>On the table: </span>
        {table.map(card => <span style={{ color: '#888' }} key={card}>{card}</span>)}
        <br />
        <button type="button" hidden={ready} onClick={handleReady}>Ready to start</button>
        <button type="button" disabled={playButtonDisabled} onClick={handlePlayCard}>Play a card</button>
      </div>
    </div>
  )
}

HomePage.propTypes = {
  chatLog: PropTypes.arrayOf(PropTypes.object),
  sendPlay: PropTypes.func,
  table: PropTypes.arrayOf(PropTypes.string),
  hand: PropTypes.arrayOf(PropTypes.string),
  myTurn: PropTypes.bool,
  ready: PropTypes.bool,
  sendReady: PropTypes.func,
  peers: PropTypes.arrayOf(PropTypes.object),
}
HomePage.defaultProps = {
  chatLog: [],
  sendPlay: () => { },
  table: [],
  hand: [],
  myTurn: false,
  ready: false,
  sendReady: () => { },
  peers: [],
}

export default HomePage
