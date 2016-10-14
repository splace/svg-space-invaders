function init() {
    content = document.getElementById('content');
    gunTransform = document.getElementById('gunTranform').transform.baseVal.getItem(0);
    gun = document.getElementById('gun');
    missile = document.getElementById('missile');
    missileTransform = missile.transform.baseVal.getItem(0);
    scoreDisplay = document.getElementById('scoreDisplay');
    scoreBoard = document.getElementById('scoreBoard');
    instructionMenu = document.getElementById('instructions');
    scoringMenu = document.getElementById('scoring');
    scoreTable = scoringMenu.getElementsByTagName('text');
    invaderTable = scoringMenu.getElementsByTagName('use');
    users = document.getElementsByTagName('use');
    invaders = [];
    bombs = [];
    spareGuns = [];
    bases = [];
    for (var i = 0; i < users.length; i++) {
        if (users[i].getAttribute("dontRef") != "True") {
            switch (users[i].href.baseVal.slice(0, 5)) {
                case '#Inva':
                    invaders.push(users[i]);
                    break;
                case '#Bomb':
                    bombs.push(users[i]);
                    break;
                case '#Base':
                    bases.push(users[i]);
                    break;
                case '#Sauc':
                    saucer = users[i];
                    break;
                case '#Gun':
                    spareGuns.push(users[i]);
            };
        };
    };
    for (var i in invaders) {
        invaders[i].oldx = invaders[i].x.baseVal.value;
        invaders[i].oldy = invaders[i].y.baseVal.value;
        invaders[i].oldimage = invaders[i].href.baseVal;
        invaders[i].dead = false;
    };
    for (var i in bases) {
        bases[i].dead = false;
    };
    swapMenus = function() {
        if (instructionMenu.getAttribute('display') != 'none') {
            instructionMenu.setAttribute('display', 'none');
            scoringMenu.setAttribute('display', 'inline');
        } else {
            if (swapMenus.tableIndex == 4) {
                instructionMenu.setAttribute('display', 'inline');
                scoringMenu.setAttribute('display', 'none');
                scoreTable[1].setAttribute('display', 'none');
                invaderTable[1].setAttribute('display', 'none');
                scoreTable[2].setAttribute('display', 'none');
                invaderTable[2].setAttribute('display', 'none');
                scoreTable[3].setAttribute('display', 'none');
                invaderTable[3].setAttribute('display', 'none');
                swapMenus.tableIndex = 0;
            };
            scoreTable[swapMenus.tableIndex].setAttribute('display', 'inline');
            invaderTable[swapMenus.tableIndex].setAttribute('display', 'inline');
            swapMenus.tableIndex++;
        };
        content.forceRedraw()
    };
    swapMenus.tableIndex = 4;
    swapMenus();
    setInterval(swapMenus, 5000);
    document.documentElement.addEventListener('keyup', keyUpHandler, true);
    document.documentElement.addEventListener('keydown', keyDownHandler, true);
    running = true;
    invaderHorizontal = 1;
    setInterval(controlLoop, 50);
};
control = {
    paused: false,
    gameOn: false,
    start: false,
    escape: false,
    button1On: false,
    button2On: false,
    button3On: false
};

function controlLoop() {
    with(control) {
        if (gameOn) {
            if (!paused) {
                suspendId = content.suspendRedraw(0);
                if (pausedMessage) {
                    pausedMessage = false;
                    document.getElementById('paused').setAttribute("display", "none");
                };
                gameLogic();
                if (!running) {
                    document.getElementById("gameOver").setAttribute("display", "inline");
                };
                content.unsuspendRedraw(suspendId);
            } else {
                if (running) {
                    document.getElementById("paused").setAttribute("display", "inline");
                    pausedMessage = true;
                };
            };
            if (escape) {
                gameOn = false;
                escape = false;
                start = false;
                document.getElementById("invaders").setAttribute("display", "none");
                document.getElementById("menu").setAttribute("display", "inline");
                document.getElementById("paused").setAttribute("display", "none");
                document.getElementById("gameOver").setAttribute("display", "none");
            };
        } else {
            if (start) {
                running = true;
                with(gameObject) {
                    stopAllBombs;
                    stopSaucerRunning;
                    stopMissileRunning;
                    resetGuns;
                    level = 0;
                    resetInvaders;
                    resetBases;
                    score = 0;
                    gunPosition = gunStartPosition;
                    moveGunRight;
                    invaderHorizontal = 1;
                };
                pausedMessage = false;
                document.getElementById('paused').setAttribute("display", "none");
            };
            if (start || escape) {
                gameOn = true;
                start = false;
                escape = false;
                document.getElementById("invaders").setAttribute("display", "inline");
                document.getElementById("menu").setAttribute("display", "none");
            };
        };
    };
};

