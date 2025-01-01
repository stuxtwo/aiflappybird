var c = document.createElement("canvas");

document.body.append(c);

var scale = 2;
c.width = scale * window.innerWidth;
c.height = scale * window.innerHeight;


var ctx = c.getContext("2d");

var birds = [];
var pipes = [];

var pipeTimer = 1500;

var frontPipe;

var deadBirds = [];

var best;

var gen = 1;

function bird(){
    birds.push(this);
    this.score = 0;
    this.color = "rgba(0, 0, 0, 0.2)";
    this.y = 0.5;
    this.x = 0;
    this.yVelocity = 0;
    this.brain = new net();
    this.gravity = 0.0003;
    this.dead = false;
    this.update = () => {
        if(!this.dead){
            this.score++;
        }
        this.yVelocity += this.gravity;
        this.y += this.yVelocity;
        if(this.brain.predict([this.y, this.yVelocity, frontPipe.height, frontPipe.x])){
            this.yVelocity = -0.008;
        }
        if(this.y > 1 || this.y < 0){
            if(!this.dead){
                deadBirds.push(this);
            }
            this.dead = true;
            return false;
        }
        for(p of pipes){
            if(this.x > p.x && this.x < p.x + 0.1 && Math.abs(this.y - p.height) > 0.1){
                if(!this.dead){
                    deadBirds.push(this);
                }
                this.dead = true;
                return false;
            }
        }

        return true;
    }
    this.draw = () => {
        if(!this.dead){
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc((c.width - c.height)/2, this.y * c.height, c.height * 0.025, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        }
    }
}

function pipe(){
    pipes.push(this);
    this.x = ((c.width - c.height) / 2)/c.height + 1;
    this.color = "black";
    this.height = Math.random() * 0.75 + 0.125;
    this.update = () => {
        this.x -= 0.01;
        if(this.x < -((c.width - c.height) / 2)/c.height - 0.1){
            pipes.shift();
            return false;
        }
        return true;
    }
    this.draw = () => {
        ctx.fillStyle = this.color;
        ctx.fillRect((this.x * c.height) + (c.width - c.height) / 2, 0, c.height * 0.1, c.height * (this.height - 0.1));
        ctx.fillRect((this.x * c.height) + (c.width - c.height) / 2, (this.height + 0.1) * c.height, c.height * 0.1, c.height);
    }
}

function drawBrain(brain){
    for(var i = brain.layers.length - 1; i >= 0; i--){
        var yStep = 1/(1+brain.layers[i].neurons.length);
        var lineStep;
        if(i != 0){
            lineStep = 1/(1 + brain.layers[i - 1].neurons.length)
        } else {
            lineStep = 1/5;
        }

        for(var j = 1; j * yStep < 1; j++){
            for(var k = 1; k * lineStep < 1; k++){
                ctx.beginPath();
                ctx.lineWidth = Math.abs(brain.layers[i].neurons[j - 1].weights[k - 1]) * c.height * 0.005;
                if(brain.layers[i].neurons[j - 1].weights[k - 1] > 0){
                    ctx.strokeStyle = "red";
                } else {
                    ctx.strokeStyle = "blue";
                }
                ctx.moveTo((c.width / 4) * (i/brain.layers.length) + (c.width * 3/4), (c.height / 3) * j * yStep);
                ctx.lineTo((c.width / 4) * ((i - 1)/brain.layers.length) + (c.width * 3/4), (c.height / 3) * k * lineStep);
                ctx.stroke();
                ctx.closePath();
            }
        }

        for(var j = 1; j * yStep < 1; j++){

            ctx.beginPath();
            ctx.arc((c.width / 4) * (i/brain.layers.length) + (c.width * 3/4), (c.height / 3) * j * yStep, c.height * 0.01, 0, Math.PI * 2);
            ctx.fillStyle = "black";
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.arc((c.width / 4) * (i/brain.layers.length) + (c.width * 3/4), (c.height / 3) * j * yStep, c.height * 0.01 * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            ctx.fill();
            ctx.closePath();

            var rad = Math.abs(brain.layers[i].neurons[j - 1].weights[brain.layers[i].neurons[j - 1].weights.length - 1]) / 2;
            if(brain.layers[i].neurons[j - 1].weights[brain.layers[i].neurons[j - 1].weights.length - 1] > 0){
                ctx.fillStyle = "red";
            } else {
                ctx.fillStyle = "blue";
            }

            ctx.beginPath();
            ctx.arc((c.width / 4) * (i/brain.layers.length) + (c.width * 3/4), (c.height / 3) * j * yStep, c.height * 0.01 * rad, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        }

        for(var k = 1; k * lineStep < 1; k++){
            ctx.beginPath();
            ctx.arc((c.width / 4) * ((i - 1)/brain.layers.length) + (c.width * 3/4), (c.height / 3) * k * lineStep, c.height * 0.01, 0, Math.PI * 2);
            ctx.fillStyle = "black";
            ctx.fill();
            ctx.closePath();
        }
    }
}

function update(){
    c.width = scale * window.innerWidth;
    c.height = scale * window.innerHeight;
    if(deadBirds.length == birds.length){
        gen++;
        birds.sort((a, b) => {return (b.score - a.score)});
        var parents = [];
        for(var i = 0; i < 10; i++){
            parents.push(birds[i]);
            birds[i].dead = false;
            birds[i].y = 0.5;
            birds[i].yVelocity = 0;
            birds[i].score = 0;
        }
        birds = [];
        deadBirds = [];
        pipes = [];
        for(var i = 0; i < 999; i++){
            var newBird = new bird();
            newBird.brain = breed(parents[Math.floor(Math.random() * parents.length)].brain, parents[Math.floor(Math.random() * parents.length)].brain);
        }
        birds.push(parents[0]);
        best = parents[0];
    }
    pipeTimer += 1000/60;
    if(pipeTimer > 1500){
        pipeTimer = 0;
        new pipe();
    }
    for(var i = 0; i < pipes.length; i++){
        if(pipes[i].x > -0.1){
            frontPipe = pipes[i];
            break;
        }
    }
    ctx.clearRect(0, 0, c.width, c.height);
    for(i of birds){
        i.update();
        i.draw();
    }
    for(var i = 0; i < pipes.length; i++){
        if(!pipes[i].update()){
            i--
        }
        else{
            pipes[i].draw();
        }
    }
    if(best != undefined){
        drawBrain(best.brain);
    } else {
        drawBrain(birds[0].brain);
    }
    ctx.textAlign = "left";
    ctx.fillStyle = "black";
    ctx.strokeStyle = "white";
    ctx.font = "bold " + Math.floor(c.height / 40) + "px arial"
    ctx.fillText("Generation: " + gen, c.width * 1/50, c.height / 10);
    ctx.fillText("Num alive: " + (birds.length - deadBirds.length), c.width * 1/50, c.height / 5);

}

for(var i = 0; i < 1000; i++)
    new bird();

setInterval(update, 1000/60);
