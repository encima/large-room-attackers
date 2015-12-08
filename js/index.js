(function (window) {
    'use strict';
    /*
    *  GAME CONFIGURATION
    */
    var Game = {
        init: function () {
            this.canvas = document.getElementById("game");
            this.canvas.width = this.canvas.width;
            this.canvas.height = this.canvas.height;
            this.ctx = this.canvas.getContext("2d");
            this.colour = "rgba(20,20,20,.7)";
            this.bullets = [];
            this.enemyBullets = [];
            this.enemies = [];
            this.maxEnemies = Config.maxEnemies;
            this.currentFrame = 0;
            this.maxLives = Config.maxLives;
            this.binding();
            this.player = new Player();
			//this.laser = new Audio('audio/laser.mp3');
            this.score = 0;
            this.shooting = false;
            this.isGameOver = false;
            this.isPaused = false;
            this.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

            // Spawn enemies at the begining of the game.
            for (var i = 0; i < this.maxEnemies; i++) {
                this.enemies.push(new Enemy(i));
            }

            // Begin game render loop.
            this.loop();
        },

        // Setup listeners to control the game.
        binding: function() {
            window.addEventListener("keydown", this.buttonDown);
            window.addEventListener("keyup", this.buttonUp);
            window.addEventListener("keypress", this.keyPressed);
        },

        // When player press spacebar, check if player hasn't made a shot. If so fire a shot.
        // Check if game is over ,if so restart the game. Also, prevent the default action of spacebar.
        keyPressed: function(e) {
            e.preventDefault();
            if (e.keyCode === Config.keys.shoot) {
                Game.player.shoot();
                if (Game.isGameOver) {
                    Game.init();
                }
            } else if(e.keyCode === Config.keys.pause && !Game.isPaused) {
                Game.isPaused = true;
            } else if(e.keyCode === Config.keys.pause && Game.isPaused) {
                Game.isPaused = false;
                Game.currentFrame = Game.requestAnimationFrame.call(window, Game.loop);
            }

        },

        // When player releases spacebar. Tell the game logic that the player had fired.
        // If player release left or right keys, stop player from moving in that direction.
        buttonUp: function(e) {
            e.preventDefault();
            if (e.keyCode === Config.keys.shoot) {
                Game.shooting = false;
            }
            if (e.keyCode === Config.keys.left || e.keyCode === Config.keys.leftArrow) {
                Game.player.movingLeft = false;
            }
            if (e.keyCode === Config.keys.right || e.keyCode === Config.rightArrow) {
                Game.player.movingRight = false;
            }
        },

        // When player holds down spacebar, fire multiple shots. If player press left, move left indefinitely.
        // If player press right, move right indefinitly.
        buttonDown: function(e) {
            if (e.keyCode === Config.keys.shoot) {
                Game.shooting = true;
				//Game.laser.play();
            }
            if (e.keyCode === Config.keys.left || e.keyCode === Config.keys.leftArrow) {
                Game.player.movingLeft = true;
            }
            if (e.keyCode === Config.keys.right || e.keyCode === Config.keys.rightArrow) {
                Game.player.movingRight = true;
            }
        },

        // Random number generator.
        random: function(min, max) {
            return Math.floor(Math.random() * (max - min) + min);
        },

        // Check if two objects collided with each other. Using the x and y coordinates on the canvas.
        collision: function(a, b) {
            return !(
                ((a.y + a.height) < (b.y)) ||
                (a.y > (b.y + b.height)) ||
                ((a.x + a.width) < b.x) ||
                (a.x > (b.x + b.width))
            )
        },

        // Clear the canvas by painting it white, up to the width and height specified in the configuration.
        clear: function() {
            this.ctx.fillStyle = Game.colour;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        },

        // When the game is over. Clear the game canvas. Display game over message along with the high score.
        gameOver: function() {
            this.isGameOver = true;
            this.clear();
            var message = "Game Over";
            var message2 = "Score: " + Game.score;
            var message3 = "Click or press Spacebar to Play Again";
            this.ctx.fillStyle = "white";
            this.ctx.font = "bold 30px Lato, sans-serif";
            this.ctx.fillText(message, this.canvas.width / 2 - this.ctx.measureText(message).width / 2, this.canvas.height / 2 - 50);
            this.ctx.fillText(message2, this.canvas.width / 2 - this.ctx.measureText(message2).width / 2, this.canvas.height / 2 - 5);
            this.ctx.font = "bold 16px Lato, sans-serif";
            this.ctx.fillText(message3, this.canvas.width / 2 - this.ctx.measureText(message3).width / 2, this.canvas.height / 2 + 30);
        },

        pause: function() {
            this.clear();
            var message = "PAUSED";
            var message2 = "Score: " + Game.score;
            var message3 = "Click or press P to Unpause";
            this.ctx.fillStyle = "white";
            this.ctx.font = "bold 30px Lato, sans-serif";
            this.ctx.fillText(message, this.canvas.width / 2 - this.ctx.measureText(message).width / 2, this.canvas.height / 2 - 50);
            this.ctx.fillText(message2, this.canvas.width / 2 - this.ctx.measureText(message2).width / 2, this.canvas.height / 2 - 5);
            this.ctx.font = "bold 16px Lato, sans-serif";
            this.ctx.fillText(message3, this.canvas.width / 2 - this.ctx.measureText(message3).width / 2, this.canvas.height / 2 + 30);
        },

        // Every game frame redraw the game score and the player's life.
        updateScore: function() {
            this.ctx.fillStyle = "white";
            this.ctx.font = "16px Lato, sans-serif";
            this.ctx.fillText("Score: " + this.score, 8, 20);
            this.ctx.fillText("Lives Left: " + (this.maxLives), 8, 40);
        },

        // Main game loop that draws multiple enemies, player and bullets on the canvas.
        loop: function() {

            if (Game.isGameOver) {
                Game.gameOver();
            } else if(Game.isPaused) {
                Game.pause();
            } else {
                // Clear the canvas.
                Game.clear();
                // Draw & update enemies.
                for (var i in Game.enemies) {
                    var currentEnemy = Game.enemies[i];
                    currentEnemy.draw();
                    currentEnemy.update();
                    // If the game frame number can be full divided by the shooting speed fire.
                    if (Game.currentFrame % currentEnemy.shootingSpeed === 0) {
                        currentEnemy.shoot();
                    }
                }
                // Draw and update enemy bullets.
                for (var x in Game.enemyBullets) {
                    Game.enemyBullets[x].draw();
                    Game.enemyBullets[x].update();
                }

                // Draw and update the player's bullets.
                for (var z in Game.bullets) {
                    Game.bullets[z].draw();
                    Game.bullets[z].update();
                }

                // Draw the player once
                Game.player.draw();
                // Every frame update the player's position, score and change to the next frame.
                // At the end of the loop.
                Game.player.update();
                Game.updateScore();
                Game.currentFrame = Game.requestAnimationFrame.call(window, Game.loop);
            }
        }

    };

    /*
    *  PLAYER CONFIGURATION
    */
    var Player = function() {
        this.width = Config.player.width;
        this.height = Config.player.height;
        this.x = Game.canvas.width / 2 - this.width / 2;
        this.y = Game.canvas.height - this.height;
        this.movingLeft = false;
        this.movingRight = false;
        this.shootSpeed = Config.player.shootSpeed;
        this.speed = Config.player.speed;
        this.colour = Config.player.colour;
    };

    // Player die event. If player was hit and reduce their remaining lives.
    // Otherwise, the game is over.
    Player.prototype.die = function() {
        if (Game.maxLives > 1) {
            Game.maxLives--;
        } else {
            Game.maxLives = 0;
            Game.gameOver();
        }
    };

    // Draws the player on the canvas by drawing and painting the player white.
    Player.prototype.draw = function() {
        Game.ctx.fillStyle = this.colour;
        Game.ctx.fillRect(this.x, this.y, this.width, this.height);
    };

    // Updates the player location and check if the player was hit by enemy bullets.
    Player.prototype.update = function() {
        if (this.movingLeft && this.x > 0) {
            this.x -= this.speed;
        }
        if (this.movingRight && this.x + this.width < Game.canvas.width) {
            this.x += this.speed;
        }
        if (Game.shooting && Game.currentFrame % this.shootSpeed === 0) {
            this.shoot();
        }
        for (var i in Game.enemyBullets) {
            var currentBullet = Game.enemyBullets[i];
            if (Game.collision(currentBullet, this)) {
                this.die();
                delete Game.enemyBullets[i];
            }
        }
    };

    // Player's shoot function.
    Player.prototype.shoot = function() {
        Game.bullets.push(new Bullet(this.x + this.width / 2, Game.canvas.height - Config.player.height, Config.bullet.colour, Game.bullets.length, this));
    };

    /*
    * BULLET CONFIGURATION
    */
    var Bullet = function(x, y, colour, index, source) {
        this.width = Config.bullet.width;
        this.height = Config.bullet.height;
        this.x = x;
        this.y = y;
        this.index = index;
        this.active = true;
        this.colour = colour;
        this.source = source;
    };

    // Draw bullets on the canvas.
    Bullet.prototype.draw = function() {
        Game.ctx.fillStyle = this.colour;
        Game.ctx.fillRect(this.x, this.y, this.width, this.height);
    };

    // Update the bullet's location by updating the x and y coordinates.
    // Once the bullet reaches the top of the canvas remove bullet from canvas.
    Bullet.prototype.update = function() {
        if(this.source instanceof Player) {
            this.y -= Config.player.bulletSpeed;
            if (this.y < 0) {
                delete Game.bullets[this.index];
            }
        }else if(this.source instanceof Enemy){
            this.y += Config.enemy.bulletSpeed;
            if (this.y > Game.canvas.height) {
                delete Game.enemyBullets[this.index];
            }
        }
    };

    /*
    *  ENEMY CONFIGURATION
    */
    var Enemy = function(index) {
        this.width = Config.enemy.width;
        this.height = Config.enemy.height;
        this.x = Game.random(0, (Game.canvas.width - this.width));
        this.y = Game.random(10, 40);
        this.vy = Game.random(1, 3) * .1;
        this.index = index;
        this.speed = Game.random(Config.enemy.speedLowerLimit, Config.enemy.speedLowerLimit);
        this.shootingSpeed = Config.enemy.shootSpeed;
        this.movingLeft = Math.random() < 0.5 ? true : false;
        this.colour = "hsl(" + Game.random(0, 360) + ", 60%, 50%)";

    };

    // Draw the enemies on the canvas.
    Enemy.prototype.draw = function() {
        Game.ctx.fillStyle = this.colour;
        Game.ctx.fillRect(this.x, this.y, this.width, this.height);
    };

    // Update the current enemy location on the canvas. Checks if it had collided with the player's bullet.
    // If so remove current enemy and bullet from canvas.
    Enemy.prototype.update = function() {
        if (this.movingLeft) {
            if (this.x > 0) {
                this.x -= this.speed;
                this.y += this.vy;
            } else {
                this.movingLeft = false;
            }
        } else {
            if (this.x + this.width < Game.canvas.width) {
                this.x += this.speed;
                this.y += this.vy;
            } else {
                this.movingLeft = true;
            }
        }

        for (var i in Game.bullets) {
            var currentBullet = Game.bullets[i];
            if (Game.collision(currentBullet, this)) {
                this.die();
                delete Game.bullets[i];
            }
        }
    };

    // When an enemy dies, update the score by the set amount and creates enemies
    // and spawn them after n seconds have passed.
    Enemy.prototype.die = function() {
        Game.enemies.pop(this);
        delete this;
        Game.score += Config.score;
        if (Game.enemies.length < Game.maxEnemies) {
            setTimeout(function() {
                Game.enemies.push(new Enemy(Game.enemies.length));
            }, Config.enemy.spawnTimeout);
        }

    };

    // When shooting, create a new bullet on the canvas.
    Enemy.prototype.shoot = function() {
        Game.enemyBullets.push(new Bullet(this.x + this.width / 2, this.y, this.colour, Game.enemyBullets.length, this));
    };

    // Begin the game.
    Game.init();

}(window));
