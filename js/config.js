var Config = {
    speed: 10,
    maxEnemies: 2,
    maxLives: 10,
    score: 100,
    keys: {
        pause: 112,
        shoot: 32,
        left: 37,
        leftArrow: 65,
        right: 39,
        rightArrow: 68
    },
    player: {
        height: 20,
        width: 60,
        speed: 20,
        bulletSpeed: 5,
        shootSpeed: 10,
        colour: "white"
    },
    bullet: {
        height: 30,
        width: 10,
        speed: 5,
        colour: "green"
    },
    enemy: {
        width: 60,
        height: 20,
        bulletSpeed: 2,
        shootSpeed: 30,
        speedUpperLimit: 5,
        speedLowerLimit: 2,
        spawnTimeout: 1000
    }
};
