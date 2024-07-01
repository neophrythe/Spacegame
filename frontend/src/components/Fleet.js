import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFleet, buildShip } from '../features/fleetSlice';
import { Table, Button, InputNumber, message, Spin } from 'antd';

const Fleet = () => {
    const dispatch = useDispatch();
    const { fleet, loading, error } = useSelector((state) => state.fleet || {});
    const [buildAmount, setBuildAmount] = useState({});

    useEffect(() => {
        dispatch(fetchFleet());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            message.error(error);
        }
    }, [error]);

    const handleBuildShip = (shipType) => {
        const amount = buildAmount[shipType] || 1;
        dispatch(buildShip({ shipType, amount }));
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
                    <Button onClick={() => handleBuildShip(record.type)} disabled={loading}>Build</Button>
                </>
            ),
        },
    ];

    const data = fleet ? Object.entries(fleet).map(([type, quantity], index) => ({
        key: index,
        type,
        quantity,
    })).filter(item => item.type !== 'loading' && item.type !== 'error') : [];

    if (loading) {
        return <Spin size="large" />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Fleet</h2>
            <Table columns={columns} dataSource={data} />
        </div>
    );
};

export default Fleet;