import { useState } from "react";
import {
  House,
  UserRound,
  Sparkles,
  Upload,
  ArrowRight,
  Copy,
  RotateCcw,
  LogOut,
  CheckCircle2,
  WandSparkles,
  Video,
  FileText,
  Link,
  ShieldCheck,
} from "lucide-react";

import "./App.css";

function Dashboard({ email, onLogout }) {
  const [activePage, setActivePage] = useState("home");

  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [videoUrl, setVideoUrl] = useState("");
  const [videoProcessing, setVideoProcessing] = useState(false);

  const [outputType, setOutputType] = useState("LinkedIn Post");
  const [audience, setAudience] = useState("General Audience");
  const [tone, setTone] = useState("Professional");
  const [language, setLanguage] = useState("English");
  const [detailLevel, setDetailLevel] = useState("Medium");
  const [objective, setObjective] = useState("Inform");
  const [style, setStyle] = useState("Clear and concise");

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("transformai_token");

  // =====================================================
  // DOCUMENT UPLOAD
  // =====================================================

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setError("");
    setUploading(true);
    setOutput("");
    setSuggestions([]);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to upload file."
        );
      }

      setText(data.text || "");
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Could not upload the file."
      );
    } finally {
      setUploading(false);
    }
  };

  // =====================================================
  // VIDEO URL → TEXT
  // =====================================================

  const handleVideoUrl = async () => {
    if (!videoUrl.trim()) {
      setError("Please paste a video URL.");
      return;
    }

    setError("");
    setVideoProcessing(true);
    setOutput("");
    setSuggestions([]);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/video-url-to-text",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            url: videoUrl.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to convert video to text."
        );
      }

      setText(data.transcript || "");
      setFile(null);

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Could not convert the video to text."
      );
    } finally {
      setVideoProcessing(false);
    }
  };

  // =====================================================
  // AI TRANSFORMATION
  // =====================================================

  const handleTransform = async () => {
    if (!text.trim()) {
      setError(
        "Please upload a document, add a video link or enter some text."
      );
      return;
    }

    setLoading(true);
    setError("");
    setOutput("");
    setSuggestions([]);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/transform",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text,
            output_type: outputType,
            audience,
            tone,
            language,
            detail_level: detailLevel,
            objective,
            style,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Transformation failed."
        );
      }

      setOutput(
        data.output || data.result || ""
      );

      setSuggestions(
        data.suggestions || []
      );

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "AI transformation failed. Please make sure Ollama is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // COPY OUTPUT
  // =====================================================

  const handleCopy = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      alert("Output copied successfully!");
    } catch (err) {
      console.error(err);
      alert("Could not copy the output.");
    }
  };

  // =====================================================
  // RESET
  // =====================================================

  const handleReset = () => {
    setFile(null);
    setText("");
    setOutput("");
    setSuggestions([]);
    setVideoUrl("");
    setError("");
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("transformai_email");
    localStorage.removeItem("transformai_token");
    localStorage.removeItem("transformai_remember");

    onLogout();
  };

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="dashboard-layout">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="dashboard-sidebar">

        <div className="sidebar-logo">

          <div className="logo-icon">
            <Sparkles size={20} />
          </div>

          <div>
            <h2>TransformAI</h2>
            <span>AI Content Studio</span>
          </div>

        </div>

        <nav className="sidebar-nav">

          <button
            className={
              activePage === "home"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() => setActivePage("home")}
          >
            <House size={18} />
            <span>Home</span>
          </button>

          <button
            className={
              activePage === "profile"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() => setActivePage("profile")}
          >
            <UserRound size={18} />
            <span>Profile</span>
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="ai-status">

            <div className="status-dot"></div>

            <div>
              <strong>AI Engine Ready</strong>
              <small>Ollama · Llama 3.2</small>
            </div>

          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="dashboard-main">

        {activePage === "profile" ? (

          /* =================================================
             PROFILE
          ================================================= */

          <section className="profile-page">

            <div className="dashboard-header">

              <div>

                <p className="eyebrow">
                  ACCOUNT
                </p>

                <h1>
                  Your Profile
                </h1>

                <p className="header-description">
                  Manage your TransformAI workspace.
                </p>

              </div>

            </div>

            <div className="profile-grid">

              <div className="profile-card profile-main-card">

                <div className="profile-avatar">
                  {email
                    ? email.charAt(0).toUpperCase()
                    : "U"}
                </div>

                <h2>
                  {email || "TransformAI User"}
                </h2>

                <p className="profile-email">
                  {email || "No email available"}
                </p>

                <div className="profile-status">
                  <CheckCircle2 size={13} />
                  Active Account
                </div>

              </div>

              <div className="profile-card">

                <h3>
                  Account Information
                </h3>

                <div className="profile-info-row">
                  <span>Email</span>

                  <strong>
                    {email || "Not available"}
                  </strong>
                </div>

                <div className="profile-info-row">
                  <span>Workspace</span>

                  <strong>
                    Personal
                  </strong>
                </div>

                <div className="profile-info-row">
                  <span>AI Engine</span>

                  <strong>
                    Ollama
                  </strong>
                </div>

                <div className="profile-info-row">
                  <span>Model</span>

                  <strong>
                    Llama 3.2 3B
                  </strong>
                </div>

              </div>

              <div className="profile-card">

                <h3>
                  About TransformAI
                </h3>

                <p className="profile-description">
                  TransformAI converts documents,
                  videos and information into useful
                  communication formats using
                  artificial intelligence.
                </p>

                <div className="profile-features">

                  <span>
                    Document Transformation
                  </span>

                  <span>
                    Video Transcription
                  </span>

                  <span>
                    AI-Powered Content
                  </span>

                  <span>
                    Multiple Output Formats
                  </span>

                </div>

              </div>

            </div>

          </section>

        ) : (

          /* =================================================
             HOME
          ================================================= */

          <>

            <header className="dashboard-header">

              <div>

                <p className="eyebrow">
                  AI CONTENT STUDIO
                </p>

                <h1>
                  Transform your information.
                </h1>

                <p className="header-description">
                  Turn documents, videos and ideas
                  into polished communication content
                  in seconds.
                </p>

              </div>

              <div className="header-user">

                <div className="header-avatar">
                  {email
                    ? email.charAt(0).toUpperCase()
                    : "U"}
                </div>

                <div>

                  <strong>
                    {email || "User"}
                  </strong>

                  <span>
                    Personal Workspace
                  </span>

                </div>

              </div>

            </header>

            <section className="workspace-grid">

              {/* =================================================
                  LEFT
              ================================================= */}

              <div className="workspace-left">

                {/* =================================================
                    SOURCE
                ================================================= */}

                <div className="dashboard-card">

                  <div className="card-header">

                    <div>

                      <span className="card-number">
                        01
                      </span>

                      <div>

                        <h2>
                          Source Content
                        </h2>

                        <p>
                          Upload a document, add a video
                          link or paste your information.
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* DOCUMENT UPLOAD */}

                  <label className="upload-box">

                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileChange}
                    />

                    <div className="upload-icon">
                      <Upload size={21} />
                    </div>

                    <strong>
                      {file
                        ? file.name
                        : "Upload your document"}
                    </strong>

                    <span>
                      PDF, DOCX or TXT
                    </span>

                    {uploading && (
                      <small>
                        Processing document...
                      </small>
                    )}

                  </label>

                  {/* VIDEO URL */}

                  <div className="video-url-box">

                    <div className="video-url-icon">
                      <Video size={21} />
                    </div>

                    <div className="video-url-content">

                      <strong>
                        Add a video link
                      </strong>

                      <span>
                        Paste a YouTube video URL
                      </span>

                      <div className="video-url-input-row">

                        <div className="video-url-input-wrapper">

                          <Link size={16} />

                          <input
                            type="url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={videoUrl}
                            onChange={(e) =>
                              setVideoUrl(e.target.value)
                            }
                            disabled={videoProcessing}
                          />

                        </div>

                        <button
                          className="video-url-button"
                          onClick={handleVideoUrl}
                          disabled={
                            videoProcessing ||
                            !videoUrl.trim()
                          }
                        >

                          {videoProcessing ? (
                            <>
                              <span className="spinner"></span>
                              Converting...
                            </>
                          ) : (
                            <>
                              <FileText size={15} />
                              Convert
                            </>
                          )}

                        </button>

                      </div>

                      {videoProcessing && (
                        <small>
                          Downloading audio and transcribing with Whisper...
                        </small>
                      )}

                    </div>

                  </div>

                  <div className="divider">
                    <span>OR</span>
                  </div>

                  <textarea
                    className="source-textarea"
                    placeholder="Paste your article, report, research, announcement or any other content here..."
                    value={text}
                    onChange={(e) =>
                      setText(e.target.value)
                    }
                  />

                  {/* SOURCE READY INDICATOR */}

                  {text && (
                    <div className="source-ready-indicator">
                      <FileText size={15} />
                      Source content ready
                    </div>
                  )}

                </div>

                {/* =================================================
                    SETTINGS
                ================================================= */}

                <div className="dashboard-card">

                  <div className="card-header">

                    <div>

                      <span className="card-number">
                        02
                      </span>

                      <div>

                        <h2>
                          Transformation Settings
                        </h2>

                        <p>
                          Control how TransformAI
                          creates your content.
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="controls-grid">

                    {/* OUTPUT TYPE */}

                    <div className="control-group">

                      <label>
                        Output Type
                      </label>

                      <select
                        value={outputType}
                        onChange={(e) =>
                          setOutputType(e.target.value)
                        }
                      >

                        <option>
                          LinkedIn Post
                        </option>

                        <option>
                          Twitter/X Thread
                        </option>

                        <option>
                          Executive Summary
                        </option>

                        <option>
                          Advisory
                        </option>

                        <option>
                          Presentation
                        </option>

                        <option>
                          Video Script
                        </option>

                        <option>
                          Infographic Content
                        </option>

                      </select>

                    </div>

                    {/* AUDIENCE */}

                    <div className="control-group">

                      <label>
                        Target Audience
                      </label>

                      <select
                        value={audience}
                        onChange={(e) =>
                          setAudience(e.target.value)
                        }
                      >

                        <option>
                          General Audience
                        </option>

                        <option>
                          Students
                        </option>

                        <option>
                          Professionals
                        </option>

                        <option>
                          Executives
                        </option>

                        <option>
                          Technical Audience
                        </option>

                      </select>

                    </div>

                    {/* TONE */}

                    <div className="control-group">

                      <label>
                        Tone
                      </label>

                      <select
                        value={tone}
                        onChange={(e) =>
                          setTone(e.target.value)
                        }
                      >

                        <option>
                          Professional
                        </option>

                        <option>
                          Friendly
                        </option>

                        <option>
                          Formal
                        </option>

                        <option>
                          Conversational
                        </option>

                        <option>
                          Persuasive
                        </option>

                      </select>

                    </div>

                    {/* LANGUAGE */}

                    <div className="control-group">

                      <label>
                        Language
                      </label>

                      <select
                        value={language}
                        onChange={(e) =>
                          setLanguage(e.target.value)
                        }
                      >

                        <option>
                          English
                        </option>

                        <option>
                          Hindi
                        </option>

                        <option>
                          Marathi
                        </option>

                      </select>

                    </div>

                    {/* DETAIL LEVEL */}

                    <div className="control-group">

                      <label>
                        Detail Level
                      </label>

                      <select
                        value={detailLevel}
                        onChange={(e) =>
                          setDetailLevel(e.target.value)
                        }
                      >

                        <option>
                          Short
                        </option>

                        <option>
                          Medium
                        </option>

                        <option>
                          Detailed
                        </option>

                      </select>

                    </div>

                    {/* OBJECTIVE */}

                    <div className="control-group">

                      <label>
                        Communication Objective
                      </label>

                      <select
                        value={objective}
                        onChange={(e) =>
                          setObjective(e.target.value)
                        }
                      >

                        <option>
                          Inform
                        </option>

                        <option>
                          Educate
                        </option>

                        <option>
                          Promote
                        </option>

                        <option>
                          Explain
                        </option>

                        <option>
                          Summarize
                        </option>

                      </select>

                    </div>

                  </div>

                  {/* STYLE */}

                  <div className="style-section">

                    <label>
                      Writing Style
                    </label>

                    <div className="style-options">

                      {[
                        "Clear and concise",
                        "Engaging",
                        "Storytelling",
                        "Data-driven",
                      ].map((item) => (

                        <button
                          key={item}
                          className={
                            style === item
                              ? "style-tag selected"
                              : "style-tag"
                          }
                          onClick={() =>
                            setStyle(item)
                          }
                        >
                          {item}
                        </button>

                      ))}

                    </div>

                  </div>

                  {/* TRANSFORM BUTTON */}

                  <button
                    className="transform-button"
                    onClick={handleTransform}
                    disabled={
                      loading ||
                      videoProcessing ||
                      uploading
                    }
                  >

                    {loading ? (

                      <>
                        <span className="spinner"></span>
                        Transforming...
                      </>

                    ) : (

                      <>
                        <WandSparkles size={17} />
                        Transform with AI
                        <ArrowRight size={17} />
                      </>

                    )}

                  </button>

                  {/* ERROR */}

                  {error && (
                    <div className="error-message">
                      {error}
                    </div>
                  )}

                </div>

              </div>

              {/* =================================================
                  RIGHT
              ================================================= */}

              <div className="workspace-right">

                {/* OUTPUT */}

                <div className="output-card">

                  <div className="output-header">

                    <div>

                      <span className="card-number">
                        03
                      </span>

                      <h2>
                        Generated Output
                      </h2>

                    </div>

                    {output && (

                      <button
                        className="copy-button"
                        onClick={handleCopy}
                      >
                        <Copy size={13} />
                        Copy
                      </button>

                    )}

                  </div>

                  <div className="output-content">

                    {loading ? (

                      <div className="loading-state">

                        <div className="large-spinner"></div>

                        <h3>
                          TransformAI is working...
                        </h3>

                        <p>
                          Analyzing your content and
                          generating the requested format.
                        </p>

                      </div>

                    ) : output ? (

                      <div className="generated-output">
                        {output}
                      </div>

                    ) : (

                      <div className="empty-output">

                        <div className="empty-icon">
                          <Sparkles size={23} />
                        </div>

                        <h3>
                          Your output will appear here
                        </h3>

                        <p>
                          Add your source content,
                          choose your settings and
                          click Transform with AI.
                        </p>

                      </div>

                    )}

                  </div>

                </div>

                {/* SUGGESTIONS */}

                {suggestions.length > 0 && (

                  <div className="suggestions-card">

                    <div className="suggestions-title">

                      <Sparkles size={14} />

                      AI Suggestions

                    </div>

                    {suggestions.map(
                      (suggestion, index) => (

                        <div
                          className="suggestion-item"
                          key={index}
                        >

                          <span>
                            {index + 1}
                          </span>

                          <p>
                            {suggestion}
                          </p>

                        </div>

                      )
                    )}

                  </div>

                )}

                {/* RESET */}

                {(text || output || videoUrl) && (

                  <button
                    className="reset-button"
                    onClick={handleReset}
                  >
                    <RotateCcw size={13} />
                    Clear Workspace
                  </button>

                )}

                {/* =================================================
                    SECURITY STATUS
                ================================================= */}

                <div className="security-status-card">

                  <div className="security-status-header">

                    <div className="security-status-icon">
                      <ShieldCheck size={20} />
                    </div>

                    <div className="security-status-title">

                      <h3>
                        Security & System Status
                      </h3>

                      <p>
                        Your workspace is protected
                      </p>

                    </div>

                    <div className="security-active">
                      <span></span>
                      Active
                    </div>

                  </div>

                  <div className="security-status-grid">

                    <div className="security-item">

                      <CheckCircle2 size={17} />

                      <div>
                        <strong>
                          Authentication
                        </strong>

                        <span>
                          Active
                        </span>
                      </div>

                    </div>

                    <div className="security-item">

                      <CheckCircle2 size={17} />

                      <div>
                        <strong>
                          API Protection
                        </strong>

                        <span>
                          Enabled
                        </span>
                      </div>

                    </div>

                    <div className="security-item">

                      <CheckCircle2 size={17} />

                      <div>
                        <strong>
                          Password Security
                        </strong>

                        <span>
                          Protected
                        </span>
                      </div>

                    </div>

                    {/* AUDIT LOGS — NOT IMPLEMENTED YET */}

                    <div className="security-item audit-item">

                      <CheckCircle2 size={17} />

                      <div>
                        <strong>
                          Audit Logs
                        </strong>

                        <span className="audit-coming-soon">
                          Coming Soon
                        </span>
                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </section>

          </>

        )}

      </main>

    </div>
  );
}

export default Dashboard;