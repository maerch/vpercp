function Perceptron(n) {
  this.n         = n;
  this.weights   = [];
  this.threshold = 0;

  this.weights[0] = -0.5;
  this.weights[1] = 0.5;
  this.threshold  = 0.6;
}

Perceptron.prototype.LEARNING_RATE = 0.01;

Perceptron.prototype.activate = function(sum) {
  return sum > this.threshold ? 1 : -1;
};

Perceptron.prototype.apply = function(input) {
  var sum = 0;
  for(var i=0; i<this.weights.length; i++) {
    sum += this.weights[i] * input[i];
  }
  return this.activate(sum);
};

Perceptron.prototype.train = function(input, output) {
  var guess = this.apply(input);
  var error = output - guess;
  for(var i=0; i<this.weights.length; i++) {
    this.weights[i] += this.LEARNING_RATE * error * input[i];
  }
  // Using the threshold as a special weights to learn it.
  this.threshold += this.LEARNING_RATE * -error;
};

// Helper function which helps to draw the 
// decision boundary as a straight line.
Perceptron.prototype.f = function(x) {
  return this.m() * x + this.b();
};

Perceptron.prototype.m = function() {
  return -this.weights[0]/this.weights[1];
};

Perceptron.prototype.b = function() {
  return this.threshold/this.weights[1];
};

Perceptron.prototype.clone = function() {
  var clone       = new Perceptron(this.n);
  clone.weights   = this.weights.slice();
  clone.threshold = this.threshold;

  return clone;
};

// Prints the current internal function learned by this
// perceptron.
Perceptron.prototype.printf = function() {
  var m = (-this.weights[0]/this.weights[1]);
  var b = (this.threshold/this.weights[1]);
  console.log("(" + m +") * x + (" + b + ")");
};

Perceptron.prototype.printw = function() {
  console.log("w=" + this.weights + ", threshold=" + this.threshold);
};

// Returns a graph which can be used to easily draw a perceptron 
// in d3.js. TODO: Should probably not be part of this file.
Perceptron.prototype.graph = function() {
  return {"nodes":[
    {"index":0, "name":"cx","group":1, "label":"x" + String.fromCharCode(8320)},
    {"index":1, "name":"cy","group":1, "label":"x" + String.fromCharCode(8321)},
    {"index":2, "name":"p","group":2, "label":String.fromCharCode(931)},
    {"index":4, "name":"f(x)","group":3, "label":"y"}
  ],
  "links":[
    {"source":0,"target":2,"weight":this.weights[0] + 3},
    {"source":1,"target":2,"weight":this.weights[1] + 3},
    {"source":2,"target":3,"weight":this.threshold  + 3}
  ]};
};

Perceptron.prototype.nodes = function() {
  return this.graph().nodes;
};

Perceptron.prototype.links = function() {
  return this.graph().links;
};
