import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Table, message } from 'antd';
import { coordinatedAttackAPI } from '../api';

const { Option } = Select;

const CoordinatedAttack = () => {
    const [attacks, setAttacks] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchAttacks();
    }, []);

    const fetchAttacks = async () => {
        try {
            const response = await coordinatedAttackAPI.listCoordinatedAttacks();
            setAttacks(response.data);
        } catch (error) {
            console.error('Error fetching coordinated attacks:', error);
        }
    };

    const onFinish = async (values) => {
        try {
            await coordinatedAttackAPI.createCoordinatedAttack(values);
            message.success('Coordinated attack created successfully');
            form.resetFields();
            fetchAttacks();
        } catch (error) {
            message.error('Failed to create coordinated attack');
        }
    };

    const joinAttack = async (attackCode) => {
        try {
            await coordinatedAttackAPI.joinCoordinatedAttack({ attackCode });
            message.success('Joined coordinated attack successfully');
            fetchAttacks();
        } catch (error) {
            message.error('Failed to join coordinated attack');
        }
    };

    const columns = [
        { title: 'Attack Code', dataIndex: 'attackCode', key: 'attackCode' },
        { title: 'Target Planet', dataIndex: ['targetPlanet', 'name'], key: 'targetPlanet' },
        { title: 'Arrival Time', dataIndex: 'arrivalTime', key: 'arrivalTime', render: (text) => new Date(text).toLocaleString() },
        { title: 'Status', dataIndex: 'status', key: 'status' },
        { title: 'Actions', key: 'actions', render: (_, record) => (
                <Button onClick={() => joinAttack(record.attackCode)} disabled={record.status !== 'pending'}>Join</Button>
            )},
    ];

    return (
        <div>
            <h2>Create Coordinated Attack</h2>
            <Form form={form} onFinish={onFinish}>
                <Form.Item name="targetPlanetId" rules={[{ required: true }]}>
                    <Select placeholder="Select target planet">
                        {/* Populate with available planets */}
                    </Select>
                </Form.Item>
                <Form.Item name="speedPercentage" rules={[{ required: true }]}>
                    <Select placeholder="Select speed percentage">
                        {[100, 90, 80, 70, 60, 50, 40, 30, 20, 10].map(speed => (
                            <Option key={speed} value={speed}>{speed}%</Option>
                        ))}
                    </Select>
                </Form.Item>
                {/* Add more form items for fleet selection */}
                <Form.Item>
                    <Button type="primary" htmlType="submit">Create Attack</Button>
                </Form.Item>
            </Form>

            <h2>Coordinated Attacks</h2>
            <Table dataSource={attacks} columns={columns} />
        </div>
    );
};

export default CoordinatedAttack;