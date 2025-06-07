import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import './styles.css'

const root = document.createElement('div');
document.body.appendChild(root);

const rootElement = ReactDOM.createRoot(root);
rootElement.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
