import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { GoldOutlined, ExperimentOutlined, RocketOutlined } from '@ant-design/icons';

const Dashboard = () => {
    return (
        <div className="site-card-wrapper">
            <h1>Dashboard</h1>
            <Row gutter={16}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Resources"
                            value={11.28}
                            precision={2}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<GoldOutlined />}
                            suffix="M"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Research Points"
                            value={9.3}
                            precision={2}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<ExperimentOutlined />}
                            suffix="K"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Fleet Power"
                            value={93}
                            precision={0}
                            valueStyle={{ color: '#234567' }}
                            prefix={<RocketOutlined />}
                            suffix="K"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;