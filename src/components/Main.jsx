import React from 'react'

function Main({ children="" }) {
  return (
    <main className="main">
      <div className="wrapper">
      {
        children
      }
      </div>
    </main>
  )
}

export default Main