function keyDownHandler(event) {
    with(control) {
        switch (event.keyCode) {
            case 80:
                paused = !paused;
                start = true;
                break;
            case 27:
                escape = true;
                button3On = false;
                break;
            case 37:
                button1On = true;
                start = true;
                break;
            case 39:
                button2On = true;
                start = true;
                break;
            case 40:
                start = true;
                break;
            case 38:
            case 17:
                button3On = true;
                start = true;
        };
    };
};

function keyUpHandler(event) {
    if (event.keyCode == 37 || event.keyCode == 39) {
        control.button1On = false;
        control.button2On = false;
    };
};

function gameLogic() {
    with(gameObject) {
        if (running) {
            if (rightCommand) {
                moveGunRight;
            };
            if (leftCommand) {
                moveGunLeft;
            };
            if (fireCommand && !isMissileRunning) {
                startMissileRunning;
            };
            if (!saucerRunning && Math.random() < .005) {
                if (Math.random() < .5) {
                    startSaucerRunningLeft;
                } else {
                    startSaucerRunningRight;
                };
            };
            if (Math.random() < .05) {
                var firingInvader = pickRandomInvader;
                if (firingInvader) {
                    startBombRunning(invaderPosition(firingInvader));
                };
            };
            var bombThatHitGun = bombInsideGun;
            if (bombThatHitGun) {
                stopBomb(bombThatHitGun);
                runGunExplosionAnimation;
                if (!anotherGun) {
                    killGun;
                    running = false;
                };
            };
        };
        if (isMissileRunning) {
            missilePosition = {
                x: missilePosition.x,
                y: missilePosition.y - 2
            };
            var baseHit = baseInside(missilePosition);
            if (baseHit) {
                stopMissileRunning;
                makeBaseLessVisible(baseHit);
            };
            if (missilePosition.y < 0) {
                stopMissileRunning;
            };
            var hitInvader = invaderInside(missilePosition);
            if (hitInvader) {
                killInvader(hitInvader);
                if (running) {
                    score += invaderValue(hitInvader)
                };
                stopMissileRunning;
            };
        };
        invaderMove({
            x: invaderHorizontal * 3
        });
        if (allInvadersGone && !saucerRunning) {
            level++;
            resetInvaders;
        };
        switchInvaderImage;
        nextInvader;
        if (firstInvader) {
            if (sideReached) {
                invaderHorizontal = -invaderHorizontal;
                if (running) {
                    allInvadersMove({
                        y: 6
                    });
                };
                sideReached = false;
                if (bottomReached) {
                    running = false;
                };
            };
        };
        bombsMove;
        var bombandHitBase = bombInsideBase;
        if (bombandHitBase) {
            stopBomb(bombandHitBase.bomb);
            makeBaseLessVisible(bombandHitBase.base);
        };
        if (saucerRunning) {
            saucerMove;
            if (saucerExited) {
                stopSaucerRunning
            };
            if (isMissileRunning && saucerInside(missilePosition)) {
                stopSaucerRunning;
                stopMissileRunning;
                var saucerScore = Math.ceil(Math.random() * 6) * 5;
                displayScore(saucerScore + '0', saucerPosition, .5);
                score += saucerScore;
            };
        };
    };
};
gameObject = {
    level: 0,
    saucerVelocity: 0,
    saucerRunning: false,
    saucerExited: false,
    get startSaucerRunningLeft() {
        this.saucerRunning = true;
        this.saucerVelocity = -1;
        saucer.x.baseVal.value = this.horizontalMax - 30;
        saucer.setAttribute("display", "inline");
    },
    get startSaucerRunningRight() {
        this.saucerRunning = true;
        this.saucerVelocity = 1;
        saucer.x.baseVal.value = 15 - this.horizontalMax;
        saucer.setAttribute("display", "inline");
    },
    get stopSaucerRunning() {
        this.saucerRunning = false;
        this.saucerExited = false;
        saucer.setAttribute("display", "none");
    },
    get saucerPosition() {
        return {
            x: saucer.x.baseVal.value,
            y: saucer.y.baseVal.value
        }
    },
    get saucerMove() {
        saucer.x.baseVal.value += this.saucerVelocity;
        if (saucer.x.baseVal.value < 15 - this.horizontalMax || saucer.x.baseVal.value > this.horizontalMax - 30) {
            this.saucerExited = true;
        };
    },
    saucerInside: function(val) {
        return (val.x > saucer.x.baseVal.value && val.x < saucer.x.baseVal.value + 16 && val.y > saucer.y.baseVal.value && val.y < saucer.y.baseVal.value + 10)
    },
    makeBaseLessVisible: function(i) {
        if (bases[i].exists) {
            var newOp = bases[i].getAttribute("opacity") / 1.05 - .05;
            if (newOp <= 0) {
                bases[i].setAttribute("opacity", 0);
                bases[i].exists = false;
            } else {
                bases[i].setAttribute("opacity", newOp);
            };
        };
    },
    gunPosition: -100,
    gunStartPosition: -100,
    get rightCommand() {
        return control.button2On
    },
    get leftCommand() {
        return control.button1On
    },
    get moveGunLeft() {
        if (this.gunPosition > 20 - this.horizontalMax) {
            this.gunPosition--;
            gunTransform.setTranslate(this.gunPosition, 0);
        };
    },
    get moveGunRight() {
        if (this.gunPosition < this.horizontalMax - 20) {
            this.gunPosition++;
            gunTransform.setTranslate(this.gunPosition, 0);
        };
    },
    missileRunning: false,
    get isMissileRunning() {
        return this.missileRunning
    },
    missileLocation: {},
    set missilePosition(val) {
        this.missileLocation = val;
        missileTransform.setTranslate(val.x, val.y)
    },
    get missilePosition() {
        return this.missileLocation
    },
    get fireCommand() {
        if (control.button3On) {
            control.button3On = false;
            return true
        } else {
            return false
        };
    },
    get startMissileRunning() {
        this.missileRunning = true;
        this.missilePosition = {
            x: this.gunPosition + .5,
            y: 140
        };
        missile.setAttribute("display", "inline");
    },
    get stopMissileRunning() {
        this.missileRunning = false;
        missile.setAttribute("display", "none");
        fire = false;
    },
    invaderCount: undefined,
    invaderIndex: 0,
    horizontalMax: 150,
    groundY: 135,
    sideReached: false,
    firstInvader: false,
    bottomReached: false,
    invaderMove: function(val) {
        if (val.x) {
            invaders[this.invaderIndex].x.baseVal.value += val.x;
            if (invaders[this.invaderIndex].x.baseVal.value < 25 - this.horizontalMax || invaders[this.invaderIndex].x.baseVal.value > this.horizontalMax - 35) {
                this.sideReached = true;
            };
        };
        if (val.y) {
            invaders[this.invaderIndex].y.baseVal.value += val.y;
            if (invaders[this.invaderIndex].y.baseVal.value > this.groundY) {
                this.bottomReached = true;
            };
        };
    },
    allInvadersMove: function(val) {
        var index = this.invaderIndex;
        for (this.invaderIndex in invaders) {
            if (!invaders[this.invaderIndex].dead) {
                this.invaderMove(val);
            };
        };
        this.invaderIndex = index;
    },
    get switchInvaderImage() {
        if (invaders[this.invaderIndex].href.baseVal.slice(-1) != "b") {
            invaders[this.invaderIndex].href.baseVal += "b"
        } else {
            invaders[this.invaderIndex].href.baseVal = invaders[this.invaderIndex].href.baseVal.slice(0, -1)
        }
    },
    get nextInvader() {
        this.firstInvader = false;
        do {
            this.invaderIndex++;
            if (this.invaderIndex >= invaders.length) {
                this.firstInvader = true;
                this.invaderIndex = 0;
            };
        } while (invaders[this.invaderIndex].dead && this.invaderCount > 0);
    },
    displayScore: function(val, pos, seconds) {
        scoreDisplay.textContent = val;
        scoreDisplay.setAttribute("x", pos.x);
        scoreDisplay.setAttribute("y", pos.y + 10);
        scoreDisplay.setAttribute("display", "inline");
        setTimeout('scoreDisplay.setAttribute("display","none")', seconds * 1000);
    },
    currentScore: 0,
    get score() {
        return this.currentScore
    },
    set score(val) {
        this.currentScore = val;
        scoreBoard.textContent = "0000".concat(this.currentScore, "0").slice(-6);
    },
    invaderValue: function(n) {
        return Number(invaders[n].getAttribute("pts"))
    },
    killInvader: function(n) {
        invaders[n].href.baseVal = "#Explosion";
        setTimeout('invaders[' + n + '].setAttribute("display","none");', 50);
        this.invaderCount--;
        invaders[n].dead = true;
    },
    get runGunExplosionAnimation() {
        setTimeout('gun.href.baseVal="#GunExplosion"', 250);
        setTimeout('gun.href.baseVal="#GunExplosionAlt"', 500);
        setTimeout('gun.href.baseVal="#GunExplosion"', 750);
        setTimeout('gun.href.baseVal="#GunExplosionAlt"', 1000);
        setTimeout('gun.href.baseVal="#GunExplosion"', 1250);
        setTimeout('gun.href.baseVal="#GunExplosionAlt"', 1500);
        setTimeout('gun.href.baseVal="#GunExplosion"', 1750);
        setTimeout('gun.href.baseVal="#GunExplosionAlt"', 2000);
        setTimeout('gun.href.baseVal="#GunExplosion"', 2250);
        setTimeout('gun.href.baseVal="#GunExplosionAlt"', 2500);
        setTimeout('gun.href.baseVal="#GunExplosion"', 2750);
        setTimeout('gun.href.baseVal="#GunExplosionAlt"', 3000);
        setTimeout('gun.href.baseVal="#Gun"', 3250);
    },
    get killGun() {
        setTimeout('gun.setAttribute("display","none")', 3250);
    },
    get allInvadersGone() {
        return this.invaderCount == 0
    },
    invaderInside: function(position) {
        for (var invaderNum in invaders) {
            if (invaders[invaderNum].dead) {
                continue;
            };
            if (position.x > invaders[invaderNum].x.baseVal.value && position.x < invaders[invaderNum].x.baseVal.value + 11 && position.y > invaders[invaderNum].y.baseVal.value && position.y < invaders[invaderNum].y.baseVal.value + 6) {
                return invaderNum
            };
        };
        return false
    },
    baseInside: function(position) {
        for (var baseNum in bases) {
            if (!bases[baseNum].exists) {
                continue;
            };
            if (position.x > bases[baseNum].x.baseVal.value && position.x < bases[baseNum].x.baseVal.value + 24 && position.y > bases[baseNum].y.baseVal.value && position.y < bases[baseNum].y.baseVal.value + 16) {
                return baseNum
            };
        };
        return false
    },
    get pickRandomInvader() {
        var ind = Math.floor(Math.random() * invaders.length);
        var step = 0;
        while (ind >= invaders.length || invaders[ind].dead) {
            step++;
            if (step > invaders.length) {
                return false;
            };
            ind -= step;
            if (ind >= 0 && !invaders[ind].dead) {
                break;
            };
            step++;
            ind += step;
        };
        return ind
    },
    invaderPosition: function(n) {
        return {
            x: invaders[n].x.baseVal.value,
            y: invaders[n].y.baseVal.value
        }
    },
    bombPosition: function(n) {
        return {
            x: bombs[n].x.baseVal.value,
            y: bombs[n].y.baseVal.value
        }
    },
    get resetInvaders() {
        for (var i in invaders) {
            invaders[i].x.baseVal.value = invaders[i].oldx;
            invaders[i].y.baseVal.value = invaders[i].oldy + this.level * 10;
            invaders[i].href.baseVal = invaders[i].oldimage;
            invaders[i].setAttribute("display", "inline");
            invaders[i].dead = false;
        };
        this.invaderCount = invaders.length;
        this.bottomReached = false;
        this.sideReached = false;
        this.invaderIndex = 0;
    },
    startBombRunning: function(val) {
        for (var i in bombs) {
            if (bombs[i].getAttribute("display") != "none") {
                continue;
            };
            bombs[i].x.baseVal.value = val.x + 4;
            bombs[i].y.baseVal.value = val.y + 7;
            bombs[i].setAttribute("display", "inline");
            return i
        };
        return false
    },
    stopBomb: function(n) {
        if (n in bombs) {
            bombs[n].setAttribute("display", "none")
        };
    },
    get stopAllBombs() {
        for (var i in bombs) {
            bombs[i].setAttribute("display", "none")
        };
    },
    get bombsMove() {
        for (var i in bombs) {
            if (bombs[i].getAttribute("display") != "none") {
                bombs[i].y.baseVal.value += Number(bombs[i].getAttribute("speed"));
                if (bombs[i].y.baseVal.value > this.groundY) {
                    this.stopBomb(i);
                };
            };
        };
    },
    get bombInsideGun() {
        for (var i in bombs) {
            if (bombs[i].y.baseVal.value > 130 && bombs[i].getAttribute("display") != "none" && bombs[i].x.baseVal.value > this.gunPosition - 9 && bombs[i].x.baseVal.value < this.gunPosition + 7) {
                return i
            };
        };
        return undefined
    },
    get bombInsideBase() {
        for (var i in bombs) {
            if (bombs[i].getAttribute("display") != "none") {
                var base = this.baseInside({
                    x: Number(bombs[i].x.baseVal.value + 1),
                    y: Number(bombs[i].y.baseVal.value + 9)
                });
                if (base) {
                    return ({
                        bomb: i,
                        base: base
                    })
                };
            };
        };
        return undefined
    },
    get anotherGun() {
        for (var i in spareGuns) {
            if (spareGuns[i].getAttribute("display") != "none") {
                spareGuns[i].setAttribute("display", "none");
                return true
            };
        };
        return false
    },
    get resetGuns() {
        for (var i in spareGuns) {
            spareGuns[i].setAttribute("display", "inline");
        };
        gun.href.baseVal = "#Gun";
        gun.setAttribute("display", "inline");
    },
    get resetBases() {
        for (var i in bases) {
            bases[i].setAttribute("opacity", "1");
            bases[i].exists = true;
        };
    }
};
