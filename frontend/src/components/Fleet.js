import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFleet, buildShip } from '../features/fleetSlice';
import { Table, Button, InputNumber } from 'antd';
import { useState } from 'react';

const Fleet = () => {
    const dispatch = useDispatch();
    const fleet = useSelector((state) => state.fleet);
    const [buildAmount, setBuildAmount] = useState({});

    useEffect(() => {
        dispatch(fetchFleet());
    }, [dispatch]);

    const handleBuildShip = (shipType) => {
        const amount = buildAmount[shipType] || 1;
        dispatch(buildShip(shipType, amount));
        setBuildAmount({ ...buildAmount, [shipType]: 0 });
    };

    const columns = [
        { title: 'Ship Type', dataIndex: 'type', key: 'type' },
        { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
        {
            title: 'Build',
            key: 'build',
            render: (_, record) => (
                <>
                    <InputNumber
                        min={1}
                        value={buildAmount[record.type] || 1}
                        onChange={(value) => setBuildAmount({ ...buildAmount, [record.type]: value })}
                    />
                    <Button onClick={() => handleBuildShip(record.type)}>Build</Button>
                </>
            ),
        },
    ];

    const data = Object.entries(fleet).map(([type, quantity], index) => ({
        key: index,
        type,
        quantity,
    }));

    return (
        <div>
            <h2>Fleet</h2>
            <Table columns={columns} dataSource={data} />
        </div>
    );
};

export default Fleet;