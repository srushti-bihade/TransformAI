import { useState } from "react";
import "./Signup.css";

function Signup({ onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/signup",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Signup failed."
        );
      }

      /*
       * Signup endpoint currently creates the
       * account but does not return a JWT.
       *
       * So we save the email and go back to login.
       */

      localStorage.setItem(
        "transformai_email",
        data.email || email
      );

      alert(
        "Account created successfully! Please login."
      );

      onSignup(
        data.email || email,
        null
      );

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to create account."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">

      <div className="signup-card">

        <div className="signup-logo">
          ✦
        </div>

        <h1>
          Create your account
        </h1>

        <p className="signup-subtitle">
          Start transforming your content with AI
        </p>


        <form onSubmit={handleSubmit}>

          <div className="input-group">

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </div>


          <div className="input-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

          </div>


          <div className="input-group">

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
            />

          </div>


          {error && (
            <div className="signup-error">
              {error}
            </div>
          )}


          <button
            type="submit"
            className="signup-button"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

        </form>


        <div className="login-link">

          <span>
            Already have an account?
          </span>

          <button
            type="button"
            onClick={() =>
              onSignup("", null)
            }
          >
            Sign in
          </button>

        </div>

      </div>

    </div>
  );
}

export default Signup;