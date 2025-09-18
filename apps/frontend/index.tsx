
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

// Firebase has been removed in favor of JWT authentication

// Initialize the time-ago library once for the entire application.
TimeAgo.addDefaultLocale(en);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);