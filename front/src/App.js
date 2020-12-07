import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { LioWebRTC } from 'react-liowebrtc'

import HomePage from './pages/HomePage/HomePage'

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
  // TODO: bug: chatLog resets? Try with 3 players.
  const [chatLog, setChatLog] = useState([]) // Right now just 'Player joined' notifications
  const [hand, setHand] = useState(['s1', 's2', 's3']) // The cards the player is holding.
  const [table, setTable] = useState([]) // Most recent play (combination of cards).
  const [wrtc, setWrtc] = useState() // TODO: Temp solution

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('pathname', location.pathname)
  }, [location])

  const join = (webrtc) => {
    webrtc.joinRoom('react-liowebrtc-test-demo')
    setWrtc(webrtc)
  }

  const addChat = (name, message, alert = false) => {
    setChatLog(
      chatLog.concat({
        name,
        message: `${message}`,
        timestamp: `${Date.now()}`,
        alert,
      })
    )
  }

  const handleCreatedPeer = (webrtc, peer) => {
    addChat(`Peer-${peer.id.substring(0, 5)} joined the room!`, ' ', true)
    setPeers([...peers, peer])
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
        break
      default:
    }
  }

  // eslint-disable-next-line no-unused-vars
  const handleRemovedPeer = (webrtc, peer) => {
    setPeers(peers.filter((p) => !p.closed))
  }

  const sendPlay = (cards) => {
    if (wrtc) {
      wrtc.shout('play', cards)
    }
    setTable(cards)
    setHand(hand.filter((c) => !contains(c, cards)))
  }

  return (
    <div className="App">
      <LioWebRTC
        onReady={join}
        onCreatedPeer={handleCreatedPeer}
        onRemovedPeer={handleRemovedPeer}
        onReceivedPeerData={handlePeerData}
      >
        <HomePage chatLog={chatLog} hand={hand} table={table} sendPlay={sendPlay} />
      </LioWebRTC>
    </div>
  )
}

export default App
