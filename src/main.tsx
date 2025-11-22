import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

// Force cache clear - version 2.1
const CACHE_VERSION = '2.1';
const currentVersion = localStorage.getItem('app_version');
if (currentVersion !== CACHE_VERSION) {
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem('app_version', CACHE_VERSION);
  console.log('Cache cleared - upgraded to version', CACHE_VERSION);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
