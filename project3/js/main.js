"use strict";
const app = new PIXI.Application(800,600);
let universe = PIXI.Sprite.fromImage("images/universe.jpg"); //https://cdn.pixabay.com/photo/2017/11/14/05/14/universe-2947500_960_720.jpg
app.renderer.transparent = true;
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;
const NUM_STARS = 300;
const NUM_CONSTELLATIONS = 13;

//************************Taken from smooth keyboard demo********************************
const keyboard = Object.freeze({
    Q:          81,
    E:          69
});

// this is the "key daemon" that we poll every frame
const keys = [];

window.onkeyup = (e) => {
    //console.log("keyup=" + e.keyCode);
    keys[e.keyCode] = false;
    e.preventDefault();
};

window.onkeydown = (e)=>{
    //console.log("keydown=" + e.keyCode);
    keys[e.keyCode] = true;

    // checking for other keys - ex. 'p' and 'P' for pausing
    let char = String.fromCharCode(e.keyCode);
    if (char == "p" || char == "P"){
        // do something
    }
};
//***************************************************************************************

//create user constellations
let constellations = [];
for(let i = 1; i <= NUM_CONSTELLATIONS; i++)
{
    let constellation = PIXI.Sprite.fromImage("images/constellations/" + i + ".png");
    constellations.push(constellation);
}

// Create the stars
let stars = [];
for(let i = 0; i < NUM_STARS; i++)
{
    let star = PIXI.Sprite.fromImage("images/star.png");
    star.anchor.x = 0;
    star.anchor.y = 0;
    star.position.x = Math.random() * sceneWidth;
    star.position.y = Math.random() * sceneHeight;
    star.width = sceneWidth * 0.006;
    //star.width = sceneWidth * 0.02;
    star.height = sceneHeight * 0.006;
    //star.height = sceneHeight * 0.02;
    stars.push(star);
}

//create target constellations
let bigStars = [];
for(let i = 1; i <= NUM_CONSTELLATIONS; i++)
{
    let bigStar = PIXI.Sprite.fromImage("images/constellations/" + i + ".png");
    bigStar.anchor.set(0, 0);
    bigStar.rotation += Math.random() * 360;
    bigStars.push(bigStar);
}

// aliases
let stage;

//containers
let startScene, gameScene, gameOverScene, difficultyScene;

//sprites
let userConstellation, targetConstellation;

//labels
let constellationName, lifeLabel;
let gameOverScoreLabel = new PIXI.Text("You synchronized ");
let winLabel = new PIXI.Text("Congratulations!");

//sounds
let milkyWay;
let chime;
let errorNote;
let closeTone;

//numeric variables
let life = 10;
let levelNum = 1;

let paused = true;

function setup()
{
    stage = app.stage;
    stage.addChild(universe); //background image
    for(let i = 0; i < stars.length; i++) //add all the stars to the stage
    {
        stage.addChild(stars[i]);
    }
    
    // #1 - Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);
    
    //create "choose your difficulty" scene
    difficultyScene = new PIXI.Container();
    difficultyScene.visible = false;
    stage.addChild(difficultyScene);
    
    // #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);
    
    // #3 - Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);
    
    // #4 - Create labels for all 3 scenes
    createLabelsAndButtons();
    
    // #5 - Create userConstellation
    userConstellation = constellations[0];
    userConstellation.pivot.x = sceneWidth/8;
    userConstellation.pivot.y = sceneHeight/8;
    gameScene.addChild(userConstellation);

    //create sounds
    milkyWay = new Howl({
        src: ['sounds/milkyWay.mp3'],
        loop: true
    });

    chime = new Howl({
        src: ['sounds/chime.mp3']
    });

    errorNote = new Howl({
        src: ['sounds/error.mp3']
    });
    
    closeTone = new Howl({
        src: ['sounds/closeTone.mp3']
    });
    
    // #8 - Start update loop
    app.ticker.add(gameLoop);
}

