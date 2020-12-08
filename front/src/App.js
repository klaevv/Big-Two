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
  const [ready, setReady] = useState(false) // Am I ready?

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('pathname', location.pathname)
  }, [location])

  const join = (webrtc) => {
    webrtc.joinRoom('big-two-game')
    setWrtc(webrtc)
    setPeers([{ id: webrtc.connection.connection.id, ready: false }]) // Add self
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
    setPeers(prev => [...prev, { ...peer, ready: false }].sort((a, b) => a.id.localeCompare(b.id)))

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
    let currentPeersLength = 0
    setPeers(prev => {
      currentPeersLength = prev.length
      return prev
    })
    let currentTurn = 0
    setTurn(prev => {
      currentTurn = prev
      return prev
    })

    switch (type) {
      case 'ready':
        setPeers(peers.map(
          p => p.id === peer.id ? { ...peer, ready: true } : p)
        )
        // if all done start game
        addChat(`Peer-${peer.id.substring(0, 5)} is ready!`, ' ', true)
        break
      case 'play':
        setTable(payload)
        advanceTurn(currentTurn, currentPeersLength) // bug: peers.length or turn does not work here
        break
      default:
        return
    };
  }

  // eslint-disable-next-line no-unused-vars
  const handleRemovedPeer = (webrtc, peer) => {
    setPeers(peers.filter(p => !p.closed))
    // TODO: who's turn?
  }

  const sendPlay = (cards) => {
    if (wrtc) {
      wrtc.shout('play', cards)
    }
    setTable(cards)
    setHand(hand.filter(c => !contains(c, cards)))
    advanceTurn()
  }

  const sendReady = () => {
    if (wrtc) {
      wrtc.shout('ready', "")
    }
    setReady(true)
    setPeers(peers.map(p => p.id === myId ? { ...p, ready: true } : p))
  }

  const allReady = peers.length > 0 ? peers.every(p => p.ready === true): false
  console.log(`all: ${allReady}`)
  console.log(peers)


  // console.log(myId, turn, peers[turn], peers)
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
          ready={ready}
          sendReady={sendReady}
          peers={peers}
        />
      </LioWebRTC>
    </div>
  )
}

export default App
