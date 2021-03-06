console.log("Lib 'Manage' loaded");

requirejs(["resource"], function(util) {
	requirejs(["pojo"], function(util) {
		requirejs(["map"], function(util) {
			requirejs(["weapon"], function(util) {
				requirejs(["movement"], function(util) {
					requirejs(["collision"], function(util) {
						requirejs(["sound"], function(util) {
							loadImages();
							loadSounds();
							init();
						});
					});
				});
			});
		});
	});
});

const _LifePlayer   = 2,  _TimeProtected                = 125, _PointsTouchBlock = 2,  _MunitionWeapon1 = 999999,
	  _LifeBlock    = 3,  _TimeChangeLevel              = 150, _PointsTouchEnemy = 4,  _MunitionWeapon2 = 500,
	  _LifeEnemy1   = 6,  _TimeRechargeHome             = 75,  _PointsKillBlock  = 5,  _MunitionWeapon3 = 50,
	  _LifeEnemy2   = 15, _TimeShowExplosionEnemy       = 40,  _PointsKillEnemy  = 10,
	  _LifeEnemy3   = 21, _TimeShowDamagedEnemy         = 10,  _PointsGetLife    = 3,
	  _HealthPlayer = 6,  _TimeReturnShootEnemy         = 30,
	  				      _TimeReturnShootPlayerWeapon1 = 5,
	  				      _TimeReturnShootPlayerWeapon2 = 10,
	  				      _TimeReturnShootPlayerWeapon3 = 20,

	  _DamageWeapon1        = 1,
	  _DamageWeapon2        = 1,
	  _DamageWeapon3        = 30,
	  _DamageExplosionEnemy = _LifeEnemy3,

	  _SizeBlock = 20,
	  _SizeWeapon = 4,
	  _SizeWeapon3Width = 4, _SizeWeapon3Height = 4,
	  // _SizeWeapon3Width = 8, _SizeWeapon3Height = 15,
	  _MaxRebounds = 100,
	  _SpeedEnemy = 2,
	  _LimitLives = 50,
	  _LimitPoints = 999999999;

var canvas = null, ctx = null;
var key = null;
var keyPressed = [];

var info          = true,
	pause         = false,
	gameOver      = false,
	fullScreen    = false,
	sound         = false,
	friendlyFire  = true,
	damage        = false,
	templateLight = false;

var iPlayer      = new Image(),
	iEnemy1      = new Image(),
	iEnemy2      = new Image(),
	iEnemy3      = new Image(),
 	iLife        = new Image(),
 	iFire    	 = new Image(),
 	iBlockWhite  = new Image(),
 	iBlockGray   = new Image(),
 	iBlockBrown0 = new Image(),
 	iBlockBrown1 = new Image(),
 	iBlockBrown2 = new Image(),
 	iBlockBrown3 = new Image(),
 	iBullet3     = new Image();

var sWeapon1      = new Audio(),
	sWeapon2      = new Audio(),
	sWeapon3      = new Audio(),
	sWeaponEnemy  = new Audio(),
	sGetLife      = new Audio(),
	sLoseLife     = new Audio(),
	sRebounds     = new Audio(),
	sContinue     = new Audio(),
	sNoMunition   = new Audio(),
	sPortalInput  = new Audio(),
	sPortalOutput = new Audio(),
	sGameOver     = new Audio(),
	sExplosion    = new Audio(),
	sHome         = new Audio(),
	sMap1         = new Audio(),
	sMap2         = new Audio(),
	sMap3         = new Audio(),
	sMap4         = new Audio(),
	sMap5         = new Audio(),
	sMap6         = new Audio();

function init(){
	canvas = document.getElementsByTagName('canvas')[0];
	ctx = canvas.getContext('2d');

	loadConfigTemplate();
	createMap();
	reset();

	console.log("\nStart Game!");
	run();
}

function loadImages(){
	console.log("Images loaded");
	iPlayer.src      = 'assets/img/player1.png';
	iEnemy1.src      = 'assets/img/satellite1.png';
	iEnemy2.src      = 'assets/img/ufo.png';
	iEnemy3.src      = 'assets/img/drone.png';
	iLife.src        = 'assets/img/life1.png';
	iFire.src    	 = 'assets/img/fire2.png';
	iBlockWhite.src  = 'assets/img/blockWhite.png';
	iBlockGray.src   = 'assets/img/blockGray.png';
	iBlockBrown0.src = 'assets/img/blockBrown0.png';
	iBlockBrown1.src = 'assets/img/blockBrown1.png';
	iBlockBrown2.src = 'assets/img/blockBrown2.png';
	iBlockBrown3.src = 'assets/img/blockBrown3.png';
}

