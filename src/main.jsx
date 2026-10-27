import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App.jsx";
import { store } from "./store/index.js";
import { ThemeProvider, ToastProvider, AuthProvider, ConfirmProvider } from "./context/AppProviders.jsx";
import "./index.css";

// Provider order = dependency order:
// Redux (domain data) > Router (URLs) > Theme > Toast > Confirm > Auth (uses toast) > App
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <HashRouter>
        <ThemeProvider>
          <ToastProvider>
            <ConfirmProvider>
              <AuthProvider>
                <App />
              </AuthProvider>
            </ConfirmProvider>
          </ToastProvider>
        </ThemeProvider>
      </HashRouter>
    </Provider>
  </React.StrictMode>
);
