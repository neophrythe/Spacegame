import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBuildings, upgradeBuilding } from '../features/buildingSlice';
import { Button, Card } from 'antd';

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
            <Card>
                <p>Metal Mine: {buildings.metalMine}</p>
                <Button onClick={() => handleUpgrade('metalMine')}>Upgrade Metal Mine</Button>
            </Card>
            <Card>
                <p>Crystal Mine: {buildings.crystalMine}</p>
                <Button onClick={() => handleUpgrade('crystalMine')}>Upgrade Crystal Mine</Button>
            </Card>
            <Card>
                <p>Deuterium Mine: {buildings.deuteriumMine}</p>
                <Button onClick={() => handleUpgrade('deuteriumMine')}>Upgrade Deuterium Mine</Button>
            </Card>
            {/* Add other buildings here */}
        </div>
    );
};

export default Buildings;
