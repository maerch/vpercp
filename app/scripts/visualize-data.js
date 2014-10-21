/* global d3, Perceptron */
/* exported generateDataToLearn, learnNode, rerenderPerceptronFunction  */

// Using an global array as the container
// for all added nodes for now.
var nodes = [];

var generateData = function() {
  for(var i=0; i<100; i++) {
    var x = Math.random() * 3;
    var y = Math.random() * 3;
    addNode(x, y);
  }
};

var testData = function() {
  var errors = 0;
  for(var i=0; i<nodes.length; i++) {
    var x      = nodes[i].cx;
    var y      = nodes[i].cy;
    var answer = nodes[i].answer;

    if(p.apply([x, y])!==answer) {
      errors++;
      nodes[i].wrong = true;
    }
  }
  svg.selectAll(".node")
      .data(nodes)
      .attr("class", function(d) { 
        if(d.wrong) {
          return "node wrong";
        } else {
          return d.answer > 0 ? "node positive" : "node negative"; 
        }});
  console.log("Total errors on " + nodes.length + " examples is  " + errors);
};

var learnData = function() {
  for(var i=0; i<nodes.length; i++) {
    var x      = nodes[i].cx;
    var y      = nodes[i].cy;
    var answer = nodes[i].answer;

    p.train([x, y], answer);
    p.printf();
    p.printw();
  }
  rerenderPerceptronFunction();
  testData();
};

// Adding a node to the global nodes object and learns
// the perceptron with the desired outcome and updates
// the d3.js visualization.
var learnNode = function(x, y) {
  var answer = realAnswer(x, y);
  p.train([x, y], answer);
};

var updatePercpFunction = function() {
  $("#percp-m").val(p.m().toFixed(3));
  $("#percp-b").val(p.b().toFixed(3));
};

// Updates the learned function in the
// d3.js visualization and displays it.
var rerenderPerceptronFunction = function() {
  svg.selectAll("#pline")
    .data([{"x1":-1, "y1": p.f(-1), "x2":4, "y2": p.f(4)}])
    .attr("x1", function(d) { return d.x1; })
    .attr("y1", function(d) { return d.y1; })
    .attr("x2", function(d) { return d.x2; })
    .attr("y2", function(d) { return d.y2; });
  updatePercpFunction();
};

// Updates the function which we wanna learn in the
// d3.js visualization and displays it.
var rerenderRealFunction = function() {
  svg.selectAll("#rline")
    .data([{"x1":-1, "y1": real.f(-1), "x2":4, "y2": real.f(4)}])
    .transition()
    .attr("x1", function(d) { return d.x1; })
    .attr("y1", function(d) { return d.y1; })
    .attr("x2", function(d) { return d.x2; })
    .attr("y2", function(d) { return d.y2; });
};

// Adds a node and displays it
var addNode = function(x, y) {
  var guess  = p.apply([x, y]);
  var answer = realAnswer(x, y);
  nodes.push({"cx":x, "cy":y, "r": 0.08, "group": 6, "answer": answer, "guess": guess });

  // Updating the data in the d3.js visualization
  svg.selectAll(".node")
      .data(nodes)
    .enter().append("circle")
      .attr("cx", function(d) { return d.cx; })
      .attr("cy", function(d) { return d.cy; })
      .attr("r",  function() { return 0.01; })
      .attr("class", function(d) { return d.answer > 0 ? "node positive" : "node negative"; })
      .transition().ease("elastic").delay(10).duration(1000)
      .attr("r",     function(d) { return d.r; });
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

svg.on('click', function() {
  // Scaling the returned coordiantes according
  // to the scaling of the line/circles
  // (see css file)
  var x = d3.mouse(this)[0]/100;
  var y = d3.mouse(this)[1]/100 * -1 + 3;
  addNode(x, y);
}); 


// Adding the "real" function as a line
svg.append("svg:line")
    .attr("x1", -1)
    .attr("y1", real.f(-1))
    .attr("x2", 4)
    .attr("y2", real.f(4))
    .attr("id", "rline")
    .attr("class", "line")
    .style("stroke", "rgba(6,120,155, 0.5)");

// Adding the learned function as a line
svg.selectAll("#pline")
    .data([{"x1":-1, "y1": p.f(-1), "x2":4, "y2": p.f(4)}])
  .enter().append('line').transition().duration(500)
    .attr("x1", function(d) { return d.x1; })
    .attr("y1", function(d) { return d.y1; })
    .attr("x2", function(d) { return d.x2; })
    .attr("y2", function(d) { return d.y2; })
    .attr("id", "pline")
    .attr("class", "line")
    .style("stroke", "rgba(60,10,195, 0.8)");
