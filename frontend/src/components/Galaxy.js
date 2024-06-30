import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlayerLocation, colonizePlanet } from '../features/galaxySlice';
import { Table, Button, Spin, message, Typography, Modal, Tooltip } from 'antd';

const { Title, Text } = Typography;

const Galaxy = () => {
    const dispatch = useDispatch();
    const { playerLocation, nearbySystems, loading, error } = useSelector((state) => state.galaxies);
    const [colonizationTarget, setColonizationTarget] = useState(null);

    useEffect(() => {
        dispatch(fetchPlayerLocation());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            message.error(error);
        }
    }, [error]);

    const showColonizationConfirm = (planet) => {
        setColonizationTarget(planet);
    };

    const handleColonize = () => {
        dispatch(colonizePlanet(colonizationTarget.id))
            .unwrap()
            .then(() => {
                message.success(`Successfully colonized ${colonizationTarget.name}!`);
                setColonizationTarget(null);
            })
            .catch((error) => {
                message.error(`Failed to colonize: ${error}`);
            });
    };

    const columns = [
        {
            title: 'Position',
            dataIndex: 'position',
            key: 'position',
            render: (text, record) => `[${record.galaxy}:${record.system}:${record.position}]`
        },
        { title: 'Planet Name', dataIndex: 'name', key: 'name' },
        { title: 'Size', dataIndex: 'size', key: 'size' },
        { title: 'Temperature', dataIndex: 'temperature', key: 'temperature' },
        {
            title: 'Resources',
            dataIndex: 'resources',
            key: 'resources',
            render: (resources) => (
                <Tooltip title={`Metal: ${resources.metal}, Crystal: ${resources.crystal}, Deuterium: ${resources.deuterium}`}>
                    <Button>View Resources</Button>
                </Tooltip>
            )
        },
        { title: 'Status', dataIndex: 'status', key: 'status' },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    onClick={() => showColonizationConfirm(record)}
                    disabled={record.status !== 'Available'}
                >
                    Colonize
                </Button>
            ),
        },
    ];

    if (loading) {
        return <Spin size="large" />;
    }

    return (
        <div>
            <Title level={2}>Galaxy View</Title>
            {playerLocation && (
                <Text strong>
                    Your home system: [{playerLocation.galaxy}:{playerLocation.system}:{playerLocation.position}]
                </Text>
            )}
            <Title level={3} style={{ marginTop: 20 }}>Nearby Systems</Title>
            <Table
                columns={columns}
                dataSource={nearbySystems}
                pagination={{ pageSize: 10 }}
                rowKey="id"
            />
            <Modal
                title="Confirm Colonization"
                visible={!!colonizationTarget}
                onOk={handleColonize}
                onCancel={() => setColonizationTarget(null)}
            >
                <p>Are you sure you want to colonize {colonizationTarget?.name}?</p>
                <p>Colonization cost: 10,000 Metal, 7,500 Crystal, 5,000 Deuterium</p>
            </Modal>
        </div>
    );
};

export default Galaxy;