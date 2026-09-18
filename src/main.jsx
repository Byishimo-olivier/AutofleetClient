import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import logo from "./Images/logo.png";

const favicon = document.querySelector('link[rel="icon"]');
if (favicon) {
  favicon.href = logo;
  favicon.type = "image/png";
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