function loadSounds(){
	console.log("Sounds loaded");
	sWeapon1.src      = 'assets/audio/weapon1.wav';
	sWeapon2.src      = 'assets/audio/weapon1.wav';
	sWeapon3.src      = 'assets/audio/weapon3.wav';
	sWeaponEnemy.src  = 'assets/audio/weaponEnemy.wav';
	sGetLife.src      = 'assets/audio/blip.wav';
	sLoseLife.src     = 'assets/audio/error.wav';
	sRebounds.src     = 'assets/audio/rebounds.wav';
	sContinue.src     = 'assets/audio/recharge.wav';
	sNoMunition.src   = 'assets/audio/noMunition.wav';
	sPortalInput.src  = 'assets/audio/process4.wav';
	sPortalOutput.src = 'assets/audio/life.wav';
	sGameOver.src     = 'assets/audio/gameOver.wav';
	sExplosion.src    = 'assets/audio/explosion.wav';
	sHome.src         = 'assets/audio/magic.wav';
	sMap1.src         = 'assets/audio/map1.wav';
	sMap2.src         = 'assets/audio/map2.wav';
	sMap3.src         = 'assets/audio/map2.wav';
	sMap4.src         = 'assets/audio/map2.wav';
	sMap5.src         = 'assets/audio/map2.wav';
	sMap6.src         = 'assets/audio/map2.wav';
}

function loadConfigTemplate(){
	console.log("Config of template loaded");
	templateSetSound(sound);
	templateSetFullscreen(fullScreen);
	templateSetLight(templateLight);
}

function reset(){
	console.log("Map loaded");
	player.score         = 0;
	player.health        = _HealthPlayer;
	player.life          = _LifePlayer;
	player.munition1     = _MunitionWeapon1;
	player.munition2     = _MunitionWeapon2;
	player.munition3     = _MunitionWeapon3;
	player.timeProtected = 0;
	gameOver             = false;
	// loadMap("map_1", 270, 330, 0);
	loadMap("map_1", 479, 339, 0);

	// Map to create animated gifs, to show the game's features in Github
	// loadMap("map_11", 290, 81, 90);
}

function run(){
	requestAnimFrame(run);
	game();
	draw();
	templateSetPoints(player.score);
	templateSetWeapon1(player.munition1);
	templateSetWeapon2(player.munition2);
	templateSetWeapon3(player.munition3);
	templateSetLives(player.life);
	templateSetHealth(player.health);
}

function game(){
    if(!pause){
	    movementPlayer();
		movementEnemy();
		weapon1(player, player.bullets1);
		weapon2(player, player.bullets2);
		weapon3(player, player.bullets3, _SizeWeapon3Width, _SizeWeapon3Height);
		collision();
		basicConditions();
	}
	keyboard();
}

