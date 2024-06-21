import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/userSlice';
import { Button, Form, Input } from 'antd';

const Login = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.user.loading);
    const error = useSelector((state) => state.user.error);

    const onFinish = (values) => {
        dispatch(login(values));
    };

    return (
        <Form form={form} onFinish={onFinish}>
            <Form.Item name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
                <Input placeholder="Email" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
                <Input.Password placeholder="Password" />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Login
                </Button>
            </Form.Item>
            {error && <p>{error}</p>}
        </Form>
    );
};

export default Login;
