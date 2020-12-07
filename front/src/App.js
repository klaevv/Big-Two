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

  const join = (webrtc) => {
    webrtc.joinRoom('big-two-game')
    setWrtc(webrtc)
    setPeers([{ id: webrtc.id }]) // Add self
  }

  const addChat = (name, message, alert = false) => {
    setChatLog(chatLog.concat({
      name,
      message: `${message}`,
      timestamp: `${Date.now()}`,
      alert
    }))
  }

  const handleCreatedPeer = (webrtc, peer) => {
    addChat(`Peer-${peer.id.substring(0, 5)} joined the room!`, ' ', true)
    setPeers([...peers, peer].sort((a, b) => a.id.localeCompare(b.id)))

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
    console.log('received', type, payload)
    switch (type) {
      case 'play':
        setTable(payload)
        // Next player's turn:
        setTurn((turn+1) % peers.length)
        break
      default:
        return
    };
  }

  // eslint-disable-next-line no-unused-vars
  const handleRemovedPeer = (webrtc, peer) => {
    setPeers(peers.filter(p => !p.closed))
  }

  const sendPlay = (cards) => {
    if (wrtc) {
      wrtc.shout('play', cards)
    }
    setTable(cards)
    setHand(hand.filter(c => !contains(c, cards)))
  }

  let myId = ''
  if (wrtc) {
    myId = wrtc.id
  }
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
        />
      </LioWebRTC>
    </div>
  )
}

export default App
