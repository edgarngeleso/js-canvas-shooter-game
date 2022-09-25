let canvas = document.querySelector("#canvas");
canvas.width = window.innerWidth-200;
canvas.height = window.innerHeight-100;

let game_over = document.querySelector("#game_over");
let game_text = document.querySelector(".game_text");
let game_button = document.querySelector(".game_button");

let context = canvas.getContext("2d");
let isPlaying = false;
let bgImg = new Image();
bgImg.src = "assets/images/bg4.jpg";

let playerImg = new Image();
playerImg.src = "assets/images/player.png";
let enemyImage = new Image();
enemyImage.src = "assets/images/enemyImage.png";
let bulletImage = new Image();
bulletImage.src = "assets/images/bulletImage.png";
let healthImage = new Image();
healthImage.src = "assets/images/health.png";
let platformImage = new Image();
platformImage.src = "assets/images/platform.png";

let loseSound = new Audio();
loseSound.src = "assets/audio/lost.mp3";
let wonSound = new Audio();
wonSound.src = "assets/audio/won.wav";
let hitSound = new Audio();
hitSound.src = "assets/audio/hit.wav";


const collision = (a,b)=>{
    if( a.position.x < b.position.x + b.width 
        && a.position.x + a.width > b.position.x 
        && a.position.y < b.position.y + b.height 
        && a.position.y + a.height > b.position.y ){
        return true;
    }
}

const onTop = (a,b)=>{
    if(a.position.y < b.position.y + b.height 
        && a.position.y + a.height > b.position.y ){
            console.log("On top")
        return true;
    }
}

class Enemy{
    constructor({x,y},image){
        this.position = {x,y};
        this.width = 40;
        this.height = 40;
        this.image = image;
    }

    draw(){
        context.drawImage(this.image,this.position.x,this.position.y,this.width,this.height);
    }

    update(){
        this.draw();
        this.position.x -= 5;
    }
}


class Player{
    constructor({x,y},image){
        this.position = {
            x,
            y
        };
        this.acceleration = 1;
        this.width = 60;
        this.height = 60;
        this.image = image;
        this.speed = 0;
        this.health = 10;
    }

    draw(){
        context.clearRect(0,0,canvas.width,canvas.height);
        //background image
        //first bg image
        context.drawImage(bgImg,0,0,canvas.width,canvas.height);
        //second bg image
        context.drawImage(bgImg,canvas.width,0,canvas.width,canvas.height);
        context.drawImage(this.image,this.position.x,this.position.y,this.width,this.height);

        //health
        context.fillText(`Health:${this.health}`,500,40);
        //context.fillRect(100,0,100,50);
        context.font = "40px sans-serif";
        context.fillStyle = "red";
        context.stroke();
    }

    static shoot(){
        console.log("static")
        return;
    }

    update(){
        if(this.position.x + this.width >= canvas.width){
            this.position.x -= 5;
        }


        if(this.position.y + this.height >= canvas.height){
            this.acceleration = -1;
        }

        if(this.position.y + this.height <= this.height){
            this.acceleration = 1;
        }

        this.draw();
        this.position.y += 0*this.acceleration;
    }

}



class Bullet{
    constructor({x,y},image){
        this.position = {
            x,
            y
        };
        this.width = 20;
        this.height = 20;
        this.image = image;
    }

    draw(){
        context.drawImage(this.image,this.position.x,this.position.y,this.width,this.height);
    }

    update(){
        this.position.x += 5;
        this.draw();
    }
}

class Score{
    constructor(){
        this.score = 0;
        this.kills = 0;
    }

    draw(){
        context.fillText(`Score:${this.score} Kills:${this.kills}`,100,40);
        //context.fillRect(100,0,100,50);
        context.font = "40px sans-serif";
        context.fillStyle = "red";
        context.stroke();
    }
    update(){
        this.score+=5;
        this.kills+=1;
        this.draw();
    }
}


class PowerUp{
    constructor({x,y},image){
        this.position = {
            x,
            y
        };
        this.width = 40;
        this.height = 40;
        this.image = image;
    }
    draw(){
        context.drawImage(this.image,this.position.x,this.position.y,this.width,this.height);
    }

    update(){
        this.position.x -=5;
        this.draw();
    }

}

class Gun{
    constructor(){
        this.gun = [];
    }
}

class Health{
    constructor({x,y},image){
        this.position = {
            x,
            y
        };
        this.width = 40;
        this.height = 40;
        this.image = image;
        this.health = 10;
    }
    draw(){
        context.drawImage(this.image,this.position.x,this.position.y,this.width,this.height);
    }

    update(){
        this.position.x -=5;
        this.draw();
    }
}


class Background{
    constructor(image){
        this.position = {
            x:0,
            y:0
        };
        this.image = image;
    }
    draw(){
        //background image
        //first bg image
        context.drawImage(this.image,0,0,canvas.width,canvas.height);
        //second bg image
        context.drawImage(this.image,canvas.width,0,canvas.width,canvas.height);
    }

    update(){
        this.position.x+=5;
        this.draw();
    }
}

class Platform{
    constructor({x,y},image){
        this.position = {
            x,
            y
        };
        this.width = 400;
        this.height = 100;
        this.image = image;
    }
    draw(){
        context.drawImage(this.image,this.position.x,this.position.y,this.width,this.height);
    }