function draw() {
	ctx.clearRect(0,0,canvas.width,canvas.height);

	// if(typeof enemy[0] != "undefined")
	// 	rectangle(ctx, enemy[0].x,enemy[0].y,enemy[0].width,enemy[0].height + 125, "#692A03");

	// player -> home
	for(i in home){
		if(player.timeRechargeHome > 0)
  			ctx.strokeStyle = (player.timeRechargeHome%3 == 0) ? "#022939" : "#03404A";
		else
  			ctx.strokeStyle = "#03404A";
		roundRect(ctx, home[i].x, home[i].y, home[i].width, home[i].height, 30, false, true);
	}

	// bullets1 -> home
	for(i in player.bullets1){
		for(j in home){
			if(player.bullets1[i].collide(home[j]))
				roundRect(ctx, home[j].x, home[j].y, home[j].width, home[j].height, 20, false, true, null, "#692A03");
		}
	}

	// bullets2 -> home
	for(i in player.bullets2){
		for(j in home){
			if(player.bullets2[i].collide(home[j]))
				roundRect(ctx, home[j].x, home[j].y, home[j].width, home[j].height, 20, false, true, null, "#692A03");
		}
	}

	for(i in portalInput){
		if(player.timeChangeLevel > 0)
			ctx.fillStyle = (player.timeChangeLevel%3 == 0) ? '#011224' : '#07213C';
		else
			ctx.fillStyle = '#07213C';

		roundRect(ctx,portalInput[i].x,portalInput[i].y,portalInput[i].width,portalInput[i].height,25,true,true,null,"#8A0A0A");
	}

	for(i in portalOutput){
		if(player.timeChangeLevel > 0)
			ctx.fillStyle = (player.timeChangeLevel%3 == 0) ? '#011224' : '#07213C';
		else
			ctx.fillStyle = '#07213C';

		roundRect(ctx,portalOutput[i].x,portalOutput[i].y,portalOutput[i].width,portalOutput[i].height,25,true,true,null,"#8A0A0A");
	}

	if(player.timeProtected > 0){
		if(player.timeProtected%2 == 0)
			showPlayerRotated();
	}else
		showPlayerRotated();

	if(typeof life != "undefined")
		ctx.drawImage(iLife,life.x,life.y,life.width,life.height);

	for(i in enemy){
		if(enemy[i].life > 0){
			if(enemy[i].timeShowDamage > 0){
				if(enemy[i].timeShowDamage%2 == 0){
					if(enemy[i].movement == "horizontal" || enemy[i].movement == "vertical")
						ctx.drawImage(iEnemy1,enemy[i].x,enemy[i].y,enemy[i].width,enemy[i].height);
					else if(enemy[i].movement == "random")
						ctx.drawImage(iEnemy2,enemy[i].x,enemy[i].y,enemy[i].width,enemy[i].height);
					else if(enemy[i].movement == "chaseHor")
						ctx.drawImage(iEnemy3,enemy[i].x,enemy[i].y,enemy[i].width,enemy[i].height);
					else
						ctx.drawImage(iEnemy1,enemy[i].x,enemy[i].y,enemy[i].width,enemy[i].height);
				}
			}else{
				if(enemy[i].movement == "horizontal" || enemy[i].movement == "vertical")
					ctx.drawImage(iEnemy1,enemy[i].x,enemy[i].y,enemy[i].width,enemy[i].height);
				else if(enemy[i].movement == "random"){
					// if(enemy[i].timeChangeImg <= 0)
					// 	enemy[i].timeChangeImg = 100;
					// if(enemy[i].timeChangeImg%8 == 0)
					// 	ctx.drawImage(iEnemy21,enemy[i].x,enemy[i].y,enemy[i].width,enemy[i].height);
					// else
					// 	ctx.drawImage(iEnemy22,enemy[i].x,enemy[i].y,enemy[i].width,enemy[i].height);
						ctx.drawImage(iEnemy2,enemy[i].x,enemy[i].y,enemy[i].width,enemy[i].height);
				}else if(enemy[i].movement == "chaseHor")
					ctx.drawImage(iEnemy3,enemy[i].x,enemy[i].y,enemy[i].width,enemy[i].height);
				else
					ctx.drawImage(iEnemy1,enemy[i].x,enemy[i].y,enemy[i].width,enemy[i].height);
			}
		}else{
	  		if(enemy[i].setTimeOnlyOnce){
	  			enemy[i].timeShowExplosion = _TimeShowExplosionEnemy;
	  			enemy[i].setTimeOnlyOnce = false;

	  			// Save the enemy's data
				enemy[i].copyX = enemy[i].x;
				enemy[i].copyY = enemy[i].y;
				enemy[i].copyWidth = enemy[i].width;
				enemy[i].copyHeight = enemy[i].height;

	  			// Increase the enemy size to collides with blockBrown and destroy it
	  			// The x,y axis are to center the collision zone (square) with the visual explosion (circle)
				enemy[i].x -= enemy[i].width/2;
				enemy[i].y -= enemy[i].height/2;
	  			enemy[i].width = _SizeBlock*2;
				enemy[i].height = _SizeBlock*2;

				// enemy[i].XTest = enemy[i].width/2;
				// enemy[i].YTest = enemy[i].height/2;
				// enemy[i].widthTest = _SizeBlock*2;
				// enemy[i].heightTest = _SizeBlock*2;
	  		}
			if(enemy[i].timeShowExplosion > 0){
				// Put the explosion in enemy's initial position
				var centerX = enemy[i].copyX+enemy[i].copyWidth/2;
				var centerY = enemy[i].copyY+enemy[i].copyHeight/2;
				if(enemy[i].sizeExplosion <= enemy[i].copyWidth && !pause)
					enemy[i].sizeExplosion++;

				// if(enemy[i].x <= centerX && !pause)
				// 	enemy[i].x--;
				// if(enemy[i].y <= centerY && !pause)
				// 	enemy[i].y--;
				// if(enemy[i].width <= enemy[i].widthTest && !pause)
				// 	enemy[i].width++;
				// if(enemy[i].height <= enemy[i].heightTest && !pause)
				// 	enemy[i].height++;

				// rectangle(ctx, enemy[i].x, enemy[i].y, enemy[i].width, enemy[i].height, "#D38600");
				circle(ctx, centerX, centerY, enemy[i].sizeExplosion, "#6B0801", "#6B1601", 5);
			}else
				enemy.splice(i,1);
		}
	}

	for(i in blockBrown){
		if(blockBrown[i].life == 0)
			ctx.drawImage(iBlockBrown3,blockBrown[i].x,blockBrown[i].y,blockBrown[i].width,blockBrown[i].height);
		else if(blockBrown[i].life == 1)
			ctx.drawImage(iBlockBrown2,blockBrown[i].x,blockBrown[i].y,blockBrown[i].width,blockBrown[i].height);
		else if(blockBrown[i].life == 2)
			ctx.drawImage(iBlockBrown1,blockBrown[i].x,blockBrown[i].y,blockBrown[i].width,blockBrown[i].height);
		else if(blockBrown[i].life == 3)
			ctx.drawImage(iBlockBrown0,blockBrown[i].x,blockBrown[i].y,blockBrown[i].width,blockBrown[i].height);
	}

	for(i in blockGray)
		ctx.drawImage(iBlockGray,blockGray[i].x,blockGray[i].y,blockGray[i].width,blockGray[i].height);

	for(i in blockWhiteVert)
		ctx.drawImage(iBlockWhite,blockWhiteVert[i].x,blockWhiteVert[i].y,blockWhiteVert[i].width,blockWhiteVert[i].height);

	for(i in blockWhiteHor)
		ctx.drawImage(iBlockWhite,blockWhiteHor[i].x,blockWhiteHor[i].y,blockWhiteHor[i].width,blockWhiteHor[i].height);

	for(i in fire)
		ctx.drawImage(iFire,fire[i].x,fire[i].y,fire[i].width,fire[i].height);

	for(i in player.bullets1){
		// ctx.drawImage(iBullet1,player.bullets1[i].x,player.bullets1[i].y,player.bullets1[i].width,player.bullets1[i].height);
  		rectangle(ctx, player.bullets1[i].x,player.bullets1[i].y,player.bullets1[i].width,player.bullets1[i].height, "#614E70");
  		// rectangle(ctx, player.bullets1[i].x,player.bullets1[i].y,player.bullets1[i].width,player.bullets1[i].height, "#FBD490");
	}

	for(i in player.bullets2)
  		rectangle(ctx, player.bullets2[i].x,player.bullets2[i].y,player.bullets2[i].width,player.bullets2[i].height, "#4A6192");

	for(i in player.bullets3){
		var bullet = player.bullets3[i];
		if(!bullet.isCollide){
  			rectangle(ctx, bullet.x,bullet.y,bullet.width,bullet.height, "#EBC803");
  			// showBullet3Rotated();
		}else{
			if(bullet.setTimeOnlyOnce){
	  			bullet.timeShowExplosion = _TimeShowExplosionEnemy;
	  			bullet.setTimeOnlyOnce = false;

	  			// Save the bullet's data
				bullet.copyX = bullet.x;
				bullet.copyY = bullet.y;
				bullet.copyWidth = bullet.width;
				bullet.copyHeight = bullet.height;

	  			// Increase the bullet size to collides with blockBrown and destroy it
	  			// The x,y axis are to center the collision zone (square) with the visual explosion (circle)
	  			bullet.width = _SizeBlock*2;
				bullet.height = _SizeBlock*2;
				bullet.x -= bullet.width/2;
				bullet.y -= bullet.height/2;

				// Tweak the alignment
				bullet.x += 2;
				bullet.y += 2;
	  		}
			if(player.bullets3[i].timeShowExplosion > 0){
				// Put the explosion in bullet's initial position
				var centerX = bullet.copyX+bullet.copyWidth/2;
				var centerY = bullet.copyY+bullet.copyHeight/2;
				if(bullet.sizeExplosion <= _SizeBlock && !pause)
					bullet.sizeExplosion++;
				// rectangle(ctx, bullet.x, bullet.y, bullet.width, bullet.height, "#D38600");
				circle(ctx, centerX, centerY, bullet.sizeExplosion, "#6B0801", "#6B1601", 5);
			}else
				player.bullets3.splice(i,1);
		}

	}

  	for(i in enemy){
  		for(j in enemy[i].bullets)
  			rectangle(ctx, enemy[i].bullets[j].x,enemy[i].bullets[j].y,enemy[i].bullets[j].width,enemy[i].bullets[j].height, "#4DE700");
  	}

	ctx.font = "10px Verdana";
	ctx.fillStyle = '#fff';
	if(info){
		ctx.fillText('Key: '+key,5,15);
		ctx.fillText('Fps: '+ getFps().toFixed(1),5,30);
		ctx.fillText('Rotation: '+player.rotation,5,45);
		ctx.fillText('Bullets 1: '+player.bullets1.length,5,60);
		ctx.fillText('Bullets 2: '+player.bullets2.length,5,75);
		ctx.fillText('Bullets 2: '+player.bullets3.length,5,90);
		ctx.fillText('Map: '+currentMap.replace("map_",""),5,105);
		// ctx.fillText('Bullets Test: '+bulletsTest.length,5,90);
		// ctx.fillText('Bullets Enemy: '+enemy[0].bulletsEnemy.length,5,105);
		// ctx.fillText('Score: '+player.score,5,30);
		// ctx.fillText('timeChangeLevel: '+player.timeChangeLevel,5,105);
		// ctx.fillText('Weapon2: '+player.munitionWeapon2,5,90);
		// ctx.fillText('Lifes: '+player.life,5,120);
		// ctx.fillText('Time Protection: '+player.timeProtected,5,165);
		// ctx.fillText('Time Level: '+player.timeChangeLevel,5,180);
		// ctx.fillText('Time Home: '+player.timeRechargeHome,5,195);
		// ctx.fillText('Enemy: '+enemy.length,5,210);
		// ctx.fillText('Enemy 1 - Hor/Vert: '+enemy[0].toggleDirection,5,210);
		// ctx.fillText('Enemy 2 - Hor/Vert: '+enemy[1].toggleDirection,5,225);
		// ctx.fillText('Enemy 1 - Dir: '+enemy[0].direction,5,240);
		// ctx.fillText('Enemy 2 - Dir: '+enemy[1].direction,5,255);
		// ctx.fillText('Player - x: '+player.x,5,240);
		// ctx.fillText('Enemy - X: '+enemy[0].x,5,255);
	}

	ctx.font = "18px Verdana";
	ctx.fillStyle = '#FFA112';
	if(pause){
		if(gameOver)
			ctx.fillText('GAME OVER',canvas.width/2 - 35,canvas.height/2 - 10);
		else
			ctx.fillText('PAUSE',canvas.width/2 - 35,canvas.height/2 - 10);
	}
}

