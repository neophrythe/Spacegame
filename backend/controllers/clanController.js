const Clan = require('../models/Clan');
const User = require('../models/User');

exports.createClan = async (req, res) => {
    try {
        const { name, tag } = req.body;
        const clan = new Clan({
            name,
            tag,
            leader: req.user.id,
            members: [req.user.id]
        });
        await clan.save();

        await User.findByIdAndUpdate(req.user.id, { clan: clan._id });

        res.status(201).json(clan);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.joinClan = async (req, res) => {
    try {
        const { clanId } = req.body;
        const clan = await Clan.findById(clanId);
        if (!clan) {
            return res.status(404).json({ message: 'Clan not found' });
        }

        clan.members.push(req.user.id);
        await clan.save();

        await User.findByIdAndUpdate(req.user.id, { clan: clan._id });

        res.json(clan);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.leaveClan = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.clan) {
            return res.status(400).json({ message: 'You are not in a clan' });
        }

        const clan = await Clan.findById(user.clan);
        clan.members = clan.members.filter(memberId => memberId.toString() !== req.user.id);

        if (clan.leader.toString() === req.user.id) {
            if (clan.members.length > 0) {
                clan.leader = clan.members[0];
            } else {
                await Clan.findByIdAndDelete(clan._id);
                user.clan = null;
                await user.save();
                return res.json({ message: 'Clan deleted as you were the last member' });
            }
        }

        await clan.save();
        user.clan = null;
        await user.save();

        res.json({ message: 'Successfully left the clan' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getClanInfo = async (req, res) => {
    try {
        const clan = await Clan.findById(req.params.id).populate('members', 'username');
        if (!clan) {
            return res.status(404).json({ message: 'Clan not found' });
        }
        res.json(clan);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.sendClanMessage = async (req, res) => {
    try {
        const { content } = req.body;
        const user = await User.findById(req.user.id);

        if (!user.clan) {
            return res.status(400).json({ message: 'You are not in a clan' });
        }

        const message = new ClanMessage({
            clanId: user.clan,
            senderId: user.id,
            content
        });

        await message.save();

        // Emit the message to all online clan members
        req.io.to(`clan_${user.clan}`).emit('new_clan_message', message);

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getClanMessages = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user.clan) {
            return res.status(400).json({ message: 'You are not in a clan' });
        }

        const messages = await ClanMessage.find({ clanId: user.clan })
            .sort('-createdAt')
            .limit(50)
            .populate('senderId', 'username');

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
