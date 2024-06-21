import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createClan, joinClan, leaveClan, getClanInfo } from '../features/clanSlice';
import { Button, Form, Input, List } from 'antd';

const Clan = () => {
    const dispatch = useDispatch();
    const { currentClan, loading } = useSelector((state) => state.clan);
    const [form] = Form.useForm();

    useEffect(() => {
        if (currentClan) {
            dispatch(getClanInfo(currentClan._id));
        }
    }, [dispatch, currentClan]);

    const onCreateClan = (values) => {
        dispatch(createClan(values));
    };

    const onJoinClan = (values) => {
        dispatch(joinClan(values.clanId));
    };

    const onLeaveClan = () => {
        dispatch(leaveClan());
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (currentClan) {
        return (
            <div>
                <h2>{currentClan.name} [{currentClan.tag}]</h2>
                <p>Leader: {currentClan.leader.username}</p>
                <h3>Members:</h3>
                <List
                    dataSource={currentClan.members}
                    renderItem={member => (
                        <List.Item>{member.username}</List.Item>
                    )}
                />
                <Button onClick={onLeaveClan}>Leave Clan</Button>
            </div>
        );
    }

    return (
        <div>
            <h2>Create a Clan</h2>
            <Form form={form} onFinish={onCreateClan}>
                <Form.Item name="name" rules={[{ required: true }]}>
                    <Input placeholder="Clan Name" />
                </Form.Item>
                <Form.Item name="tag" rules={[{ required: true, max: 5 }]}>
                    <Input placeholder="Clan Tag (max 5 characters)" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">Create Clan</Button>
                </Form.Item>
            </Form>

            <h2>Join a Clan</h2>
            <Form form={form} onFinish={onJoinClan}>
                <Form.Item name="clanId" rules={[{ required: true }]}>
                    <Input placeholder="Clan ID" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">Join Clan</Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Clan;