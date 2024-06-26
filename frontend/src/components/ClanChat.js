import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { List, Input, Button } from 'antd';
import socket from '../socketClient';

const ClanChat = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const user = useSelector(state => state.user);

    useEffect(() => {
        // Fetch existing messages
        fetch('/api/clan/messages')
            .then(res => res.json())
            .then(data => setMessages(data));

        // Listen for new messages
        socket.on('new_clan_message', (message) => {
            setMessages(prev => [message, ...prev]);
        });

        return () => {
            socket.off('new_clan_message');
        };
    }, []);

    const sendMessage = () => {
        if (inputMessage.trim()) {
            fetch('/api/clan/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ content: inputMessage })
            });
            setInputMessage('');
        }
    };

    return (
        <div>
            <List
                dataSource={messages}
                renderItem={message => (
                    <List.Item>
                        <strong>{message.senderId.username}:</strong> {message.content}
                    </List.Item>
                )}
            />
            <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onPressEnter={sendMessage}
            />
            <Button onClick={sendMessage}>Send</Button>
        </div>
    );
};

export default ClanChat;