function createLabelsAndButtons()
{
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFFEB7A,
        fontSize: 35,
        fontWeight: "bold",
        fontFamily: "Megrim"});
    
    //1 - setup startScene
    //1A - make the top start label
    let startLabel1 = new PIXI.Text("SYNCHRO SPACE");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFFEB7A,
        fontSize: 60,
        fontWeight: "bold",
        fontFamily: 'Megrim'});
    startLabel1.x = 180;
    startLabel1.y = 90;
    startScene.addChild(startLabel1);
    
    //1C - make the start game button
    let startButton = new PIXI.Text("START");
    startButton.style = buttonStyle;
    startButton.x = 350;
    startButton.y = sceneHeight - 200;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", chooseDifficulty);
    startButton.on("pointerover", e=>e.target.alpha = 0.7);
    startButton.on("pointerout", e=>e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton);
    
    //"Choose your difficulty" text
    let difficultyText = new PIXI.Text("CHOOSE YOUR DIFFICULTY");
    difficultyText.style = new PIXI.TextStyle({
        fill: 0xFFEB7A,
        fontSize: 60,
        fontWeight: "bold",
        fontFamily: 'Megrim'});
    difficultyText.x = 50;
    difficultyText.y = 90;
    difficultyScene.addChild(difficultyText);
    
    //easy difficulty button
    let easyButton = new PIXI.Text("ASTRONOMY 101");
    easyButton.style = buttonStyle;
    easyButton.x = 250;
    easyButton.y = sceneHeight - 350;
    easyButton.interactive = true;
    easyButton.buttonMode = true;
    easyButton.on("pointerup", easy);
    easyButton.on("pointerover", e=>e.target.alpha = 0.7);
    easyButton.on("pointerout", e=>e.currentTarget.alpha = 1.0);
    difficultyScene.addChild(easyButton);
    
    //medium difficulty button
    let mediumButton = new PIXI.Text("SPACEX EMPLOYEE");
    mediumButton.style = buttonStyle;
    mediumButton.x = 225;
    mediumButton.y = sceneHeight - 275;
    mediumButton.interactive = true;
    mediumButton.buttonMode = true;
    mediumButton.on("pointerup", medium);
    mediumButton.on("pointerover", e=>e.target.alpha = 0.7);
    mediumButton.on("pointerout", e=>e.currentTarget.alpha = 1.0);
    difficultyScene.addChild(mediumButton);
    
    //hard difficulty button
    let hardButton = new PIXI.Text("NEIL DeGRASSE TYSON");
    hardButton.style = buttonStyle;
    hardButton.x = 200;
    hardButton.y = sceneHeight - 200;
    hardButton.interactive = true;
    hardButton.buttonMode = true;
    hardButton.on("pointerup", hard);
    hardButton.on("pointerover", e=>e.target.alpha = 0.7);
    hardButton.on("pointerout", e=>e.currentTarget.alpha = 1.0);
    difficultyScene.addChild(hardButton);
    
    //2 - setup gameScene
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFEB7A,
        fontSize: 28,
        fontWeight: "bold",
        fontFamily: 'Megrim'});
    //2A - make constellation name label
    constellationName = new PIXI.Text();
    constellationName.style = textStyle;
    constellationName.x = 5;
    constellationName.y = 5;
    gameScene.addChild(constellationName);
    
    //2B - make life label
    lifeLabel = new PIXI.Text("Life: ");
    lifeLabel.style = textStyle;
    lifeLabel.x = 5;
    lifeLabel.y = 26;
    gameScene.addChild(lifeLabel);
    
    // 3 - set up `gameOverScene`
    // 3A - make game over text
    let gameOverText = new PIXI.Text("GAME OVER");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFEB7A,
        fontSize: 60,
        fontWeight: "bold",
        fontFamily: "Megrim"});
    gameOverText.style = textStyle;
    gameOverText.x = 250;
    gameOverText.y = 90;
    gameOverScene.addChild(gameOverText);
    
    //make game over score label
    gameOverScoreLabel.style = new PIXI.TextStyle({
        fill: 0xFFEB7A,
        fontSize: 24,
        fontWeight: "bold",
        fontFamily: "Megrim"});
    gameOverScoreLabel.x = 205;
    gameOverScoreLabel.y = sceneHeight - 375;
    gameOverScene.addChild(gameOverScoreLabel);

    //make win label for clearing all 13 levels
    winLabel.style = new PIXI.TextStyle({
        fill: 0xFFEB7A,
        fontSize: 24,
        fontWeight: "bold",
        fontFamily: "Megrim"});
    winLabel.x = 300;
    winLabel.y = sceneHeight - 325;
    //gameOverScene.addChild(winLabel); //don't add it to the scene yet

    // 3B - make "play again?" button
    let playAgainButton = new PIXI.Text("PLAY AGAIN?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 300;
    playAgainButton.y = sceneHeight - 200;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup",startGame);
    playAgainButton.on('pointerover',e=>e.target.alpha = 0.7);
    playAgainButton.on('pointerout',e=>e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(playAgainButton);
}

function chooseDifficulty() //lets the player choose what difficulty to play on
{
    startScene.visible = false;
    difficultyScene.visible = true;
    gameOverScene.visible = false;
    gameScene.visible = false;
}
function easy() //easy difficulty doesn't do anything special, just default stars
{
    startGame();
}
function medium() //medium difficulty makes the stars bigger, making the target constellation slightly harder to find
{
    for(let i = 0; i < NUM_STARS; i++)
    {
        stage.removeChild(stars[i]);
        let star = PIXI.Sprite.fromImage("images/star.png");
        star.anchor.x = 0;
        star.anchor.y = 0;
        star.position.x = Math.random() * sceneWidth;
        star.position.y = Math.random() * sceneHeight;
        star.width = sceneWidth * 0.009;
        //star.width = sceneWidth * 0.02;
        star.height = sceneHeight * 0.009;
        //star.height = sceneHeight * 0.02;
        stars.push(star);
        stage.addChild(stars[i]);
    }
    startGame();
}
function hard() //hard difficulty makes the background stars the same texture as the target constellation
{ //the trick to hard mode is looking for "full circles". The fake stars will look slightly more oval shaped
    for(let i = 0; i < NUM_STARS; i++)
    {
        stage.removeChild(stars[i]);
        let star = PIXI.Sprite.fromImage("images/star2.png");
        star.anchor.x = 0;
        star.anchor.y = 0;
        star.position.x = Math.random() * sceneWidth;
        star.position.y = Math.random() * sceneHeight;
        //star.width = sceneWidth * 0.006;
        star.width = sceneWidth * 0.02;
        //star.height = sceneHeight * 0.006;
        star.height = sceneHeight * 0.02;
        stars.push(star);
        stage.addChild(stars[i]);
    }
    startGame();
}

function startGame() //do this at the start of every game
{
    startScene.visible = false;
    difficultyScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    
    //set numerics
    levelNum = 1;
    life = 10;
    
    //set user constellation properties
    userConstellation.x = 300;
    userConstellation.y = 550;
    
    //set target constellation properties
    targetConstellation = bigStars[0];
    targetConstellation.pivot.x = sceneWidth/8;
    targetConstellation.pivot.y = sceneHeight/8;
    targetConstellation.x = randomIntBetween(150, sceneWidth-100);
    targetConstellation.y = randomIntBetween(150, sceneHeight-100);
    targetConstellation.rotation += Math.random() * 360;
    stage.addChild(targetConstellation);
    
    //set labels and sounds
    lifeLabel.text += life;
    gameOverScoreLabel.text = "You synchronized ";
    milkyWay.play();
    loadLevel();
}

function gameLoop() //the main "game"
{
    if (paused) return;

    // #1 - Calculate "delta time"
    let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;

    // #2 - Move Ship
    let mousePosition = app.renderer.plugins.interaction.mouse.global;
    //userConstellation.position = mousePosition;
    
    let amt = 6 * dt; //at 60 FPS would move about 10% of distance per update
    
    //lerp (linear interpolate) the x & y values with lerp()
    let newX = lerp(userConstellation.x, mousePosition.x, amt);
    let newY = lerp(userConstellation.y, mousePosition.y, amt);
    
    //keep the userConstellation on the screen with clamp()
    let w2 = userConstellation.width / 2;
    let h2 = userConstellation.height / 2;
    userConstellation.x = clamp(newX, 0+w2. sceneWidth-w2);
    userConstellation.y = clamp(newY, 0+h2, sceneHeight);

    // #7 - Is game over?
    if(levelNum > NUM_CONSTELLATIONS || life < 1)
    {
        end();
        return; // return here so we skip #8 below
    }

    if(keys[keyboard.Q]) //if Q is pressed
    {
        userConstellation.rotation -= 0.8 * dt; //rotate counter clockwise
    }
    if(keys[keyboard.E]) //if E is pressed
    {
        userConstellation.rotation += 0.8 * dt; //rotate clockwise
    }

    app.view.onclick = checkLocation; //onclick, check if location is correct or not. If it's correct, load next level
}

function loadLevel() //loads a new level
{
    for(let i = 0; i < stars.length; i++) //remove and re-add stars to stage (to randomize position every level)
    {
        stage.removeChild(stars[i]);
        stars[i].position.x = Math.random() * sceneWidth;
        stars[i].position.y = Math.random() * sceneHeight;
        stage.addChild(stars[i]);
    }
    
    //remove and re-add new target constellation
    stage.removeChild(targetConstellation);
    targetConstellation = bigStars[levelNum-1];
    targetConstellation.anchor.set(0, 0);
    targetConstellation.x = randomIntBetween(150, sceneWidth-100);
    targetConstellation.y = randomIntBetween(150, sceneHeight-100);
    targetConstellation.pivot.x = sceneWidth/8;
    targetConstellation.pivot.y = sceneHeight/8;
    targetConstellation.rotation += Math.random() * 360;
    stage.addChild(targetConstellation);

    //remove and re-add user constellation
    gameScene.removeChild(userConstellation);
    userConstellation = constellations[levelNum-1];
    userConstellation.pivot.x = sceneWidth/8;
    userConstellation.pivot.y = sceneHeight/8;
    gameScene.addChild(userConstellation);

    //change constellation name displayed
    constellationName.text = displayName();

    paused = false;
}

function end() //do this when the game ends
{
    paused = true;
    //clear out level
    milkyWay.stop();
    stage.removeChild(targetConstellation);
    
    if(levelNum >= NUM_CONSTELLATIONS) //if player finished all levels
    {
        gameOverScoreLabel.text = "You synchronized all constellations!";
        gameOverScene.addChild(winLabel); //print congratulations message
    }
    else //just tell the player how many levels they cleared
    {
        gameOverScoreLabel.text += levelNum-1 + " constellations";
    }

    gameOverScene.visible = true;
    gameScene.visible = false;
}

function randomIntBetween(min, max) //https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
{
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function decreaseLifeBy(value)
{
    life -= value;
    life = parseInt(life);
    lifeLabel.text = `Life: ${life}`;
}

function checkLocation(e) //checks the location of the user constellation where the player clicked
{
    if(userConstellation.x >= targetConstellation.x-10 && userConstellation.x <= targetConstellation.x+10 
    && userConstellation.y >= targetConstellation.y-10 && userConstellation.y <= targetConstellation.y+10) //if the userConstellation is within 10px of the targetConstellation
    {
        chime.play();
        levelNum++;
        if(levelNum <= NUM_CONSTELLATIONS) //if last level hasn't been reached, load next level
        {
            loadLevel();
        }
    }
    else if(userConstellation.x >= targetConstellation.x-100 && userConstellation.x <= targetConstellation.x+100 
         && userConstellation.y >= targetConstellation.y-100 && userConstellation.y <= targetConstellation.y+100) //if the userConstellation is within 100px of the targetConstellation
    {
        closeTone.play();
        decreaseLifeBy(1);
    }
    else //if userConstellation is greater than 100px away from targetConstellation
    {
        errorNote.play();
        decreaseLifeBy(2);
    }
}

function displayName() //changes the constellation name displayed on the top left
{
    if(userConstellation == constellations[0])
    {
        constellationName.text = "Aquarius";
    }
    else if(userConstellation == constellations[1])
    {
        constellationName.text = "Aries";
    }
    else if(userConstellation == constellations[2])
    {
        constellationName.text = "Cancer";
    }
    else if(userConstellation == constellations[3])
    {
        constellationName.text = "Capricorn";
    }
    else if(userConstellation == constellations[4])
    {
        constellationName.text = "Gemini";
    }
    else if(userConstellation == constellations[5])
    {
        constellationName.text = "Leo";
    }
    else if(userConstellation == constellations[6])
    {
        constellationName.text = "Libra";
    }
    else if(userConstellation == constellations[7])
    {
        constellationName.text = "Orion";
    }
    else if(userConstellation == constellations[8])
    {
        constellationName.text = "Pisces";
    }
    else if(userConstellation == constellations[9])
    {
        constellationName.text = "Sagittarius";
    }
    else if(userConstellation == constellations[10])
    {
        constellationName.text = "Scorpio";
    }
    else if(userConstellation == constellations[11])
    {
        constellationName.text = "Taurus";
    }
    else if(userConstellation == constellations[12])
    {
        constellationName.text = "Virgo";
    }

    return constellationName.text;
}

















