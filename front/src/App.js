import React, { useEffect } from 'react'
import { Route, useLocation } from 'react-router-dom'

import HomePage from './pages/HomePage/HomePage'

function App() {
  const location = useLocation()

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('pathname', location.pathname)
  }, [location])

  return (
    <div className="App">
      <Route exact path="/" component={HomePage} />
    </div>
  )
}

export default App
