import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
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
        <Router>
            {isAuthenticated && <Navigation />}
            <Switch>
                <Route exact path="/login" component={Login} />
                <Route exact path="/register" component={Register} />
                <PrivateRoute exact path="/" component={Dashboard} />
                <PrivateRoute exact path="/buildings" component={Buildings} />
                <PrivateRoute exact path="/fleet" component={Fleet} />
                <PrivateRoute exact path="/research" component={Research} />
                <PrivateRoute exact path="/galaxy" component={GalaxyView} />
                <PrivateRoute exact path="/clan" component={Clan} />
                <PrivateRoute exact path="/notifications" component={Notifications} />
                <PrivateRoute exact path="/battle-report/:id" component={BattleReportViewer} />
                <PrivateRoute exact path="/coordinated-attack" component={CoordinatedAttack} />
                <PrivateRoute exact path="/profile" component={UserProfile} />
                <PrivateRoute exact path="/chat" component={GlobalChat} />
                <PrivateRoute exact path="/tutorial" component={Tutorial} />
            </Switch>
        </Router>
    );
};

export default App;