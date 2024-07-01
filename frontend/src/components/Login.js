import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearError } from '../features/userSlice';
import { Button, Form, Input, message, Card } from 'antd';

const Login = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, token } = useSelector((state) => state.user);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            navigate('/');
        }
    }, [token, navigate]);

    useEffect(() => {
        if (error) {
            message.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const onFinish = async (values) => {
        try {
            const resultAction = await dispatch(login(values));
            if (login.fulfilled.match(resultAction)) {
                message.success('Login successful');
            } else {
                message.error('Login failed: ' + resultAction.error.message);
            }
        } catch (err) {
            console.error('Login error:', err);
            message.error('An unexpected error occurred');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Card title="Login" style={{ width: 300 }}>
                <Form form={form} onFinish={onFinish} layout="vertical">
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Login
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;