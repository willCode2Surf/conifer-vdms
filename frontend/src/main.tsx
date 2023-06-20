import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';
import './satoshi.css';

const isDev = process.env.NODE_ENV !== 'production';
const REACTWRAP = isDev ? React.Fragment : React.StrictMode;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <REACTWRAP>
    <Router>
      <App />
    </Router>
  </REACTWRAP>
);
