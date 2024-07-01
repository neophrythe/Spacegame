import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from 'antd';
import { HomeOutlined, BuildOutlined, ExperimentOutlined, RocketOutlined, GlobalOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/userSlice';

const Navigation = () => {
    const isAuthenticated = useSelector(state => state.user.token !== null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const items = [
        { key: 'home', icon: <HomeOutlined />, label: <Link to="/">Dashboard</Link> },
        { key: 'buildings', icon: <BuildOutlined />, label: <Link to="/buildings">Buildings</Link> },
        { key: 'research', icon: <ExperimentOutlined />, label: <Link to="/research">Research</Link> },
        { key: 'fleet', icon: <RocketOutlined />, label: <Link to="/fleet">Fleet</Link> },
        { key: 'galaxy', icon: <GlobalOutlined />, label: <Link to="/galaxy">Galaxy</Link> },
    ];

    if (!isAuthenticated) {
        items.push(
            { key: 'login', label: <Link to="/login">Login</Link> },
            { key: 'register', label: <Link to="/register">Register</Link> }
        );
    } else {
        items.push(
            { key: 'profile', icon: <UserOutlined />, label: <Link to="/profile">Profile</Link> },
            { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout }
        );
    }

    return (
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['home']} items={items} />
    );
};

export default Navigation;