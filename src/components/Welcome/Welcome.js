import React, { useState, useEffect } from 'react';
import axios from 'axios';
import welcomeStyle from './Welcome.module.css';
import { useNavigate } from 'react-router-dom';

const Welcome = ({ user, setUserState }) => {
  const [albums, setAlbums] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [searchFields, setSearchFields] = useState({ title: '', artist: '', album: '', year: '' });
  const [loading, setLoading] = useState(true);
  const [lastKey, setLastKey] = useState(null);
  const [showingSubscriptions, setShowingSubscriptions] = useState(false);
  const navigate = useNavigate();
  const limit = 12;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      navigate('/login', { replace: true });
    } else {
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUserState(JSON.parse(storedUser));
      setLoading(false);
      loadAlbums();
      loadSubscriptions();
    }
  }, [navigate, setUserState]);

  const loadAlbums = (lastEvaluatedKey = null) => {
    const token = localStorage.getItem('token');
    let url = `http://127.0.0.1:5000/music?limit=${limit}`;
    if (lastEvaluatedKey) {
      url += `&last_evaluated_key=${encodeURIComponent(JSON.stringify(lastEvaluatedKey))}`;
    }
    axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const newItems = res.data.items || [];
        setAlbums(prev => lastEvaluatedKey ? [...prev, ...newItems] : newItems);
        setLastKey(res.data.lastEvaluatedKey);
      })
      .catch(err => {
        console.error(err);
        navigate('/login', { replace: true });
      });
  };

  const loadSubscriptions = () => {
    const token = localStorage.getItem('token');
    axios.get('http://127.0.0.1:5000/subscriptions', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setSubscriptions(res.data.albums || []))
    .catch(err => {
      console.error('Failed to load subscriptions:', err);
      if (err.response?.status === 401) logout();
    });
  };

  const handleSubscribe = (compositeId) => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('❌ No token found in localStorage');
      alert('Please log in again.');
      navigate('/login', { replace: true });
      return;
    }

    if (!compositeId) {
      console.error('❌ compositeId is missing');
      alert('Invalid album selection.');
      return;
    }

    const payload = { composite_id: compositeId };
    console.log("📦 Sending to backend:", payload);

    axios.post('http://127.0.0.1:5000/subscribe', payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      alert(res.data.message);
      loadSubscriptions();
    })
    .catch(err => {
      console.error('🔥 Subscribe toggle failed:', err.response?.data || err);
      if (err.response?.status === 401) {
        alert('Session expired. Please log in again.');
        logout();
      } else {
        alert('Error updating subscription.');
      }
    });
  };

  const isSubscribed = (compositeId) => {
    return subscriptions.some(sub => sub.composite_id === compositeId);
  };

  const searchHandler = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    let url = `http://127.0.0.1:5000/music/query`;
    const searchParams = new URLSearchParams();

    // Add search fields only if they are provided
    if (searchFields.title.trim()) searchParams.append('title', searchFields.title);
    if (searchFields.artist.trim()) searchParams.append('artist', searchFields.artist);
    if (searchFields.album.trim()) searchParams.append('album', searchFields.album);
    if (searchFields.year.trim()) searchParams.append('year', searchFields.year);

    if ([...searchParams].length > 0) {
      url += `?${searchParams.toString()}`;
    }
    axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setAlbums(res.data.items || res.data);
        setLastKey(null);
      })
      .catch(err => console.error(err));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') searchHandler(e);
  };

  const loadMoreHandler = () => {
    if (lastKey) loadAlbums(lastKey);
  };

  const logout = () => {
    setUserState(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const handleToggleView = () => {
    setShowingSubscriptions(prev => !prev);
    if (!showingSubscriptions) loadSubscriptions();
  };

  const displayedAlbums = showingSubscriptions ? subscriptions : albums;

  if (loading) return <div className={welcomeStyle.loading}>Loading...</div>;

  return (
    <div className={welcomeStyle.container}>
      <aside className={welcomeStyle.sidebar}>
        <div className={welcomeStyle.sidebarHeader}>
          <h2>Library</h2>
          <div className={welcomeStyle.userInfo}>
            <div className={welcomeStyle.userAvatar}></div>
            <div>
              <p style={{ color: "white" }}>{user?.user_name}</p>
              <span>Online</span>
            </div>
          </div>
        </div>
        <nav className={welcomeStyle.nav}>
          <button className={welcomeStyle.navItem} onClick={() => setShowingSubscriptions(false)}>Albums</button>
          <button className={welcomeStyle.navItem} onClick={handleToggleView}>Subscriptions</button>
          <button className={welcomeStyle.navItem} onClick={logout}>Logout</button>
        </nav>
      </aside>

      <main className={welcomeStyle.mainContent}>
        <div className={welcomeStyle.searchSection}>
          {/* <div>hi</div> */}
          <main onSubmit={searchHandler} className={welcomeStyle.searchForm}>
         
            <div className={welcomeStyle.searchContainer}>
              <input
                type="text"
                value={searchFields.title}
                onChange={(e) => setSearchFields({ ...searchFields, title: e.target.value })}
                placeholder="Search by title"
                className={welcomeStyle.searchInput}
              />
              <input
                type="text"
                value={searchFields.artist}
                onChange={(e) => setSearchFields({ ...searchFields, artist: e.target.value })}
                placeholder="Search by artist"
                className={welcomeStyle.searchInput}
              />
              <input
                type="text"
                value={searchFields.album}
                onChange={(e) => setSearchFields({ ...searchFields, album: e.target.value })}
                placeholder="Search by album"
                className={welcomeStyle.searchInput}
              />
              <input
                type="text"
                value={searchFields.year}
                onChange={(e) => setSearchFields({ ...searchFields, year: e.target.value })}
                placeholder="Search by year"
                className={welcomeStyle.searchInput}
              />
              <button type="submit" className={welcomeStyle.searchButton}>Search</button>
            </div>
          </main>
        </div>
        <section className={welcomeStyle.booksSection}>
          <div className={welcomeStyle.booksList}>
            {(displayedAlbums || []).map(album => (
              <div key={album.composite_id} className={welcomeStyle.bookItem}>
                <img src={album.img_url} alt={album.title} className={welcomeStyle.bookCover} />
                <div className={welcomeStyle.bookDetails}>
                  <h3>{album.title}</h3>
                  <p>{album.artist}</p>
                  <p>{album.album}</p>
                  <p>{album.year}</p>
                  <button
                    className={welcomeStyle.downloadButton}
                    onClick={() => handleSubscribe(album.composite_id)}
                  >
                    {isSubscribed(album.composite_id) ? 'Unsubscribe' : 'Subscribe'}
                  </button>
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
