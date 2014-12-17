var Neuralnet = function(i, h, o) {

  this.i    = i;
  this.h    = h;
  this.o    = o;

  // Initialize weights from input to hidden layer
  this.w_ih = [];
  for(var ii=0; ii<i; ii++) {
    this.w_ih[ii] = [];
    for(var hh=0; hh<h; hh++) {
      this.w_ih[ii][hh] = Math.random()*2-1;
    }
  }

  // Initialize weights from hidden to output layer
  this.w_ho = [];
  for(var hh=0; hh<h; hh++) {
    this.w_ho[hh] = [];
    for(var oo=0; oo<o; oo++) {
      this.w_ho[hh][oo] = Math.random()*2-1;
    }
  }

};

Neuralnet.prototype = {
  sigma: function(x) {
    return 1/(1 + Math.exp(-x));
  },

  apply: function(input) {
    if(input.length !== this.i)
      throw "Input size not correct -- neural net is configured for length " +
             this.i + " and not " + input.length;

    // hidden layer
    // initialize array with h 0's
    var hidden = Array.apply(null, Array(this.h)).map(function() { return 0 });
    for(var i=0; i<input.length; i++) {
      for(var h=0; h<this.h; h++) {
        hidden[h] += this.w_ih[i][h] * input[i];
      }
    }
    hidden = hidden.map(function(h) { return this.sigma(h); }.bind(this));

    // output layer
    // initialize array with o 0's
    var output = Array.apply(null, Array(this.o)).map(function() { return 0 });
    for(var h=0; h<this.h; h++) {
      for(var o=0; o<this.o; o++) {
        output[o] += this.w_ho[h][o] * hidden[h];
      }
    }
    return output.map(function(o) { return this.sigma(o); }.bind(this));
  }
};

module.exports = Neuralnet;
