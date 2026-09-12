import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  Sparkles,
  LogIn,
  Clock,
  RefreshCw
} from "lucide-react";

import "./History.css";

function History({ onBack }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("transformai_token");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/history",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Could not load history."
        );
      }

      setHistory(data.history || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getActionInfo = (action) => {
    switch (action) {
      case "LOGIN":
        return {
          icon: <LogIn size={20} />,
          title: "Login",
          className: "login"
        };

      case "DOCUMENT_UPLOADED":
        return {
          icon: <FileText size={20} />,
          title: "Document Uploaded",
          className: "upload"
        };

      case "AI_TRANSFORMATION":
        return {
          icon: <Sparkles size={20} />,
          title: "AI Transformation",
          className: "transform"
        };

      default:
        return {
          icon: <ShieldCheck size={20} />,
          title: action,
          className: "security"
        };
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);

    return date.toLocaleString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="history-page">

      {/* TOP BAR */}
      <div className="history-topbar">

        <button
          className="back-button"
          onClick={onBack}
        >
          <ArrowLeft size={19} />
          Back to Dashboard
        </button>

        <button
          className="refresh-button"
          onClick={fetchHistory}
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>


      {/* HEADER */}
      <div className="history-header">

        <div className="history-icon">
          <ShieldCheck size={30} />
        </div>

        <div>
          <h1>Activity History</h1>

          <p>
            View your security activity and AI transformation history.
          </p>
        </div>

      </div>


      {/* CONTENT */}
      <div className="history-container">

        <div className="history-card">

          <div className="history-card-header">

            <div>
              <h2>Security & Activity</h2>

              <p>
                A record of activity associated with your account.
              </p>
            </div>

            <div className="activity-count">
              {history.length} Activities
            </div>

          </div>


          {/* LOADING */}
          {loading && (
            <div className="history-state">
              <RefreshCw
                size={25}
                className="loading-icon"
              />

              <p>Loading your activity...</p>
            </div>
          )}


          {/* ERROR */}
          {!loading && error && (
            <div className="history-state error-state">

              <ShieldCheck size={28} />

              <p>{error}</p>

              <button
                onClick={fetchHistory}
              >
                Try Again
              </button>

            </div>
          )}


          {/* EMPTY */}
          {!loading &&
            !error &&
            history.length === 0 && (
              <div className="history-state">

                <Clock size={30} />

                <p>
                  No activity recorded yet.
                </p>

              </div>
            )}


          {/* HISTORY LIST */}
          {!loading &&
            !error &&
            history.length > 0 && (

              <div className="history-list">

                {history.map((item) => {

                  const actionInfo =
                    getActionInfo(item.action);

                  return (
                    <div
                      className="history-item"
                      key={item.id}
                    >

                      <div
                        className={`history-action-icon ${actionInfo.className}`}
                      >
                        {actionInfo.icon}
                      </div>


                      <div className="history-details">

                        <div className="history-title-row">

                          <h3>
                            {actionInfo.title}
                          </h3>

                          <span className="history-time">
                            <Clock size={14} />
                            {formatDate(
                              item.timestamp
                            )}
                          </span>

                        </div>


                        <p>
                          {item.details ||
                            "Activity recorded successfully."}
                        </p>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

        </div>


        {/* SECURITY FLOW */}
        <div className="security-flow">

          <div className="flow-title">
            <ShieldCheck size={20} />
            <span>TransformAI Security Flow</span>
          </div>

          <div className="flow-steps">

            <div className="flow-step">
              <span>01</span>
              <p>User Login</p>
            </div>

            <div className="flow-arrow">
              →
            </div>

            <div className="flow-step">
              <span>02</span>
              <p>Secure Upload</p>
            </div>

            <div className="flow-arrow">
              →
            </div>

            <div className="flow-step">
              <span>03</span>
              <p>SHA-256</p>
            </div>

            <div className="flow-arrow">
              →
            </div>

            <div className="flow-step">
              <span>04</span>
              <p>AI Transformation</p>
            </div>

            <div className="flow-arrow">
              →
            </div>

            <div className="flow-step">
              <span>05</span>
              <p>Audit Log</p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default History;