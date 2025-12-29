import React from 'react'
import ReactDOM from 'react-dom/client'
import Modal from 'react-modal'
import App from './App'
import './index.css'

// Set app element for react-modal to prevent accessibility issues and overlay problems
Modal.setAppElement('#root')

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
