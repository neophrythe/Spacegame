const config = {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
    SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
    GAME_CONSTANTS: {
        RESOURCES: {
            BASE_PRODUCTION: {
                metal: 50,
                crystal: 30,
                deuterium: 15
            },
            PRODUCTION_FACTOR: 1.2,
            RESEARCH_BONUS: 0.15
        },
        BUILDINGS: {
            metalMine: {
                cost: { metal: 60, crystal: 15 },
                factor: 1.4,
                energyConsumption: 10,
                baseTime: 60
            },
            crystalMine: {
                cost: { metal: 48, crystal: 24 },
                factor: 1.5,
                energyConsumption: 10,
                baseTime: 90
            },
            deuteriumMine: {
                cost: { metal: 225, crystal: 75 },
                factor: 1.4,
                energyConsumption: 20,
                baseTime: 120
            },
            solarPlant: {
                cost: { metal: 75, crystal: 30 },
                factor: 1.4,
                energyProduction: 25,
                baseTime: 60
            },
            robotFactory: {
                cost: { metal: 400, crystal: 120, deuterium: 200 },
                factor: 1.8,
                baseTime: 200
            },
            shipyard: {
                cost: { metal: 400, crystal: 200, deuterium: 100 },
                factor: 1.8,
                baseTime: 240
            },
            researchLab: {
                cost: { metal: 200, crystal: 400, deuterium: 200 },
                factor: 1.8,
                baseTime: 180
            },
            ionCannon: {
                cost: { metal: 5000, crystal: 3000 },
                factor: 1.5,
                baseTime: 300
            },
            ionShield: {
                cost: { metal: 10000, crystal: 10000 },
                factor: 1.6,
                baseTime: 300
            },
            terraformer: {
                cost: { metal: 0, crystal: 50000, deuterium: 100000, energy: 1000 },
                factor: 2,
                baseTime: 240
            },
            missileSilo: {
                cost: { metal: 20000, crystal: 20000, deuterium: 1000 },
                factor: 1.7,
                baseTime: 120
            }
        },
        SHIPS: {
            raven: {
                cost: { metal: 3000, crystal: 1000 },
                capacity: 5000,
                speed: 12500,
                firepower: 50,
                shield: 10,
                hull: 4000,
                buildTime: 60
            },
            marauder: {
                cost: { metal: 6000, crystal: 4000 },
                capacity: 10000,
                speed: 10000,
                firepower: 150,
                shield: 25,
                hull: 10000,
                buildTime: 120
            },
            vandal: {
                cost: { metal: 20000, crystal: 7000, deuterium: 2000 },
                capacity: 20000,
                speed: 15000,
                firepower: 400,
                shield: 50,
                hull: 27000,
                buildTime: 240
            },
            stinger: {
                cost: { metal: 45000, crystal: 15000 },
                capacity: 30000,
                speed: 10000,
                firepower: 1000,
                shield: 200,
                hull: 60000,
                buildTime: 300
            },
            brawler: {
                cost: { metal: 30000, crystal: 40000, deuterium: 15000 },
                capacity: 50000,
                speed: 7500,
                firepower: 700,
                shield: 400,
                hull: 70000,
                buildTime: 360
            },
            devastator: {
                cost: { metal: 60000, crystal: 50000, deuterium: 15000 },
                capacity: 10000,
                speed: 5000,
                firepower: 2000,
                shield: 500,
                hull: 110000,
                buildTime: 480
            },
            sentinel: {
                cost: { metal: 5000000, crystal: 4000000, deuterium: 1000000 },
                capacity: 1000000,
                speed: 100,
                firepower: 200000,
                shield: 50000,
                hull: 9000000,
                buildTime: 3600
            },
            fortress: {
                cost: { metal: 10000000, crystal: 8000000, deuterium: 2000000 },
                capacity: 2000000,
                speed: 50,
                firepower: 400000,
                shield: 100000,
                hull: 18000000,
                buildTime: 7200
            },
            transport: {
                cost: { metal: 2000, crystal: 2000 },
                capacity: 50000,
                speed: 5000,
                firepower: 5,
                shield: 10,
                hull: 6000,
                buildTime: 90
            },
            colony: {
                cost: { metal: 10000, crystal: 20000, deuterium: 10000 },
                capacity: 7500,
                speed: 2500,
                firepower: 50,
                shield: 100,
                hull: 30000,
                buildTime: 600
            }
        },
        RESEARCH: {
            energyTechnology: {
                cost: { crystal: 700, deuterium: 300 },
                factor: 1.8,
                prerequisites: {},
                baseTime: 180
            },
            laserTechnology: {
                cost: { metal: 200, crystal: 100 },
                factor: 1.8,
                prerequisites: { energyTechnology: 2 },
                baseTime: 240
            },
            ionTechnology: {
                cost: { metal: 1000, crystal: 300, deuterium: 100 },
                factor: 1.8,
                prerequisites: { energyTechnology: 4, laserTechnology: 5 },
                baseTime: 300
            },
            hyperspaceTechnology: {
                cost: { crystal: 4000, deuterium: 2000 },
                factor: 1.8,
                prerequisites: { energyTechnology: 5, shielding: 5 },
                baseTime: 360
            },
            plasmaTechnology: {
                cost: { metal: 2000, crystal: 4000, deuterium: 1000 },
                factor: 1.8,
                prerequisites: { energyTechnology: 8, laserTechnology: 10, ionTechnology: 5 },
                baseTime: 420
            },
            combustionDrive: {
                cost: { metal: 400, crystal: 600 },
                factor: 1.8,
                prerequisites: { energyTechnology: 1 },
                baseTime: 240
            },
            impulseDrive: {
                cost: { metal: 2000, crystal: 4000, deuterium: 600 },
                factor: 1.8,
                prerequisites: { energyTechnology: 1 },
                baseTime: 360
            },
            hyperspaceDrive: {
                cost: { metal: 10000, crystal: 20000, deuterium: 6000 },
                factor: 1.8,
                prerequisites: { hyperspaceTechnology: 3 },
                baseTime: 480
            },
            espionageTechnology: {
                cost: { metal: 200, crystal: 1000, deuterium: 200 },
                factor: 1.8,
                prerequisites: { computerTechnology: 1 },
                baseTime: 300
            },
            computerTechnology: {
                cost: { metal: 400, crystal: 600 },
                factor: 1.8,
                prerequisites: { energyTechnology: 1 },
                baseTime: 240
            },
            astrophysics: {
                cost: { metal: 4000, crystal: 8000, deuterium: 4000 },
                factor: 1.65,
                prerequisites: { espionageTechnology: 4, impulseDrive: 3 },
                baseTime: 360
            },
            weapons: {
                cost: { metal: 800, crystal: 200 },
                factor: 1.8,
                prerequisites: { energyTechnology: 3 },
                baseTime: 300
            },
            shielding: {
                cost: { metal: 200, crystal: 600 },
                factor: 1.8,
                prerequisites: { energyTechnology: 3 },
                baseTime: 300
            },
            armor: {
                cost: { metal: 1000, crystal: 1000 },
                factor: 1.8,
                prerequisites: { energyTechnology: 2 },
                baseTime: 300
            }
        },
        COMBAT: {
            DEBRIS_FACTOR: 0.3,
            LOOT_PERCENTAGE: {
                metal: 0.5,
                crystal: 0.3,
                deuterium: 0.2
            }
        },
        FLIGHT_SPEED: {
            combustionDrive: 1,
            impulseDrive: 2,
            hyperspaceDrive: 3
        },
        DEFENSE: {
            rocketLauncher: {
                cost: { metal: 2000, crystal: 0 },
                firepower: 80,
                shield: 20,
                hull: 2000,
                buildTime: 60
            },
            lightLaser: {
                cost: { metal: 1500, crystal: 500 },
                firepower: 100,
                shield: 25,
                hull: 2000,
                buildTime: 90
            },
            heavyLaser: {
                cost: { metal: 6000, crystal: 2000 },
                firepower: 250,
                shield: 100,
                hull: 8000,
                buildTime: 120
            },
            ionCannon: {
                cost: { metal: 5000, crystal: 3000 },
                firepower: 150,
                shield: 500,
                hull: 8000,
                buildTime: 180
            },
            gaussCannon: {
                cost: { metal: 20000, crystal: 15000, deuterium: 2000 },
                firepower: 1100,
                shield: 200,
                hull: 35000,
                buildTime: 240
            },
            plasmaTurret: {
                cost: { metal: 50000, crystal: 50000, deuterium: 30000 },
                firepower: 3000,
                shield: 300,
                hull: 100000,
                buildTime: 300
            },
            smallShieldDome: {
                cost: { metal: 10000, crystal: 10000 },
                shield: 2000,
                hull: 20000,
                buildTime: 180
            },
            largeShieldDome: {
                cost: { metal: 50000, crystal: 50000 },
                shield: 10000,
                hull: 100000,
                buildTime: 360
            }
        }
    }
};

export default config;