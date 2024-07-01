import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResearch, upgradeResearch } from '../features/researchSlice';
import { Button, Card, List, Progress, Spin } from 'antd';

const Research = () => {
    const dispatch = useDispatch();
    const { research, loading, error } = useSelector((state) => state.research || {});

    useEffect(() => {
        dispatch(fetchResearch());
    }, [dispatch]);

    const handleUpgrade = (researchType) => {
        dispatch(upgradeResearch(researchType));
    };

    if (loading) {
        return <Spin size="large" />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!research || typeof research !== 'object') {
        return <div>No research data available</div>;
    }

    return (
        <div>
            <h2>Research</h2>
            <List
                grid={{ gutter: 16, column: 3 }}
                dataSource={Object.entries(research)}
                renderItem={([researchType, level]) => (
                    <List.Item>
                        <Card title={researchType}>
                            <p>Level: {level}</p>
                            <Progress percent={level * 10} />
                            <Button onClick={() => handleUpgrade(researchType)}>Upgrade</Button>
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default Research;