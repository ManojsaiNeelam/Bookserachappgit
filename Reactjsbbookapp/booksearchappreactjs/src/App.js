import React, { useState, useEffect } from "react";

function App() {
  const [token, setToken] = useState(localStorage.getItem("jwtToken") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [booksError, setBooksError] = useState("");

  useEffect(() => {
    if (token) {
      localStorage.setItem("jwtToken", token);
    } else {
      localStorage.removeItem("jwtToken");
    }
  }, [token]);

  useEffect(() => {
    async function loadRandomBooks() {
      const randomTopics = [
        "fiction",
        "science",
        "history",
        "fantasy",
        "mystery",
        "technology",
      ];
      const topic =
        randomTopics[Math.floor(Math.random() * randomTopics.length)];

      try {
        const response = await fetch(
          `https://localhost:7212/api/Books/search?title=${topic}`,
          {
            headers: {
              Accept: "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );

        if (!response.ok) throw new Error("Failed to load books");

        const data = await response.json();
        setBooks(data);
      } catch (err) {
        setBooksError(err.message);
      }
    }
    loadRandomBooks();
  }, [token]);

  const handleLogin = async () => {
    setLoadingLogin(true);
    setLoginError("");
    try {
      const response = await fetch("https://localhost:7212/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Login failed");
      }

      const data = await response.json();
      setToken(data.token);
      setShowLoginModal(false);
      setEmail("");
      setPassword("");
      setLoginError("");
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleSignup = async () => {
    setLoadingLogin(true);
    setLoginError("");
    try {
      const response = await fetch("https://localhost:7212/api/Auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username: email.split("@")[0],
          password,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Signup failed");
      }

      alert("Signup successful! You can now login.");
      setShowSignupModal(false);
      setEmail("");
      setPassword("");
      setLoginError("");
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    setBooks([]);
  };

  const handleSearch = async () => {
    setLoadingBooks(true);
    setBooksError("");
    setBooks([]);
    try {
      const params = new URLSearchParams();
      if (title) params.append("title", title);
      if (author) params.append("author", author);

      const response = await fetch(
        `https://localhost:7212/api/Books/search?${params.toString()}`,
        {
          headers: {
            Accept: "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to fetch books");
      }

      const data = await response.json();
      setBooks(data);
    } catch (err) {
      setBooksError(err.message);
    } finally {
      setLoadingBooks(false);
    }
  };

  return (
    <div style={styles.appContainer}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>📚 Book Search</h1>
        <nav>
          {!token ? (
            <>
              <button
                onClick={() => setShowLoginModal(true)}
                style={{ ...styles.button, marginRight: 10, backgroundColor: "#4CAF50" }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = "#45a049"}
                onMouseOut={e => e.currentTarget.style.backgroundColor = "#4CAF50"}
              >
                Login
              </button>
              <button
                onClick={() => setShowSignupModal(true)}
                style={{ ...styles.button, backgroundColor: "#2196F3" }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = "#0b7dda"}
                onMouseOut={e => e.currentTarget.style.backgroundColor = "#2196F3"}
              >
                Sign Up
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              style={{ ...styles.button, backgroundColor: "#f44336" }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = "#da190b"}
              onMouseOut={e => e.currentTarget.style.backgroundColor = "#f44336"}
            >
              Logout
            </button>
          )}
        </nav>
      </header>

      {/* Search */}
      <section style={styles.searchSection}>
        <input
          type="text"
          placeholder="Search by Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Search by Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          style={styles.input}
        />
        <button
          onClick={handleSearch}
          disabled={loadingBooks}
          style={{
            ...styles.button,
            backgroundColor: "#673ab7",
            padding: "10px 25px",
            fontSize: 16,
            opacity: loadingBooks ? 0.7 : 1,
            cursor: loadingBooks ? "not-allowed" : "pointer",
          }}
          onMouseOver={e => !loadingBooks && (e.currentTarget.style.backgroundColor = "#5e35b1")}
          onMouseOut={e => !loadingBooks && (e.currentTarget.style.backgroundColor = "#673ab7")}
        >
          {loadingBooks ? "Searching..." : "Search"}
        </button>
      </section>

      {/* Errors */}
      {booksError && <p style={styles.errorText}>{booksError}</p>}

      {/* Books List */}
      <ul style={styles.bookList}>
        {books.length === 0 && !loadingBooks && (
          <p style={{ textAlign: "center", color: "#555" }}>No books found. Try searching!</p>
        )}
        {books.map((book) => (
          <li key={book.title} style={styles.bookItem}>
            <div style={styles.bookDetails}>
              <h2 style={styles.bookTitle}>{book.title}</h2>
              <p><strong>Author(s):</strong> {book.authors?.join(", ") || "N/A"}</p>
              <p><strong>Published:</strong> {book.publishedDate || "N/A"}</p>
              {book.pageCount && <p><strong>Pages:</strong> {book.pageCount}</p>}
              {token ? (
                <p style={styles.description}>{book.description || "No description available."}</p>
              ) : (
                <p style={{ ...styles.description, color: "#777" }}>
                  {book.description
                    ? book.description.slice(0, 100) + "..."
                    : "Login to see full description."}
                  <button
                    onClick={() => setShowLoginModal(true)}
                    style={styles.loginPromptBtn}
                  >
                    Login
                  </button>
                </p>
              )}
              {book.infoLink && (
                <a
                  href={book.infoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.moreInfoLink}
                >
                  More Info &rarr;
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Login Modal */}
      {showLoginModal && (
        <Modal onClose={() => setShowLoginModal(false)}>
          <h2 style={styles.modalTitle}>Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.modalInput}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.modalInput}
          />
          <button
            onClick={handleLogin}
            style={styles.modalButton}
            disabled={loadingLogin}
          >
            {loadingLogin ? "Logging in..." : "Login"}
          </button>
          {loginError && <p style={styles.errorText}>{loginError}</p>}
          <button onClick={() => setShowLoginModal(false)} style={styles.modalCloseBtn}>
            Cancel
          </button>
        </Modal>
      )}

      {/* Signup Modal */}
      {showSignupModal && (
        <Modal onClose={() => setShowSignupModal(false)}>
          <h2 style={styles.modalTitle}>Sign Up</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.modalInput}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.modalInput}
          />
          <button
            onClick={handleSignup}
            style={styles.modalButton}
            disabled={loadingLogin}
          >
            {loadingLogin ? "Signing up..." : "Sign Up"}
          </button>
          {loginError && <p style={styles.errorText}>{loginError}</p>}
          <button onClick={() => setShowSignupModal(false)} style={styles.modalCloseBtn}>
            Cancel
          </button>
        </Modal>
      )}
    </div>
  );
}

// Modal component
function Modal({ children, onClose }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div
        style={styles.modalContent}
        onClick={(e) => e.stopPropagation()} // prevent close on modal content click
      >
        {children}
      </div>
    </div>
  );
}

const styles = {
  appContainer: {
    maxWidth: 900,
    margin: "40px auto",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "0 20px",
    color: "#333",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    borderBottom: "3px solid #673ab7",
    paddingBottom: 10,
  },
  title: {
    margin: 0,
    color: "#673ab7",
    fontWeight: "bold",
  },
  button: {
    padding: "10px 20px",
    border: "none",
    borderRadius: 5,
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  searchSection: {
    display: "flex",
    alignItems: "center",
    marginBottom: 30,
    gap: 15,
    flexWrap: "wrap",
  },
  input: {
    flex: "1 1 150px",
    padding: 10,
    fontSize: 16,
    borderRadius: 6,
    border: "2px solid #ddd",
    transition: "border-color 0.3s",
  },
  errorText: {
    color: "#d32f2f",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  bookList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  bookItem: {
    backgroundColor: "#fafafa",
    borderRadius: 10,
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    padding: 20,
    marginBottom: 25,
    transition: "transform 0.2s",
  },
  bookItemHover: {
    transform: "scale(1.02)",
  },
  bookDetails: {
    maxWidth: 700,
  },
  bookTitle: {
    margin: "0 0 10px",
    color: "#673ab7",
  },
  description: {
    fontSize: 15,
    lineHeight: 1.5,
    margin: "10px 0",
  },
  loginPromptBtn: {
    marginLeft: 10,
    backgroundColor: "#2196F3",
    border: "none",
    borderRadius: 4,
    color: "white",
    padding: "5px 10px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: 14,
    transition: "background-color 0.3s",
  },
  moreInfoLink: {
    display: "inline-block",
    marginTop: 8,
    color: "#673ab7",
    fontWeight: "bold",
    textDecoration: "none",
    fontSize: 15,
  },

  // Modal styles
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 8,
    width: 350,
    boxShadow: "0 8px 16px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
  },
  modalTitle: {
    marginBottom: 20,
    color: "#673ab7",
    fontWeight: "bold",
    fontSize: 24,
    textAlign: "center",
  },
  modalInput: {
    marginBottom: 15,
    padding: 12,
    fontSize: 16,
    borderRadius: 6,
    border: "2px solid #ddd",
    outline: "none",
    transition: "border-color 0.3s",
  },
  modalButton: {
    padding: "12px 0",
    backgroundColor: "#673ab7",
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    marginBottom: 10,
    transition: "background-color 0.3s",
  },
  modalCloseBtn: {
    padding: "10px 0",
    backgroundColor: "#bbb",
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};

export default App;
