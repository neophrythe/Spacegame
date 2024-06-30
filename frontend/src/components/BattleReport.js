import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Table, Typography } from 'antd';
import { battleReportAPI } from '../api';

const { Title, Text } = Typography;

const BattleReport = () => {
    const [report, setReport] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await battleReportAPI.getBattleReport(id);
                setReport(response.data);
            } catch (error) {
                console.error('Error fetching battle report:', error);
            }
        };
        fetchReport();
    }, [id]);

    if (!report) return <div>Loading...</div>;

    const columns = [
        { title: 'Round', dataIndex: 'round', key: 'round' },
        { title: 'Attacker Damage', dataIndex: 'attackerDamage', key: 'attackerDamage' },
        { title: 'Defender Damage', dataIndex: 'defenderDamage', key: 'defenderDamage' },
    ];

    return (
        <Card title={`Battle Report: ${new Date(report.createdAt).toLocaleString()}`}>
            <Title level={4}>Attacker: {report.attackerId}</Title>
            <Title level={4}>Defender: {report.defenderId}</Title>

            <Title level={5}>Initial Fleets</Title>
            <Text>Attacker: {JSON.stringify(report.attackerFleetInitial)}</Text>
            <Text>Defender: {JSON.stringify(report.defenderFleetInitial)}</Text>

            <Title level={5}>Battle Rounds</Title>
            <Table dataSource={report.rounds} columns={columns} />

            <Title level={5}>Result</Title>
            <Text>Winner: {report.winner}</Text>
            <Text>Resources Looted: {JSON.stringify(report.resourcesLooted)}</Text>
        </Card>
    );
};

export default BattleReport;