    update(){
        this.position.x -= 5;
        this.draw()
    }
}

const playerObject = new Player({x:0,y:0},playerImg);
const healthObject = new Health({x:canvas.width-40,y:Math.floor(Math.random(canvas.height)*canvas.height)-40},healthImage);
const scoreObject = new Score();
playerObject.draw();

let powerups = [
    "health",
    "gun",

];
let enemyObjects = [], 
    bulletObjects = [], 
    healthObjects = [], 
    powerUpObjects = [], 
    platformObjects = [];
let numberOfEnemies = 5;
let keyPressed = {
    shootKey:false,
    upKey:false,
    downKey:false,
    leftKey:false,
    rightKey:false
};

window.addEventListener("keypress",(e)=>{
    switch(e.key){
        case "Enter":
            if(keyPressed.shootKey == false){
                console.log("pressed")
                keyPressed.shootKey = true;
            }
            break;
    }
})

window.addEventListener("keydown",(e)=>{
    switch(e.key){
        /*case "Enter":
            if(keyPressed.shootKey == false){
                console.log("pressed")
                keyPressed.shootKey = true;
            }
            break;*/
        case "ArrowUp":
            keyPressed.upKey = true;
            break;
        case "ArrowDown":
            keyPressed.downKey = true;
            break;
        case "ArrowLeft":
            keyPressed.leftKey = true;
            break;
        case "ArrowRight":
            keyPressed.rightKey = true;
            break;
    }
    
})

window.addEventListener("keyup",(e)=>{
    switch(e.key){
        case "Enter":
            keyPressed.shootKey = false;
            break;
        case "ArrowUp":
            keyPressed.upKey = false;
            break;
        case "ArrowDown":
            keyPressed.downKey = false;
            break;
        case "ArrowLeft":
            keyPressed.leftKey = false;
            break;
        case "ArrowRight":
            keyPressed.rightKey = false;
            break;
    }
    window.removeEventListener("keydown",this)
})


const reset = ()=>{
    playerObject.position = {
        x:0,
        y:0
    };
    scoreObject.score = 0;
    scoreObject.kills = 0;
    playerObject.health = 10;
    enemyObjects = [];
    bulletObjects = [];
    platformObjects = [];
    return;
}


const play = ()=>{
    playerObject.update();
    scoreObject.draw();
    healthObject.update();

    if(keyPressed.upKey == true){
        playerObject.position.y -= 10;
    }
    if(keyPressed.downKey == true){
        if(playerObject.acceleration == 0){
            playerObject.position.y = canvas.height-135;
        }else{
            playerObject.position.y += 10;
        }
        
        
    }

    if(keyPressed.leftKey == true){
        playerObject.position.x -= 10;
    }
    if(keyPressed.rightKey == true){
        playerObject.position.x += 10;
    }

    

    if(platformObjects.length< 4){
        let gap = 10,multiplier=0;
        for(let j=0;j<7;j++){
            platformObjects.push(
                new Platform({x:(500*multiplier)+gap,y:canvas.height-100},platformImage)
            )
            multiplier++;
        }
    }

    //add platform objects
    platformObjects.length == 0?"":platformObjects.forEach((platformObject,platformObjectIndex)=>{
        platformObject.update();
        if(platformObject.position.x <= -500){
            platformObjects.splice(platformObjectIndex,1);
        }
        if(onTop(playerObject,platformObject)){
            playerObject.acceleration = 0;
        }
    })

    //Reset game when player health is zero
    if(playerObject.health < 1){
        reset();
    }

    if(collision(playerObject,healthObject)){
        playerObject.health++;
    }

    if(keyPressed.shootKey == true){
        bulletObjects.push(
            new Bullet({x:playerObject.position.x+playerObject.width,y:playerObject.position.y+(playerObject.height/2.5)},bulletImage)
        )
    }

    //add new enemies to game area
    if(enemyObjects.length <= 1){
        for(let enemy_i=0;enemy_i<numberOfEnemies;enemy_i++){
            enemyObjects.push(
                new Enemy({x:canvas.width+(Math.floor(Math.random(100)*100)),y:Math.floor(Math.random(canvas.height)*canvas.height)},enemyImage)
            );
        }
        //numberOfEnemies++;
    }

    enemyObjects.forEach((enemyObject,enemyObjectIndex)=>{
        enemyObject.update();
        //Detect collision between player and enemy
        if(collision(playerObject,enemyObject)){
            playerObject.health--;
            enemyObjects.splice(enemyObjectIndex,1);
        }

        if(enemyObject.position.x+enemyObject.width <= 0){
            //remove the enemy outside game area
            
            enemyObjects.splice(enemyObjectIndex,1);
        }
    });



    bulletObjects==""?"":bulletObjects.forEach((bulletObject,bulletIndex)=>{
        
        if(bulletObject.position.x+bulletObject.width >= canvas.width){
            //remove the bullet outside game area
            bulletObjects.splice(bulletIndex,1);
        }

        enemyObjects.forEach((enemyObject,enemyIndex)=>{
            //Detect collision between enemy and bullet
            if(collision(bulletObject,enemyObject)){
                hitSound.play();
                hitSound.volume = 0.25;
                scoreObject.update();
                bulletObjects.splice(bulletIndex,1);
                enemyObjects.splice(enemyIndex,1);
            }
        })
        bulletObject.update();
    });

    requestAnimationFrame(play);
}

play();