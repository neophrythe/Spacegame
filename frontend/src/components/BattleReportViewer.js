import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchBattleReport } from '../features/battleReportSlice';
import { Card, List, Typography } from 'antd';

const { Title, Text } = Typography;

const BattleReportViewer = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentReport, loading, error } = useSelector(state => state.battleReports);

    useEffect(() => {
        dispatch(fetchBattleReport(id));
    }, [dispatch, id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!currentReport) return <div>No report found</div>;

    return (
        <Card title={`Battle Report: ${new Date(currentReport.createdAt).toLocaleString()}`}>
            <Title level={4}>Attacker: {currentReport.attackerId}</Title>
            <Title level={4}>Defender: {currentReport.defenderId}</Title>

            <Title level={5}>Initial Fleets</Title>
            <Text>Attacker: {JSON.stringify(currentReport.attackerFleetInitial)}</Text>
            <Text>Defender: {JSON.stringify(currentReport.defenderFleetInitial)}</Text>

            <Title level={5}>Battle Rounds</Title>
            <List
                dataSource={currentReport.combatLog}
                renderItem={(round, index) => (
                    <List.Item>
                        <Text>Round {index + 1}: Attacker Damage: {round.attackerDamage}, Defender Damage: {round.defenderDamage}</Text>
                    </List.Item>
                )}
            />

            <Title level={5}>Result</Title>
            <Text>Winner: {currentReport.winner}</Text>
            <Text>Attacker Losses: {JSON.stringify(currentReport.attackerLosses)}</Text>
            <Text>Defender Losses: {JSON.stringify(currentReport.defenderLosses)}</Text>
            <Text>Resources Looted: {JSON.stringify(currentReport.resourcesLooted)}</Text>
        </Card>
    );
};

export default BattleReportViewer;