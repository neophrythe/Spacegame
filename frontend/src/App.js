import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Buildings from './components/Buildings';
import Fleet from './components/Fleet';
import Research from './components/Research';
import Galaxy from './components/Galaxy';
import Login from './components/Login';
import Register from './components/Register';
import Clan from './components/Clan';
import Notifications from './components/Notifications';

const App = () => {
    const isAuthenticated = useSelector(state => state.user.token !== null);

    return (
        <>
            {isAuthenticated && <Navigation />}
            <Routes>
                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
                <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
                <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="/buildings" element={isAuthenticated ? <Buildings /> : <Navigate to="/login" />} />
                <Route path="/fleet" element={isAuthenticated ? <Fleet /> : <Navigate to="/login" />} />
                <Route path="/research" element={isAuthenticated ? <Research /> : <Navigate to="/login" />} />
                <Route path="/galaxy" element={isAuthenticated ? <Galaxy /> : <Navigate to="/login" />} />
                <Route path="/clan" element={isAuthenticated ? <Clan /> : <Navigate to="/login" />} />
                <Route path="/notifications" element={isAuthenticated ? <Notifications /> : <Navigate to="/login" />} />
            </Routes>
        </>
    );
};

export default App;