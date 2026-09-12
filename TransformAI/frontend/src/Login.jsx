 import { useState } from "react";
import "./Login.css";

function Login({ onLogin, onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Invalid email or password."
        );
      }

      /*
       * Store authentication information
       */
      localStorage.setItem(
        "transformai_token",
        data.access_token
      );

      localStorage.setItem(
        "transformai_email",
        data.email
      );

      if (rememberMe) {
        localStorage.setItem(
          "transformai_remember",
          "true"
        );
      } else {
        localStorage.removeItem(
          "transformai_remember"
        );
      }

      /*
       * Open Dashboard
       */
      onLogin(data.email, data.access_token);

    } catch (error) {
      setError(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* ================= HEADER ================= */}

      <header className="login-header">

        <div className="brand">

          <div className="brand-icon">
            <span>✦</span>
          </div>

          <div className="brand-info">
            <div className="brand-name">
              TransformAI
            </div>

            <div className="brand-subtitle">
              AI Content Studio
            </div>
          </div>

        </div>

      </header>


      {/* ================= MAIN ================= */}

      <main className="login-main">

        {/* ================= LEFT HERO ================= */}

        <section className="login-hero">

          <div className="hero-content">

            <div className="hero-badge">
              AI DOCUMENT TRANSFORMATION
            </div>

            <h1>
              Transform your
              <br />
              documents
              <br />
              with AI.
            </h1>

            <p className="hero-description">
              Turn complex documents into clear, useful
              and professional content in seconds.
            </p>

          </div>

          <div className="hero-footer">
            <span>✦</span>
            Intelligent document transformation
          </div>

        </section>


        {/* ================= RIGHT LOGIN ================= */}

        <section className="login-side">

          <div className="login-card">

            <div className="login-card-inner">

              <h2>
                Welcome back
              </h2>

              <p className="login-subtitle">
                Sign in to continue to TransformAI.
              </p>


              {/* ================= FORM ================= */}

              <form onSubmit={handleLogin}>

                {/* EMAIL */}

                <div className="form-group">

                  <label htmlFor="email">
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    placeholder="srushti@gmail.com"
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    autoComplete="email"
                  />

                </div>


                {/* PASSWORD */}

                <div className="form-group">

                  <div className="password-heading">

                    <label htmlFor="password">
                      Password
                    </label>

                    <button
                      type="button"
                      className="forgot-password"
                      onClick={() =>
                        setError(
                          "Password reset will be available soon."
                        )
                      }
                    >
                      Forgot password?
                    </button>

                  </div>

                  <div className="password-wrapper">

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      placeholder="••••••••"
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      autoComplete="current-password"
                    />

                    <button
                      type="button"
                      className="show-password"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                    >
                      {showPassword
                        ? "Hide"
                        : "Show"}
                    </button>

                  </div>

                </div>


                {/* REMEMBER ME */}

                <div className="remember-row">

                  <label>

                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) =>
                        setRememberMe(
                          e.target.checked
                        )
                      }
                    />

                    <span>
                      Remember me
                    </span>

                  </label>

                </div>


                {/* ERROR */}

                {error && (
                  <div className="login-error">
                    {error}
                  </div>
                )}


                {/* SIGN IN */}

                <button
                  type="submit"
                  className="signin-button"
                  disabled={loading}
                >

                  {loading
                    ? "Signing in..."
                    : "Sign in"}

                  {!loading && (
                    <span className="arrow">
                      →
                    </span>
                  )}

                </button>

              </form>


              {/* ================= OR ================= */}

              <div className="or-divider">

                <div></div>

                <span>or</span>

                <div></div>

              </div>


              {/* ================= GOOGLE ================= */}

              <button
                type="button"
                className="google-button"
                onClick={() =>
                  setError(
                    "Google sign-in will be added soon."
                  )
                }
              >

                <span className="google-letter">
                  G
                </span>

                <span>
                  Continue with Google
                </span>

              </button>


              {/* ================= SIGN UP ================= */}

              <div className="signup-line">

                <span>
                  Don't have an account?
                </span>

                <button
                  type="button"
                  onClick={onSignup}
                >
                  Create account
                </button>

              </div>


              {/* ================= TERMS ================= */}

              <div className="terms">

                <p>
                  By continuing, you agree to our
                </p>

                <p>
                  Terms of Service and Privacy Policy
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Login;