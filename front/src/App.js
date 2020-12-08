/* eslint-disable no-console */
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { LioWebRTC } from "react-liowebrtc"

import HomePage from './pages/HomePage/HomePage'

function contains(obj, list) {
  let i
  // eslint-disable-next-line no-plusplus
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
  const [hand, setHand] = useState(['s1', 's2', 's3']) // The cards the player is holding.
  const [table, setTable] = useState([]) // Most recent play (combination of cards).
  const [turn, setTurn] = useState(0)
  const [wrtc, setWrtc] = useState() // TODO: Temp solution

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('pathname', location.pathname)
  }, [location])

  const getTurn = () => {
    let currentTurn = 0
    setTurn(prev => {
      currentTurn = prev
      return prev
    })
    return currentTurn
  }

  const getPeers = () => {
    let currentPeers = 0
    setPeers(prev => {
      currentPeers = prev
      return prev
    })
    return currentPeers
  }

  const join = (webrtc) => {
    webrtc.joinRoom('big-two-game')
    setWrtc(webrtc)
    setPeers([{ id: webrtc.connection.connection.id }]) // Add self
    setMyId(webrtc.connection.connection.id)
  }

  const addChat = (name, message, alert = false) => {
    const logItem = {
      name,
      message: `${message}`,
      timestamp: `${Date.now()}`,
      alert
    }
    setChatLog(prev => [...prev, logItem])
  }

  // Next player's turn:
  const advanceTurn = (currTurn = turn, peerCount = peers.length) =>
    setTurn((currTurn + 1) % peerCount)

  const handleCreatedPeer = (webrtc, peer) => {
    addChat(`Peer-${peer.id.substring(0, 5)} joined the room!`, ' ', true)
    setPeers(prev => [...prev, peer].sort((a, b) => a.id.localeCompare(b.id)))

    // TODO: Move this to where the game begins.
    // Reset the turn to the first player:
    setTurn(0)
  }

  // const handleShut = () => {
  //   this.setState({ containerClass: 'container animated hinge' })
  //   this.props.webrtc.leaveRoom()
  //   this.props.webrtc.disconnect()
  // }

  // eslint-disable-next-line no-unused-vars
  const handlePeerData = (webrtc, type, payload, peer) => {
    switch (type) {
      case 'play':
        setTable(payload)
        advanceTurn(getTurn(), getPeers().length) // bug: peers.length or turn does not work here
        break
      default:
        return
    };
  }

  // eslint-disable-next-line no-unused-vars
  const handleRemovedPeer = (webrtc, peer) => {
    const currPeers = getPeers()
    const currTurn = getTurn()
    const disconnectedPeerIndex = currPeers.map(p => p.id).indexOf(peer.id)

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
    setPeers(currPeers.filter(p => !p.closed))
  }

  const sendPlay = (cards) => {
    if (wrtc) {
      wrtc.shout('play', cards)
    }
    setTable(cards)
    setHand(hand.filter(c => !contains(c, cards)))
    advanceTurn()
  }

  const myTurn = peers[turn] && peers[turn].id === myId

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
          myTurn={myTurn}
        />
      </LioWebRTC>
    </div>
  )
}

export default App
