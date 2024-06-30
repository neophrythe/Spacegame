import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, updateUserProfile } from '../features/userSlice';
import { Card, Form, Input, Button, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const UserProfile = () => {
    const dispatch = useDispatch();
    const { profile, loading } = useSelector((state) => state.user);
    const [form] = Form.useForm();

    useEffect(() => {
        dispatch(fetchUserProfile());
    }, [dispatch]);

    useEffect(() => {
        if (profile) {
            form.setFieldsValue(profile);
        }
    }, [profile, form]);

    const onFinish = (values) => {
        dispatch(updateUserProfile(values));
    };

    return (
        <Card title="User Profile" loading={loading}>
            <Avatar size={64} icon={<UserOutlined />} src={profile?.avatar} />
            <Form form={form} onFinish={onFinish} layout="vertical">
                <Form.Item name="username" label="Username">
                    <Input disabled />
                </Form.Item>
                <Form.Item name="email" label="Email">
                    <Input disabled />
                </Form.Item>
                <Form.Item name="bio" label="Bio">
                    <Input.TextArea />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Update Profile
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default UserProfile;