function collision(){
	collisionPlayer();
	collisionEnemy();
	collisionLife();
	collisionBullets1();
	collisionBullets2();
	collisionBullets3();
	collisionBulletsEnemy();
}

function basicConditions(){
	if(gameOver){
		pause = true;
		loadSound(sGameOver);
	}else{
		if(player.life > 0){
			if(player.rotation > 360)
				player.rotation = 0;
	   	 	else if(player.rotation < 0)
				player.rotation = 360;

			if(player.timeProtected > 0)
			    player.timeProtected--;
			if(player.timeChangeLevel > 0)
				player.timeChangeLevel--;
			if(player.timeRechargeHome > 0)
				player.timeRechargeHome--;
			if(player.timeReturnShootWeapon1 > 0)
				player.timeReturnShootWeapon1--;
			if(player.timeReturnShootWeapon2 > 0)
				player.timeReturnShootWeapon2--;
			if(player.timeReturnShootWeapon3 > 0)
				player.timeReturnShootWeapon3--;
			for(i in player.bullets3){
				if(player.bullets3[i].timeShowExplosion > 0)
					player.bullets3[i].timeShowExplosion--;
				if(player.bullets3[i].isCollide)
					loadSound(sExplosion);
			}
			if(player.score >= _LimitPoints)
				player.score = _LimitPoints;
			if(player.life >= _LimitLives)
				player.life = _LimitLives;

			// If it's blinking, avoid not display nothing
			if(pause){
				if(player.timeProtected%2 != 0)
					player.timeProtected++;
			}

			if(player.health < 1){
				// Hear the sound of life lose, except in the last: sound of GameOver
				if(player.life != 1)
					loadSound(sLoseLife);
				player.life--;
				if(player.life > 0)
					player.health = _HealthPlayer;
				player.timeProtected = _TimeProtected;
			}

			for(i in enemy){
				if(enemy[i].life > 0){
					if(enemy[i].timeShowDamage > 0){
						enemy[i].timeShowDamage--;
						// If it's blinking, avoid not display nothing
						if(pause){
							if(enemy[i].timeShowDamage%2 != 0)
								enemy[i].timeShowDamage++;
						}
					}
					if(enemy[i].timeReturnShoot > 0)
						enemy[i].timeReturnShoot--;
					// if(enemy[i].timeChangeImg > 0)
					// 	enemy[i].timeChangeImg--;
				}else{
					if(enemy[i].timeShowExplosion > 0)
						enemy[i].timeShowExplosion--;
					loadSound(sExplosion);
				}
				// Bullets continues their movement under any circunstance
				if(enemy[i].bullets.length > 0)
					weaponEnemy(i, false);
			}
		}else
			gameOver = true;
	}
}

