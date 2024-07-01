import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
import BattleReportViewer from './components/BattleReportViewer';
import GalaxyView from './components/GalaxyView';
import CoordinatedAttack from './components/CoordinatedAttack';
import UserProfile from './components/UserProfile';
import GlobalChat from './components/GlobalChat';
import Tutorial from './components/Tutorial';
import PrivateRoute from './components/PrivateRoute';
import { initializeWebSocket } from './services/websocket';
import { fetchResources } from './features/resourcesSlice';
import './styles/custom.css';

const App = () => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(state => state.user.token !== null);
    const token = useSelector(state => state.user.token);

    useEffect(() => {
        if (isAuthenticated) {
            initializeWebSocket(token);
            dispatch(fetchResources());
        }
    }, [isAuthenticated, token, dispatch]);

    return (
        <>
            <Navigation />
            <Routes>
                <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/buildings" element={<PrivateRoute><Buildings /></PrivateRoute>} />
                <Route path="/fleet" element={<PrivateRoute><Fleet /></PrivateRoute>} />
                <Route path="/research" element={<PrivateRoute><Research /></PrivateRoute>} />
                <Route path="/galaxy" element={<PrivateRoute><GalaxyView /></PrivateRoute>} />
                <Route path="/clan" element={<PrivateRoute><Clan /></PrivateRoute>} />
                <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
                <Route path="/battle-report/:id" element={<PrivateRoute><BattleReportViewer /></PrivateRoute>} />
                <Route path="/coordinated-attack" element={<PrivateRoute><CoordinatedAttack /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
                <Route path="/chat" element={<PrivateRoute><GlobalChat /></PrivateRoute>} />
                <Route path="/tutorial" element={<PrivateRoute><Tutorial /></PrivateRoute>} />
                <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
            </Routes>
        </>
    );
};

export default App;
