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
  // TODO: bug: chatLog resets? Try with 3 players.
  const [chatLog, setChatLog] = useState([]) // Right now just 'Player joined' notifications
  const [hand, setHand] = useState([]) // The cards the player is holding.
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
  const gameStarted = peers.length > 1 ? peers.every(p => p.ready === true) : false

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

  const getMyId = () => {
    let currentMyId = ''
    setMyId(prev => {
      currentMyId = prev
      return prev
    })
    return currentMyId
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

    // TODO: Move this to where the game begins.
    // Reset the turn to the first player:
    setTurn(0)

    // TODO: Move to where the game begins.
    const shuffledCards = createShuffledDeck(newPeers[0].id)
    setCards(shuffledCards)
    const myIndex = newPeers.map(p => p.id).indexOf(getMyId())
    setHand(getHand(shuffledCards, myIndex, newPeers.length, shuffledCards.length))
  }

  // const handleShut = () => {
  //   this.setState({ containerClass: 'container animated hinge' })
  //   this.props.webrtc.leaveRoom()
  //   this.props.webrtc.disconnect()
  // }

  // eslint-disable-next-line no-unused-vars
  const handlePeerData = (webrtc, type, payload, peer) => {
    switch (type) {
      // Client signals it is ready to start
      case 'ready': {
        let currentPeers = getPeers()
        currentPeers = currentPeers.map(p => p.id === peer.id ? { ...peer, ready: true } : p)
        setPeers(currentPeers)
        addChat(`Peer-${peer.id.substring(0, 5)} is ready!`, ' ', true)
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
        advanceTurn(getTurn(), getPeers().length) // bug: peers.length or turn does not work here
        break
      }
      case 'pass': {
        advanceTurn(getTurn(), getPeers().length)
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

  const sendReady = () => {
    if (wrtc) {
      wrtc.shout('ready', "")
    }
    setReady(true)
    setPeers(peers.map(p => p.id === myId ? { ...p, ready: true } : p))
  }

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
