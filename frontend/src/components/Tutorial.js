import React, { useState } from 'react';
import { Modal, Button, Steps } from 'antd';

const { Step } = Steps;

const tutorialSteps = [
    {
        title: 'Welcome',
        content: 'Welcome to Space Game! This tutorial will guide you through the basics.',
    },
    {
        title: 'Resources',
        content: 'You have three main resources: Metal, Crystal, and Deuterium. Build mines to increase production.',
    },
    {
        title: 'Buildings',
        content: 'Construct and upgrade buildings to improve your planet and unlock new features.',
    },
    {
        title: 'Research',
        content: 'Research new technologies to enhance your empire and unlock advanced ships.',
    },
    {
        title: 'Fleet',
        content: 'Build and manage your fleet to explore, trade, and engage in combat.',
    },
];

const Tutorial = () => {
    const [current, setCurrent] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(true);

    const next = () => {
        setCurrent(current + 1);
    };

    const prev = () => {
        setCurrent(current - 1);
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };

    return (
        <Modal
            title="Tutorial"
            visible={isModalVisible}
            onOk={handleOk}
            onCancel={handleOk}
            footer={[
                <Button key="back" onClick={prev} disabled={current === 0}>
                    Previous
                </Button>,
                <Button key="next" type="primary" onClick={current < tutorialSteps.length - 1 ? next : handleOk}>
                    {current < tutorialSteps.length - 1 ? 'Next' : 'Finish'}
                </Button>,
            ]}
        >
            <Steps current={current}>
                {tutorialSteps.map(item => (
                    <Step key={item.title} title={item.title} />
                ))}
            </Steps>
            <div style={{ marginTop: '20px' }}>
                {tutorialSteps[current].content}
            </div>
        </Modal>
    );
};

export default Tutorial;