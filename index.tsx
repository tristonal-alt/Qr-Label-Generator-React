
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ERROR_MESSAGES, ELEMENT_IDS } from './constants';

const rootElement = document.getElementById(ELEMENT_IDS.ROOT);
if (!rootElement) {
  throw new Error(ERROR_MESSAGES.ROOT_ELEMENT_NOT_FOUND);
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
