const config = {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
    SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
    GAME_CONSTANTS: {
        BASE_RESOURCE_PRODUCTION: 30,
        BUILDING_BASE_TIMES: {
            metalMine: 60,
            crystalMine: 90,
            deuteriumMine: 120,
            researchCenter: 180,
            shipyard: 240,
            ionCannon: 300,
            ionShield: 300
        },
        SHIP_COSTS: {
            raven: { metal: 3000, crystal: 1000, deuterium: 0 },
            marauder: { metal: 6000, crystal: 4000, deuterium: 1000 },
            vandal: { metal: 20000, crystal: 7000, deuterium: 2000 },
            // Add costs for other ship types
        },
        // Add other game constants here
    }
};

export default config;