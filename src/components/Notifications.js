import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import socket from '../socketClient';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const user = useSelector(state => state.user);

    useEffect(() => {
        // Fetch existing notifications when the component mounts
        fetch('/api/notifications')
            .then(res => res.json())
            .then(data => setNotifications(data));

        // Authenticate the socket connection
        socket.emit('authenticate', user.token);

        // Listen for new notifications
        socket.on('notification', (notification) => {
            setNotifications(prev => [notification, ...prev]);
        });

        return () => {
            socket.off('notification');
        };
    }, [user.token]);

    return (
        <div>
            <h2>Notifications</h2>
            {notifications.map(notification => (
                <div key={notification._id}>
                    <p>{notification.message}</p>
                    <small>{new Date(notification.createdAt).toLocaleString()}</small>
                </div>
            ))}
        </div>
    );
};

export default Notifications;