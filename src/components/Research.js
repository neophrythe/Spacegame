import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResearch, upgradeResearch } from '../features/researchSlice';
import { Button, Card, List, Progress } from 'antd';

const Research = () => {
    const dispatch = useDispatch();
    const research = useSelector((state) => state.research);

    useEffect(() => {
        dispatch(fetchResearch());
    }, [dispatch]);

    const handleUpgrade = (researchType) => {
        dispatch(upgradeResearch(researchType));
    };

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