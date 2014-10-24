/* global d3, Perceptron */
/* exported generateData, learn, rerenderPerceptronFunction  */

// Using an global array as the container
// for all added nodes for now.
var nodes = [];

// Iterates through all nodes linked to the
// d3 visualization and updates the color of the
// node regarding the correct classification
var updateNodeClass = function(d) {
  var classes = ['node'];
  if(d.wrong) {
    classes.push('wrong');
  } else {
    classes.push(d.answer > 0 ? "positive" : "negative"); 
  }
  return classes.join(' ');
};

// Counts the current errors caused by the perceptron
var countErrors = function() {
  var errors = 0;
  for(var k=0; k<nodes.length; k++) {
    if(nodes[k].wrong) {
      errors++;
    }
  }
  return errors;
};

// Updates the percetage of the error in percentage 
// with regard to the number of nodes
var updateErrorStatus = function(errors) {
  $('#error-percentage').val(Math.round(errors/nodes.length * 100));
};

// All nodes will be applied to the perceptron
// and the according d3 data set will be updated
// with information about the guess, answer and error.
// Also, an update and redrawing of d3 will be triggered.
var applyAndUpdate = function() {
  // apply and ...
  var errors = 0;
  for(var i=0; i<nodes.length; i++) {
    var node    = nodes[i];
    var x       = node.cx;
    var y       = node.cy;

    var answer  = realAnswer(x, y);
    var guess   = p.apply([x, y]);

    node.answer = answer;
    node.guess  = guess;
    node.wrong  = (guess!==answer);

    if(node.wrong) {
      errors++;
    }
  }
  // ... update color of existing ...
  nodeSVGroup.selectAll(".node")
      .data(nodes)
      .attr("class", updateNodeClass);
  // .. and append new nodes
  nodeSVGroup.selectAll(".node")
      .data(nodes).enter().append('circle')
      .attr("class", updateNodeClass)
      .attr("cx", function(d) { return d.cx; })
      .attr("cy", function(d) { return d.cy; })
      .attr("r",  function() { return 0.01; })
      .transition().ease("elastic").delay(10).duration(1000)
      .attr("r",     function(d) { return d.r; });

  updateErrorStatus(errors);
};

var learnAll = function() {
  for(var i=0; i<nodes.length; i++) {
    var x      = nodes[i].cx;
    var y      = nodes[i].cy;
    var answer = realAnswer(x, y);

    p.train([x, y], answer);
  }
  rerenderPerceptronFunction();
  applyAndUpdate();
  incrementAndUpdateIterations();
};

var learnStepByStep = function(callback) {
  var i = 0;
  var timePerNode = 1000;
  var stepTimer = setInterval(function(){
    svg.selectAll('.node')
      .data(nodes).transition()
      .attr('r', function(d, j) {
        return i===j ? d.r * 3 : d.r;
      }).transition().delay(timePerNode)
      .attr('r', function(d) { return d.r; });

    // Training
    var node   = nodes[i];
    var x      = node.cx;
    var y      = node.cy;
    var answer = realAnswer(x, y);
    p.train([x, y], answer);

    // Testing
    var guess   = p.apply([x, y]);
    node.answer = answer;
    node.guess  = guess;
    node.wrong  = (guess!==answer);

    // Updating
    rerenderPerceptronFunction();
    updateErrorStatus(countErrors());
    nodeSVGroup.selectAll(".node")
        .data(nodes)
        .attr("class", updateNodeClass);
    if(++i === nodes.length) {
      clearInterval(stepTimer);
      incrementAndUpdateIterations();
      if(typeof callback === "function") {
        callback.call();
      }
    }

  },timePerNode);
};

// Read the options and call the learn function accordingly
var learn = function() {
  var flawlessOption   = $("#learnUntilFlawless").is(':checked');
  var stepByStepOption = $("#learnStepByStep").is(':checked');

  if(stepByStepOption) {
    return flawlessOption ? flawlessStepByStep() : learnStepByStep();
  } else {
    return flawlessOption ? flawlessAll()       : learnAll();
  }
};

// Learn all the data at once until we have no more errors
var flawlessAll = function() {
  var timer = setInterval(function(){
    learnAll();
    if(countErrors() === 0) {
      clearInterval(timer);
    }
  }, 1000);
};

