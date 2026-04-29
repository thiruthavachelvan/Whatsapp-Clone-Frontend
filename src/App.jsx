import React, { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './components/Login';
import Home from './pages/Home';

function App() {
  const { currentUser } = useContext(AuthContext);

  return (
    <>
      {currentUser ? <Home /> : <Login />}
    </>
  );
}

export default App;
