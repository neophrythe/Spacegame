import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Row, Col, Statistic } from 'antd';
import { GoldOutlined, DollarOutlined, ThunderboltOutlined } from '@ant-design/icons';

const ResourcesOverview = () => {
    const resources = useSelector((state) => state.resources);
    const production = useSelector((state) => state.production);

    return (
        <Card title="Resources Overview">
            <Row gutter={16}>
                <Col span={8}>
                    <Statistic
                        title="Metal"
                        value={resources.metal}
                        prefix={<GoldOutlined />}
                        suffix={`/h: ${production.metal}`}
                    />
                </Col>
                <Col span={8}>
                    <Statistic
                        title="Crystal"
                        value={resources.crystal}
                        prefix={<DollarOutlined />}
                        suffix={`/h: ${production.crystal}`}
                    />
                </Col>
                <Col span={8}>
                    <Statistic
                        title="Deuterium"
                        value={resources.deuterium}
                        prefix={<ThunderboltOutlined />}
                        suffix={`/h: ${production.deuterium}`}
                    />
                </Col>
            </Row>
        </Card>
    );
};

export default ResourcesOverview;