import React, { useState, useEffect } from 'react';
import axios from 'axios';
import welcomeStyle from './Welcome.module.css';
import { useNavigate } from 'react-router-dom';

const Welcome = ({ user, setUserState }) => {
  const [books, setBooks] = useState([]); // still called "books" to preserve structure
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastKey, setLastKey] = useState(null); // for pagination
  const navigate = useNavigate();
  const limit = 12; // items per page

  // Load token and user data from localStorage on mount.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      navigate('/login', { replace: true });
    } else {
      // Load user data from localStorage if not provided.
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUserState(JSON.parse(storedUser));
      }
      setLoading(false);
    }
  }, [navigate, setUserState]);

  // Function to load paginated music entries from the /music endpoint.
  const loadMusic = (lastEvaluatedKey = null) => {
    const token = localStorage.getItem('token');
    if (token) {
      let url = `http://127.0.0.1:5000/music?limit=${limit}`;
      if (lastEvaluatedKey) {
        url += `&last_evaluated_key=${encodeURIComponent(JSON.stringify(lastEvaluatedKey))}`;
      }
      axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        // Ensure res.data.items is an array.
        const newItems = res.data.items ? res.data.items : Array.isArray(res.data) ? res.data : [];
        if (lastEvaluatedKey) {
          setBooks(prev => [...prev, ...newItems]);
        } else {
          setBooks(newItems);
        }
        setLastKey(res.data.lastEvaluatedKey);
      })
      .catch(err => {
        console.error(err);
        navigate('/login', { replace: true });
      });
    } else {
      navigate('/login', { replace: true });
    }
  };

  // Initial load on mount.
  useEffect(() => {
    loadMusic();
  }, [navigate]);

  // Handle search using the /music/query endpoint.
  const searchHandler = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    axios.get(`http://127.0.0.1:5000/music/query?title=${encodeURIComponent(search)}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const newItems = res.data.items ? res.data.items : Array.isArray(res.data) ? res.data : [];
      setBooks(newItems);
      setLastKey(res.data.lastEvaluatedKey);
    })
    .catch(err => {
      console.error(err);
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchHandler(e);
    }
  };

  // Handler for "Load More" button.
  const loadMoreHandler = () => {
    if (lastKey) {
      loadMusic(lastKey);
    }
  };

  const logout = () => {
    setUserState(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  if (loading) {
    return <div className={welcomeStyle.loading}>Loading...</div>;
  }

  return (
    <div className={welcomeStyle.container}>
      <aside className={welcomeStyle.sidebar}>
        <div className={welcomeStyle.sidebarHeader}>
          <h2>Library</h2>
          <div className={welcomeStyle.userInfo}>
            <div className={welcomeStyle.userAvatar}></div>
            <div>
              <p style={{ color: "white" }}>
                {user && user.fname} {user && user.lname}
              </p>
              <span>Online</span>
            </div>
          </div>
        </div>
        <nav className={welcomeStyle.nav}>
          <button className={welcomeStyle.navItem} onClick={() => {}}>Books</button>
          {/* Removed Add Book button */}
          <button className={welcomeStyle.navItem} onClick={logout}>Logout</button>
        </nav>
      </aside>
      <main className={welcomeStyle.mainContent}>
        <div className={welcomeStyle.searchSection}>
          <form onSubmit={searchHandler} className={welcomeStyle.searchForm}>
            <div className={welcomeStyle.searchContainer}>
              <i className="fas fa-search" style={{ margin: '0 5px', color: '#777' }}></i>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title"
                onKeyPress={handleKeyPress}
                className={welcomeStyle.searchInput}
              />
              <button type="submit" className={welcomeStyle.searchButton}>Search</button>
            </div>
          </form>
        </div>
        <section className={welcomeStyle.booksSection}>
          <div className={welcomeStyle.booksList}>
            {(books || []).map(book => (
              <div key={book.id} className={welcomeStyle.bookItem}>
                <img src={book.img_url} alt={book.title} className={welcomeStyle.bookCover} />
                <div className={welcomeStyle.bookDetails}>
                  <h3>{book.title}</h3>
                  <p>{book.author}</p>
                  <a href={book.file_url} download className={welcomeStyle.downloadButton}>
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
          {lastKey && (
            <button onClick={loadMoreHandler} className={welcomeStyle.searchButton} style={{ marginTop: '20px' }}>
              Load More
            </button>
          )}
        </section>
      </main>
    </div>
  );
};

export default Welcome;
