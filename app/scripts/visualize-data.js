// The "real" function we want to learn
var real = {
  m : 1,
  b : 0,
  f : function(x) { return this.m * x + this.b; }
};


$("#real-m").val(real.m)
$("#real-b").val(real.b)

$("#real-m").change(function() { 
  real.m = parseFloat($(this).val());
  rerenderRealFunction();
})
$("#real-b").change(function() {
  real.b = parseFloat($(this).val());
  rerenderRealFunction();
});

// Computes the answer which the perceptron should give.
var realAnswer = function(x, y) {
  return y < real.f(x) ? 1 : -1;
}

// The perceptron which shall learn the function f
// Input size is two since we want to visualize the data.
var p = new Perceptron(2);

// d3.js initialization stuff
var width = 300,
    height = 300;

var color = d3.scale.category20();

var force = d3.layout.force()
                        .charge(-120)
                        .linkDistance(120)
                        .size([width, height]);

var svg = d3.select("div#data .canvas").append("svg")
              .attr("width", width)
              .attr("height", height);

svg.on('mousemove', function(){
    console.log(d3.mouse(this));
});

svg.on('click', function(event) {
  var x = d3.mouse(this)[0];
  var y = d3.mouse(this)[1];
  addNode(x, y);
  //learnNode(x, y);
  //updatePerceptronFunction();
  p.printw();
  p.printf();
}); 

// Using an global array as the container
// for all added nodes for now.
var nodes = []

// Randomly create a node and add it
var addAndLearnRandomNode = function() {
  // Use random x and y value which fit into the canvas.
  var x = Math.random() * width;
  var y = Math.random() * height;
  addNode(x, y);
  learnNode(x, y);
};

var addNode = function(x, y) {
  var guess  = p.apply([x, y])
  var answer = realAnswer(x, y);
  nodes.push({"cx":x, "cy":y, "r": 8, "group": 6, "answer": answer, "guess": guess })

  // Updating the data in the d3.js visualization
  svg.selectAll(".node")
      .data(nodes)
    .enter().append("circle")
      .attr("cx", function(d) { return d.cx; })
      .attr("cy", function(d) { return d.cy; })
      .attr("r",  function(d) { return 1; })
      .attr("class", "node")
      .transition().ease("elastic").delay(10).duration(1000)
      .style("fill", function(d) { return color(d.guess); })
      .attr("r",     function(d) { return d.r; });
};
// Adding a node to the global nodes object and learns
// the perceptron with the desired outcome and updates
// the d3.js visualization.
var learnNode = function(x, y) {
  var answer = realAnswer(x, y);
  p.train([x, y], answer);
};


// Updates the learned function data in the
// d3.js visualization and displays it.
var updatePerceptronFunction = function() {
  svg.selectAll("#pline")
    .data([{"x1":-100, "y1": p.f(-100), "x2":400, "y2": p.f(400)}])
    .attr("x1", function(d) { return d.x1; })
    .attr("y1", function(d) { return d.y1; })
    .attr("x2", function(d) { return d.x2; })
    .attr("y2", function(d) { return d.y2; });
};
var rerenderRealFunction = function() {
  svg.selectAll("#rline")
    .data([{"x1":-100, "y1": real.f(-100), "x2":400, "y2": real.f(400)}])
    .transition()
    .attr("x1", function(d) { return d.x1; })
    .attr("y1", function(d) { return d.y1; })
    .attr("x2", function(d) { return d.x2; })
    .attr("y2", function(d) { return d.y2; });
};

// Initialize with 10 nodes
for(var i=0; i<10; i++) {
  //addAndLearnRandomNode();
}

// Adding the "real" function as a line
svg.append("svg:line")
    .attr("x1", -100)
    .attr("y1", real.f(-100))
    .attr("x2", 400)
    .attr("y2", real.f(400))
    .attr("id", "rline")
    .style("stroke-width", "10px")
    .style("stroke", "rgba(6,120,155, 0.5)");

// Adding the learned function as a line
svg.selectAll("#pline")
    .data([{"x1":-100, "y1": p.f(-100), "x2":400, "y2": p.f(400)}])
  .enter().append('line').transition().duration(500)
    .attr("x1", function(d) { return d.x1*10; })
    .attr("y1", function(d) { return d.y1*10; })
    .attr("x2", function(d) { return d.x2*10; })
    .attr("y2", function(d) { return d.y2*10; })
    .attr("id", "pline")
    .style("stroke-width", "10px")
    .style("stroke", "rgba(60,10,195, 0.8)");

// Adding new nodes periodically until
// we have reached a limit.
setInterval(function() {
  return;
  if(nodes.length > 20) {return;}
  addAndLearnRandomNode();
  updatePerceptronFunction();
  p.printf();
  p.printw();

}, 500);

var debugPoint = function(x, y) {
  console.log("Next point [" + x + ", " + y + "]")
  console.log('================')
  console.log('before')
  p.printf();
  p.printw();
  checkPercp(x, y);

  var real   = realAnswer(x, y);
  p.train([x, y], real);
  console.log("after");
  updatePerceptronFunction();
  p.printf();
  p.printw();
  checkPercp(x, y)
}
var checkPercp = function(x, y) {
  var real   = realAnswer(x, y);
  var guess  = p.apply([x, y]);
  console.log("real: " + real + " guess: " + guess + " error: " + (real - guess));
};

debugPoint(1, 0.5)
