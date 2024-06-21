import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBuildings, upgradeBuilding } from '../features/buildingSlice';
import { Button, Card, List, Progress } from 'antd';

const Buildings = () => {
    const dispatch = useDispatch();
    const buildings = useSelector((state) => state.buildings);

    useEffect(() => {
        dispatch(fetchBuildings());
    }, [dispatch]);

    const handleUpgrade = (buildingType) => {
        dispatch(upgradeBuilding(buildingType));
    };

    return (
        <div>
            <h2>Buildings</h2>
            <List
                grid={{ gutter: 16, column: 3 }}
                dataSource={Object.entries(buildings)}
                renderItem={([buildingType, level]) => (
                    <List.Item>
                        <Card title={buildingType}>
                            <p>Level: {level}</p>
                            <Progress percent={level * 10} />
                            <Button onClick={() => handleUpgrade(buildingType)}>Upgrade</Button>
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default Buildings;