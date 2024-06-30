import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGalaxy } from '../features/galaxySlice';
import { Table, Tag } from 'antd';
import { useParams } from 'react-router-dom';

const GalaxyView = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentGalaxy, loading, error } = useSelector(state => state.galaxies);

    useEffect(() => {
        dispatch(fetchGalaxy(id));
    }, [dispatch, id]);

    const columns = [
        { title: 'Position', dataIndex: ['position', 'system', 'planet'], key: 'position',
            render: (_, record) => `[${record.system.position}:${record.position}]` },
        { title: 'Planet Name', dataIndex: 'name', key: 'name' },
        { title: 'Player', dataIndex: 'playerName', key: 'player' },
        { title: 'Alliance', dataIndex: 'alliance', key: 'alliance',
            render: alliance => alliance ? <Tag color="blue">{alliance}</Tag> : null },
        { title: 'Diplomatic Status', dataIndex: 'diplomaticStatus', key: 'diplomaticStatus',
            render: status => {
                let color = 'default';
                if (status === 'Ally') color = 'green';
                if (status === 'Enemy') color = 'red';
                return <Tag color={color}>{status}</Tag>;
            }
        },
    ];

    if (loading) return <div>Loading galaxy data...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!currentGalaxy) return <div>No galaxy data available</div>;

    const data = currentGalaxy.systems.flatMap(system =>
        system.planets.map(planet => ({
            key: planet._id,
            system: { position: system.position },
            ...planet
        }))
    );

    return (
        <div>
            <h2>Galaxy View: {currentGalaxy.name}</h2>
            <Table columns={columns} dataSource={data} />
        </div>
    );
};

export default GalaxyView;