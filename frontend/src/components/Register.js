import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../features/userSlice';
import { Button, Form, Input } from 'antd';

const Register = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.user.loading);
    const error = useSelector((state) => state.user.error);

    const onFinish = (values) => {
        dispatch(register(values));
    };

    return (
        <Form form={form} onFinish={onFinish}>
            <Form.Item name="username" rules={[{ required: true, message: 'Please input your username!' }]}>
                <Input placeholder="Username" />
            </Form.Item>
            <Form.Item name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
                <Input placeholder="Email" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
                <Input.Password placeholder="Password" />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Register
                </Button>
            </Form.Item>
            {error && <p>{error}</p>}
        </Form>
    );
};

export default Register;
