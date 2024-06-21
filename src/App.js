import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Layout } from 'antd';
import { Provider } from 'react-redux';
import store from './store';

import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Buildings from './components/Buildings';
import Research from './components/Research';
import Fleet from './components/Fleet';
import Galaxy from './components/Galaxy';
import Notifications from './components/Notifications';
import Login from './components/Login';
import Register from './components/Register';
import Clan from './components/Clan';

const { Header, Content, Footer } = Layout;

function App() {
    return (
        <Provider store={store}>
            <Router>
                <Layout className="layout" style={{ minHeight: '100vh' }}>
                    <Header>
                        <Navigation />
                    </Header>
                    <Content style={{ padding: '0 50px' }}>
                        <Notifications />
                        <Switch>
                            <Route exact path="/" component={Dashboard} />
                            <Route path="/buildings" component={Buildings} />
                            <Route path="/research" component={Research} />
                            <Route path="/fleet" component={Fleet} />
                            <Route path="/galaxy" component={Galaxy} />
                            <Route path="/login" component={Login} />
                            <Route path="/register" component={Register} />
                            <Route path="/clan" component={Clan} />
                        </Switch>
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>Space Strategy Game ©2023</Footer>
                </Layout>
            </Router>
        </Provider>
    );
}

export default App;