function showPlayerRotated(){
	ctx.save();
	ctx.translate(player.x+player.width/2,player.y+player.height/2);
	ctx.rotate(player.rotation*Math.PI/180);
	ctx.drawImage(iPlayer,-player.width/2,-player.height/2, player.width, player.height);
	ctx.restore();
}

// function showBullet3Rotated(){
// 	for(i in player.bullets3){
// 		var bullet = player.bullets3[i];
// 		ctx.save();
// 		ctx.translate(bullet.x+bullet.width/2,bullet.y+bullet.height/2);
// 		ctx.rotate(bullet.rotationFixed*Math.PI/180);
// 		if(!bullet.isCollide)
// 			ctx.drawImage(iBullet3,-bullet.width/2,-bullet.height/2, bullet.width, bullet.height);
// 		ctx.restore();
// 	}
// }

function keyboard(){

	pressKey();

	if(key == formatKey("ENTER")){
		if(gameOver){
			reset();
			loadSound(sContinue);
		}
		pause = !pause;
		if(pause)
			stopSounds();
		else
			playMapSound();

		// There's some conditions only works if the game is paused
		basicConditions();
		key = null;
	}else if(key == formatKey("M")){
		fullScreen = !fullScreen;
		templateSetFullscreen(fullScreen);
		key = null;
	}else if(key == formatKey("S")){
		if(!pause)
			toggleSound();
		key = null;
	}else if(key == formatKey("PadNum1") || key == formatKey("1")){
		loadMap("map_1");
		key = null;
	}else if(key == formatKey("PadNum2") || key == formatKey("2")){
		loadMap("map_2");
		key = null;
	}else if(key == formatKey("PadNum3") || key == formatKey("3")){
		loadMap("map_3");
		key = null;
	}else if(key == formatKey("PadNum4") || key == formatKey("4")){
		loadMap("map_4");
		key = null;
	}else if(key == formatKey("PadNum5") || key == formatKey("5")){
		loadMap("map_5");
		key = null;
	}else if(key == formatKey("PadNum6") || key == formatKey("6")){
		loadMap("map_6");
		key = null;
	}else if(key == formatKey("PadNum7") || key == formatKey("7")){
		info = !info;
		key = null;
	}else if(key == formatKey("PadNum8") || key == formatKey("8")){
		key = null;
	}else if(key == formatKey("R")){
		reset();
		key = null;
	}else if(key == formatKey("F1")){
		player.life++;
		player.health = _HealthPlayer;
		key = null;
	}else if(key == formatKey("F2")){
		player.munition2 = _MunitionWeapon2;
		player.munition3 = _MunitionWeapon3;
		key = null;
	}
}