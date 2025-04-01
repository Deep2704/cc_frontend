import "./App.css";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Welcome from "./components/Welcome/Welcome";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

function App() {
  const [userState, setUserState] = useState(null);

  useEffect(() => {
    console.log("Current user state in App:", userState);
  }, [userState]);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              userState ? (
                <Welcome user={userState} setUserState={setUserState} />
              ) : (
                <Login setUserState={setUserState} />
              )
            }
          />
          <Route path="/login" element={<Login setUserState={setUserState} />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/welcome" element={<Welcome user={userState} setUserState={setUserState} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
