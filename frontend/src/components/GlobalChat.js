import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, List, Input, Button } from 'antd';
import socket from '../socketClient';

const GlobalChat = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const user = useSelector(state => state.user);

    useEffect(() => {
        socket.on('global_message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        return () => {
            socket.off('global_message');
        };
    }, []);

    const sendMessage = () => {
        if (inputMessage.trim()) {
            socket.emit('send_global_message', {
                content: inputMessage,
                username: user.username
            });
            setInputMessage('');
        }
    };

    return (
        <Card title="Global Chat">
            <List
                dataSource={messages}
                renderItem={message => (
                    <List.Item>
                        <strong>{message.username}: </strong> {message.content}
                    </List.Item>
                )}
                style={{ height: '300px', overflowY: 'auto' }}
            />
            <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onPressEnter={sendMessage}
                style={{ marginTop: '10px' }}
            />
            <Button onClick={sendMessage} style={{ marginTop: '10px' }}>Send</Button>
        </Card>
    );
};

export default GlobalChat;