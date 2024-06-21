import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGalaxies, fetchGalaxy } from '../features/galaxySlice';
import { Table, Button, Select } from 'antd';

const { Option } = Select;

const Galaxy = () => {
    const dispatch = useDispatch();
    const galaxies = useSelector((state) => state.galaxies);
    const [selectedGalaxy, setSelectedGalaxy] = useState(null);

    useEffect(() => {
        dispatch(fetchGalaxies());
    }, [dispatch]);

    const handleGalaxyChange = (galaxyId) => {
        setSelectedGalaxy(galaxyId);
        dispatch(fetchGalaxy(galaxyId));
    };

    const columns = [
        { title: 'Position', dataIndex: 'position', key: 'position' },
        { title: 'Planet Name', dataIndex: 'name', key: 'name' },
        { title: 'Player', dataIndex: 'player', key: 'player' },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => <Button>View</Button>,
        },
    ];

    const data = selectedGalaxy
        ? galaxies.find((g) => g._id === selectedGalaxy)?.systems.flatMap((system) =>
            system.planets.map((planet, index) => ({
                key: `${system._id}-${index}`,
                position: `[${system.position}:${planet.position}]`,
                name: planet.name,
                player: planet.userId ? 'Colonized' : 'Uncolonized',
            }))
        )
        : [];

    return (
        <div>
            <h2>Galaxy View</h2>
            <Select style={{ width: 200, marginBottom: 20 }} onChange={handleGalaxyChange} placeholder="Select a galaxy">
                {galaxies.map((galaxy) => (
                    <Option key={galaxy._id} value={galaxy._id}>
                        {galaxy.name}
                    </Option>
                ))}
            </Select>
            <Table columns={columns} dataSource={data} />
        </div>
    );
};

export default Galaxy;