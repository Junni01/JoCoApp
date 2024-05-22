import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { GlobalEffectsProvider } from "./GlobalEffectsContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GlobalEffectsProvider>
      <App />
    </GlobalEffectsProvider>
  </React.StrictMode>
);
