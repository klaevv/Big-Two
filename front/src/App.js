/* eslint-disable no-console */
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { LioWebRTC } from 'react-liowebrtc'

import HomePage from './pages/HomePage/HomePage'
import { createShuffledDeck, getHand } from './Deck'

function contains(obj, list) {
  let i
  for (i = 0; i < list.length; i++) {
    if (list[i] === obj) {
      return true
    }
  }
  return false
}

function App() {
  const location = useLocation()

  const [peers, setPeers] = useState([]) // Players
  const [myId, setMyId] = useState('')
  // eslint-disable-next-line no-unused-vars
  const [myName, setMyName] = useState('')
  const [chatLog, setChatLog] = useState([]) // Right now just 'Player joined' notifications
  const [hand, setHand] = useState([]) // The cards the player is holding.
  // eslint-disable-next-line no-unused-vars
  const [allHands, setAllHands] = useState([])
  const [table, setTable] = useState([]) // Most recent play (combination of cards).
  // eslint-disable-next-line no-unused-vars
  const [cards, setCards] = useState([])
  const [turn, setTurn] = useState(0)
  const [wrtc, setWrtc] = useState() // TODO: Temp solution
  const [ready, setReady] = useState(false) // Am I ready?
  // const [gamePeers, setGamePeers] = useState([])

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('pathname', location.pathname)
  }, [location])

  // Everyone is ready and there are at least 2 players
  const hasGameStarted = (currentPeers = peers) =>
    currentPeers.length > 1 ? currentPeers.every(p => p.ready === true) : false
  const gameStarted = hasGameStarted()

  const getTurn = () => {
    let currentTurn = 0
    setTurn((prev) => {
      currentTurn = prev
      return prev
    })
    return currentTurn
  }

  const getPeers = () => {
    let currentPeers = 0
    setPeers((prev) => {
      currentPeers = prev
      return prev
    })
    return currentPeers
  }

  // const getMyId = () => {
  //   let currentMyId = ''
  //   setMyId(prev => {
  //     currentMyId = prev
  //     return prev
  //   })
  //   return currentMyId
  // }

  // eslint-disable-next-line no-unused-vars
  const getAllHands = () => {
    let currentAllHands = []
    setAllHands(prev => {
      currentAllHands = prev
      return prev
    })
    return currentAllHands
  }

  const getMyName = () => {
    let currentMyName = ''
    setMyName(prev => {
      currentMyName = prev
      return prev
    })
    return currentMyName
  }

  const join = (webrtc) => {
    webrtc.joinRoom('big-sad-game')
    setWrtc(webrtc)
    setPeers([{ id: webrtc.connection.connection.id, ready: false }]) // Add self
    setMyId(webrtc.connection.connection.id)
  }

  const addChat = (name, message, alert = false) => {
    const logItem = {
      name,
      message: `${message}`,
      timestamp: `${Date.now()}`,
      alert,
    }
    setChatLog((prev) => [...prev, logItem])
  }

  // Next player's turn:
  const advanceTurn = (currTurn = turn, peerCount = peers.length) =>
    setTurn((currTurn + 1) % peerCount)

  const handleCreatedPeer = (webrtc, peer) => {
    if (gameStarted) return
    addChat(`Peer-${peer.id.substring(0, 5)} joined the room!`, ' ', true)
    let newPeers = []
    setPeers(prev => {
      newPeers = [...prev, { ...peer, ready: false }].sort((a, b) => a.id.localeCompare(b.id))
      return newPeers
    })
  }

  const startGame = (currentPeers, webrtc) => {
    // Reset the turn to the first player:
    setTurn(0)
    // Shuffle cards based on first peer id, and deal them evenly:
    const currentMyId = webrtc.connection.connection.id
    const shuffledCards = createShuffledDeck(currentPeers[0].id)
    setCards(shuffledCards)
    const myIndex = currentPeers.map(p => p.id).indexOf(currentMyId)
    setHand(getHand(shuffledCards, myIndex, currentPeers.length, shuffledCards.length))
    // Keep track of all other hands (for recovery):
    let dealtHands = []
    for (let i = 0; i < currentPeers.length; i++) {
      dealtHands = [...dealtHands, {
        id: currentPeers[i].id,
        name: '',
        hand: getHand(shuffledCards, i, currentPeers.length, shuffledCards.length)
      }]
    }
    setAllHands(dealtHands)
    // console.log(currentPeers)
    // console.log(getHand(shuffledCards, myIndex, currentPeers.length, shuffledCards.length))
  }

  // const handleShut = () => {
  //   this.setState({ containerClass: 'container animated hinge' })
  //   this.props.webrtc.leaveRoom()
  //   this.props.webrtc.disconnect()
  // }

  const updateHand = (peer, payload, currentAllHands, currentPeers) => {
    let peerIndex
    for (peerIndex = 0; peerIndex < currentPeers.length; peerIndex++) {
      if (currentAllHands[peerIndex].id === peer.id) {
        break
      }
    }

    // Remove played cards from peer's remaining hand
    for (let j = 0; j < payload.length; j++) {
      for (let i = 0; i < currentAllHands[peerIndex].hand.length; i++) {
        if (payload[j].suit === currentAllHands[peerIndex].hand[i].suit
          && payload[j].rank === currentAllHands[peerIndex].hand[i].rank) {
          currentAllHands[peerIndex].hand.splice(i, 1)
          break
        }
      }
    }

    // Update name:
    // eslint-disable-next-line no-param-reassign
    currentAllHands[peerIndex].name = currentPeers[peerIndex].name

    return currentAllHands
  }

  const indexOfName = (givenName, currentAllHands) => {
    // console.log(givenName, currentAllHands)
    for (let i = 0; i < currentAllHands.length; i++) {
      if (givenName === currentAllHands[i].name) {
        return i
      }
    }
    return -1
  }

  const checkRevive = (webrtc, peerName, currentAllHands) => {
    // Check if the player was already in the game previously (based on name)
    const peerIndex = indexOfName(peerName, currentAllHands)
    if (peerIndex !== -1) {
      // console.log('send revive',currentAllHands)
      // TODO: improvement: use only one node to "shout"
      webrtc.shout('revive', currentAllHands) // Security issue: Anyone can get anyones cards if they know other's names.
    }
  }

  const reviveOwnHand = (receivedAllHands) => {
    const peerIndex = indexOfName(getMyName(), receivedAllHands)
    // console.log(peerIndex)
    // console.log('received revival',receivedAllHands)
    if (peerIndex !== -1) {
      setHand(receivedAllHands[peerIndex].hand)
    }
    setAllHands(receivedAllHands)
  }

  // eslint-disable-next-line no-unused-vars
  const handlePeerData = (webrtc, type, payload, peer) => {
    let currentPeers = getPeers()
    const currentAllHands = getAllHands()
    switch (type) {
      // Client signals it is ready to start
      case 'ready': {
        currentPeers = currentPeers.map(p => p.id === peer.id ? { ...peer, ready: true, name: payload } : p)
        setPeers(currentPeers)
        addChat(`Peer-${peer.id.substring(0, 5)} is ready!`, ' ', true)
        checkRevive(webrtc, payload, currentAllHands)
        // If they were the last one to press ready, start game:
        if (hasGameStarted(currentPeers)) {
          startGame(currentPeers, webrtc)
        }
        break
      }
      case 'win': {
        console.log("game over")
        addChat(`Peer-${peer.id.substring(0, 5)} won!`, ' ', true)
        // reset all state
        const currentPeers = getPeers().map(p => { return { ...p, ready: false } })
        setPeers(currentPeers)
        setReady(false)
        setHand([])
        setTable([])
        setCards([])
        break
      }
      case 'play': {
        setTable(payload)
        advanceTurn(getTurn(), currentPeers.length) // bug: peers.length or turn does not work here
        setAllHands(updateHand(peer, payload, currentAllHands, currentPeers))
        break
      }
      case 'pass': {
        advanceTurn(getTurn(), currentPeers.length)
        break
      }
      case 'revive': {
        reviveOwnHand(payload)
        break
      }
      default:
    }
  }

  // eslint-disable-next-line no-unused-vars
  const handleRemovedPeer = (webrtc, peer) => {
    const currPeers = getPeers()
    const currTurn = getTurn()
    const disconnectedPeerIndex = currPeers.map((p) => p.id).indexOf(peer.id)

    // 1) If the turn index smaller (i.e before) the disconnected peer's index,
    // then the turn automatically moves to the next peer.
    // 2) If turn index === peers.length - 1, the turn should move to index 0.
    // 3) Otherwise the turn index is bigger than the disappeared peer's index,
    // so the turn becomes offset (bigger) by 1.
    if (currTurn === currPeers.length - 1) {
      setTurn(0)
    } else if (currTurn > disconnectedPeerIndex) {
      setTurn(currTurn - 1)
    }
    setPeers(currPeers.filter((p) => !p.closed))
  }

  const sendWin = () => {
    if (wrtc) {
      wrtc.shout('win', '')
    }
  }

  const sendPlay = (cardsToPlay) => {
    if (wrtc) {
      wrtc.shout('play', cardsToPlay)
    }
    setTable(cardsToPlay)
    const newHand = hand.filter((c) => !contains(c, cardsToPlay))
    setHand(newHand)
    advanceTurn()
    if (newHand.length === 0) {
      addChat(`You win!`)
      sendWin()
      const cp = peers.map(p => { return { ...p, ready: false } })
      // reset all state
      setPeers(cp)
      setReady(false)
      setHand([])
      setTable([])
      setCards([])

    }
  }

  const sendPass = () => {
    if (wrtc) {
      wrtc.shout('pass', '')
    }
    advanceTurn()
  }

  const sendReady = (name) => {
    if (wrtc) {
      wrtc.shout('ready', name)
    }
    setReady(true)
    setMyName(name)
    const newPeers = peers.map(p => p.id === myId ? { ...p, ready: true } : p)
    setPeers(newPeers)
    // If all others pressed ready already, start the game:
    if (hasGameStarted(newPeers)) {
      startGame(newPeers, wrtc)
    }
  }
console.log('turn',turn)
  const myTurn = peers[turn] && peers[turn].id === myId
  console.log(peers)
  return (
    <div className="App">
      <LioWebRTC
        onReady={join}
        onCreatedPeer={handleCreatedPeer}
        onRemovedPeer={handleRemovedPeer}
        onReceivedPeerData={handlePeerData}
      >
        <HomePage
          chatLog={chatLog}
          hand={hand}
          table={table}
          sendPlay={sendPlay}
          sendPass={sendPass}
          myTurn={myTurn}
          ready={ready}
          sendReady={sendReady}
          peers={peers}
          gameStarted={gameStarted}
        />
      </LioWebRTC>
    </div>
  )
}

export default App
