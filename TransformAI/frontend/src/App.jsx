import { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";

function App() {
  const [page, setPage] = useState(
    localStorage.getItem("transformai_token")
      ? "dashboard"
      : "login"
  );

  const [userEmail, setUserEmail] = useState(
    localStorage.getItem("transformai_email") || ""
  );

  // ================================
  // LOGIN SUCCESS
  // ================================

  const handleLogin = (email, token) => {
    localStorage.setItem(
      "transformai_email",
      email
    );

    localStorage.setItem(
      "transformai_token",
      token
    );

    setUserEmail(email);
    setPage("dashboard");
  };

  // ================================
  // SIGNUP SUCCESS
  // ================================

  const handleSignup = (email, token) => {
    localStorage.setItem(
      "transformai_email",
      email
    );

    if (token) {
      localStorage.setItem(
        "transformai_token",
        token
      );
    }

    setUserEmail(email);

    if (token) {
      setPage("dashboard");
    } else {
      setPage("login");
    }
  };

  // ================================
  // LOGOUT
  // ================================

  const handleLogout = () => {
    localStorage.removeItem(
      "transformai_email"
    );

    localStorage.removeItem(
      "transformai_token"
    );

    setUserEmail("");
    setPage("login");
  };

  // ================================
  // LOGIN PAGE
  // ================================

  if (page === "login") {
    return (
      <Login
        onLogin={handleLogin}
        onSignup={() => setPage("signup")}
      />
    );
  }

  // ================================
  // SIGNUP PAGE
  // ================================

  if (page === "signup") {
    return (
      <Signup
        onSignup={handleSignup}
      />
    );
  }

  // ================================
  // DASHBOARD
  // ================================

  return (
    <Dashboard
      email={userEmail}
      onLogout={handleLogout}
    />
  );
}

export default App;