// Learn all the data stey by step until we have no more errors
var flawlessStepByStep = function() {
  if(countErrors() === 0) {
    return;
  } else {
    learnStepByStep(flawlessStepByStep);
  }
};

var iterations = 0;
var incrementAndUpdateIterations = function() {
  iterations++;
  $('div#iterations span#counter').html(iterations);
};

var updatePercpFunction = function() {
  $("#percp-m").val(p.m().toFixed(3));
  $("#percp-b").val(p.b().toFixed(3));
};

// Updates the learned function in the
// d3.js visualization and displays it.
var rerenderPerceptronFunction = function() {
  linesSVGroup.selectAll("#pline")
    .data([{"x1":-1, "y1": p.f(-1), "x2":4, "y2": p.f(4)}])
    .transition().duration(1000).ease('elastic')
    .attr("x1", function(d) { return d.x1; })
    .attr("y1", function(d) { return d.y1; })
    .attr("x2", function(d) { return d.x2; })
    .attr("y2", function(d) { return d.y2; });
  updatePercpFunction();
};

// Updates the function which we wanna learn in the
// d3.js visualization and displays it.
var rerenderRealFunction = function() {
  linesSVGroup.selectAll("#rline")
    .data([{"x1":-1, "y1": real.f(-1), "x2":4, "y2": real.f(4)}])
    .transition()
    .attr("x1", function(d) { return d.x1; })
    .attr("y1", function(d) { return d.y1; })
    .attr("x2", function(d) { return d.x2; })
    .attr("y2", function(d) { return d.y2; });
};

// Adding a node without any updating of the d3 visualization.
var addNode = function(x, y) {
  nodes.push({"cx":x, "cy":y, "r": 0.08, "group": 6});
};

// Generates 100 random data points, applies and renderes them
var generateData = function() {
  for(var i=0; i<100; i++) {
    var x = Math.random() * 3;
    var y = Math.random() * 3;
    addNode(x, y);
  }
  applyAndUpdate();
};

// Adds a node and directly applies as well as updates d3.
var addAndApplyNode = function(x, y) {
  addNode(x, y);
  applyAndUpdate();
};

// d3.js initialization stuff
var width = 300,
    height = 300;

// The "real" function we want to learn
var real = {
  m : 1,
  b : 0,
  f : function(x) { return this.m * x + this.b; }
};

$("#real-m").val(real.m);
$("#real-b").val(real.b);

// Manipulation of the real function by the user
$("#real-m").change(function() { 
  real.m = parseFloat($(this).val());
  rerenderRealFunction();
});
$("#real-b").change(function() {
  real.b = parseFloat($(this).val());
  rerenderRealFunction();
});

// Computes the answer which the perceptron should give.
var realAnswer = function(x, y) {
  return y > real.f(x) ? 1 : -1;
};

// The perceptron which shall learn the function f
// Input size is two since we want to visualize the data.
var p = new Perceptron(2);

updatePercpFunction();

var svg = d3.select("div#data .canvas").append("svg")
              .attr("width", width)
              .attr("height", height);

var nodeSVGroup  = svg.append('g').attr("id", "nodes-svg-group");
var linesSVGroup = svg.append('g').attr("id", "lines-svg-group");

svg.on('click', function() {
  // Scaling the returned coordiantes according
  // to the scaling of the line/circles
  // (see css file)
  var x = d3.mouse(this)[0]/100;
  var y = d3.mouse(this)[1]/100 * -1 + 3;
  addAndApplyNode(x, y);
}); 



// Adding the "real" function as a line
linesSVGroup.append("svg:line")
    .attr("x1", -1)
    .attr("y1", real.f(-1))
    .attr("x2", 4)
    .attr("y2", real.f(4))
    .attr("id", "rline")
    .attr("class", "line");

// Adding the learned function as a line
linesSVGroup.selectAll("#pline")
    .data([{"x1":-1, "y1": p.f(-1), "x2":4, "y2": p.f(4)}])
  .enter().append('line').transition().duration(500)
    .attr("x1", function(d) { return d.x1; })
    .attr("y1", function(d) { return d.y1; })
    .attr("x2", function(d) { return d.x2; })
    .attr("y2", function(d) { return d.y2; })
    .attr("id", "pline")
    .attr("class", "line");

