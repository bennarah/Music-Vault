import { Routes, Route } from 'react-router-dom';

import Layout from './components/Layout/Layout';

import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Recommendations from './pages/Recommendations/Recommendations';

import { useEffect } from "react";
import { testBackendConnection } from "./services/api";

function App() {
  useEffect(() => {
    testBackendConnection();
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/recommendations"
          element={<Recommendations />}
        />
      </Route>
    </Routes>
  );
}

export default App;
