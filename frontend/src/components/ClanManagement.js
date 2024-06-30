import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getClanInfo, contributeResources, upgradeAllianceResearch } from '../features/clanSlice';
import { Button, Input, List, Card, Typography } from 'antd';

const { Title, Text } = Typography;

const ClanManagement = () => {
    const dispatch = useDispatch();
    const { clan, loading, error } = useSelector(state => state.clan);
    const [contribution, setContribution] = useState({ metal: 0, crystal: 0, deuterium: 0 });

    useEffect(() => {
        dispatch(getClanInfo());
    }, [dispatch]);

    const handleContribute = () => {
        dispatch(contributeResources(contribution));
    };

    const handleUpgradeResearch = (researchType) => {
        dispatch(upgradeAllianceResearch(researchType));
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!clan) return <div>You are not in a clan.</div>;

    return (
        <div>
            <Title level={2}>{clan.name} [{clan.tag}]</Title>
            <Text>Leader: {clan.leader.username}</Text>
            <Card title="Shared Resources">
                <Text>Metal: {clan.sharedResources.metal}</Text>
                <Text>Crystal: {clan.sharedResources.crystal}</Text>
                <Text>Deuterium: {clan.sharedResources.deuterium}</Text>
                <Title level={4}>Contribute Resources</Title>
                <Input
                    type="number"
                    placeholder="Metal"
                    value={contribution.metal}
                    onChange={(e) => setContribution({...contribution, metal: parseInt(e.target.value)})}
                />
                <Input
                    type="number"
                    placeholder="Crystal"
                    value={contribution.crystal}
                    onChange={(e) => setContribution({...contribution, crystal: parseInt(e.target.value)})}
                />
                <Input
                    type="number"
                    placeholder="Deuterium"
                    value={contribution.deuterium}
                    onChange={(e) => setContribution({...contribution, deuterium: parseInt(e.target.value)})}
                />
                <Button onClick={handleContribute}>Contribute</Button>
            </Card>
            <Card title="Alliance Research">
                <List
                    dataSource={Object.entries(clan.allianceResearch)}
                    renderItem={([type, level]) => (
                        <List.Item>
                            <Text>{type}: Level {level}</Text>
                            <Button onClick={() => handleUpgradeResearch(type)}>Upgrade</Button>
                        </List.Item>
                    )}
                />
            </Card>
            <Card title="Members">
                <List
                    dataSource={clan.members}
                    renderItem={(member) => (
                        <List.Item>
                            <Text>{member.username}</Text>
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
};

export default ClanManagement;