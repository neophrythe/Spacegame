import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResources, upgradeBuilding } from '../features/resourcesSlice';
import { Button, Card } from 'antd';

const Buildings = () => {
    const dispatch = useDispatch();
    const resources = useSelector((state) => state.resources);

    useEffect(() => {
        dispatch(fetchResources());
    }, [dispatch]);

    if (resources.loading) {
        return <div>Loading...</div>;
    }

    if (resources.error) {
        return <div>Error: {resources.error}</div>;
    }

    const handleUpgrade = (buildingType) => {
        dispatch(upgradeBuilding(buildingType));
    };

    return (
        <div>
            <h2>Buildings</h2>
            <Card>
                <p>Metal Mine: {resources.metalMine}</p>
                <Button onClick={() => handleUpgrade('metalMine')}>Upgrade Metal Mine</Button>
            </Card>
            <Card>
                <p>Crystal Mine: {resources.crystalMine}</p>
                <Button onClick={() => handleUpgrade('crystalMine')}>Upgrade Crystal Mine</Button>
            </Card>
            <Card>
                <p>Deuterium Mine: {resources.deuteriumMine}</p>
                <Button onClick={() => handleUpgrade('deuteriumMine')}>Upgrade Deuterium Mine</Button>
            </Card>
            <Card>
                <p>Shipyard: {resources.shipyard}</p>
                <Button onClick={() => handleUpgrade('shipyard')}>Upgrade Shipyard</Button>
            </Card>
            <Card>
                <p>Research Center: {resources.researchCenter}</p>
                <Button onClick={() => handleUpgrade('researchCenter')}>Upgrade Research Center</Button>
            </Card>
            <Card>
                <p>Planet Shield: {resources.planetShield}</p>
                <Button onClick={() => handleUpgrade('planetShield')}>Upgrade Planet Shield</Button>
            </Card>
            <Card>
                <p>Ion Cannon: {resources.ionCannon}</p>
                <Button onClick={() => handleUpgrade('ionCannon')}>Upgrade Ion Cannon</Button>
            </Card>
        </div>
    );
};

export default Buildings;
