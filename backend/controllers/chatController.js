const Message = require('../models/Message');
const User = require('../models/User');
const { io } = require('../server');

const sendMessage = async (req, res) => {
    try {
        const { content, recipientId } = req.body;
        const senderId = req.user.id;

        const message = new Message({
            sender: senderId,
            recipient: recipientId,
            content
        });

        await message.save();

        // Emit the message to both sender and recipient
        io.to(senderId).emit('new_message', message);
        io.to(recipientId).emit('new_message', message);

        res.status(201).json(message);
    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { otherUserId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: userId, recipient: otherUserId },
                { sender: otherUserId, recipient: userId }
            ]
        }).sort('createdAt').limit(50);

        res.json(messages);
    } catch (error) {
        console.error('Error in getMessages:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    sendMessage,
    getMessages
};