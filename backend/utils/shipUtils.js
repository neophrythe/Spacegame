const gameConfig = require('../config/gameConfig');

const getShipCosts = (shipType) => {
    if (!gameConfig.ships[shipType]) {
        throw new Error(`Invalid ship type: ${shipType}`);
    }
    return gameConfig.ships[shipType].cost;
};

module.exports = {
    getShipCosts
};