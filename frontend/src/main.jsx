import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { NotificationProvider } from "./components/NotificationProvider";
import ReleaseNotesProvider from "./components/ReleaseNotesProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <ReleaseNotesProvider>
          <App />
        </ReleaseNotesProvider>
      </NotificationProvider>
    </BrowserRouter>
  </React.StrictMode>
);
