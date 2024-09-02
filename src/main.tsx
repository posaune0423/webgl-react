import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import SwipeControl from "./components/SwipeControl.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SwipeControl>
      <App />
    </SwipeControl>
  </StrictMode>
);
