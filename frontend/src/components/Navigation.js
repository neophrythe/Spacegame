import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';
import { HomeOutlined, BuildOutlined, ExperimentOutlined, RocketOutlined, GlobalOutlined } from '@ant-design/icons';

const Navigation = () => {
    return (
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['home']}>
            <Menu.Item key="home" icon={<HomeOutlined />}>
                <Link to="/">Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="buildings" icon={<BuildOutlined />}>
                <Link to="/buildings">Buildings</Link>
            </Menu.Item>
            <Menu.Item key="research" icon={<ExperimentOutlined />}>
                <Link to="/research">Research</Link>
            </Menu.Item>
            <Menu.Item key="fleet" icon={<RocketOutlined />}>
                <Link to="/fleet">Fleet</Link>
            </Menu.Item>
            <Menu.Item key="galaxy" icon={<GlobalOutlined />}>
                <Link to="/galaxy">Galaxy</Link>
            </Menu.Item>
        </Menu>
    );
};

export default Navigation;