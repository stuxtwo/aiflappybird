var mutationRate = 0.01;

function net(){
    this.layers = [];
    this.init = () => {
        this.layers.push(new layer(3));
        this.layers.push(new layer(3));
        this.layers.push(new layer(1));
    }
    this.predict = (input) => {
        var nextIn = [];
        for(j of this.layers[0].neurons){
            nextIn.push(j.predict(input));
        }

        for(var j = 1; j < this.layers.length; j++){
            currentIn = [];
            for(k of this.layers[j].neurons){
                var pred = k.predict(nextIn);
                currentIn.push(pred);
            }
            nextIn = currentIn;
        }

        return nextIn[0];
    }

    this.init();
}

function neuron(){
    this.weights = [];
    this.predict = (input) => {
        while(this.weights.length <= input.length){
            this.weights.push((Math.random() * 2) - 1);
        }
        var sum = 0;
        for(var i = 0; i < input.length; i++){
            sum += this.weights[i] * input[i];
        }
        sum += this.weights[this.weights.length - 1];
        return 1 * (sum > 0);
    }
}

function layer(neurons){
    this.neurons = [];
    for(var i = 0; i < neurons; i++){
        this.neurons.push(new neuron());
    }
}

function breed(p1, p2){
    var child = new net();

    for(var i = 0; i < p1.layers.length; i++){
        for(var j = 0; j < p1.layers[i].neurons.length; j++){
            for(var k = 0; k < p1.layers[i].neurons[j].weights.length; k++){
                child.layers[i].neurons[j].weights[k] = (Math.random() > 0.5)?p1.layers[i].neurons[j].weights[k]:p2.layers[i].neurons[j].weights[k];
                if(Math.random() < mutationRate){
                    child.layers[i].neurons[j].weights[k] = 2 * Math.random() - 1;
                }
            }
        }
    }

    return child;
}
