import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

/**
 * NOTE: <React.StrictMode> renders each component twice, but doesn't unmount between. This will cause the renderer to
 * crash wile in development mode, although it will not effect release.
 * 
 * As such it is STRONGLY recommended not to use <React.StrictMode>.
*/
ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement,
);