// d3.js initialization stuff
var width = 300,
    height = 300;

// The "real" function we want to learn
var real = {
  m : 1,
  b : 0,
  f : function(x) { return this.m * x + this.b; }
};

$("#real-m").val(real.m)
$("#real-b").val(real.b)

// Manipulation of the real function by the user
$("#real-m").change(function() { 
  real.m = parseFloat($(this).val()) ;
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

var color = d3.scale.category20();
var force = d3.layout.force()
                        .charge(-120)
                        .linkDistance(120)
                        .size([width, height]);

var svg = d3.select("div#data .canvas").append("svg")
              .attr("width", width)
              .attr("height", height);

svg.on('click', function(event) {
  // Scaling the returned coordiantes according
  // to the scaling of the line/circles
  // (see css file)
  var x = d3.mouse(this)[0]/100;
  var y = d3.mouse(this)[1]/100 * -1 + 3;
  addNode(x, y);
}); 

// Using an global array as the container
// for all added nodes for now.
var nodes = []

// Adds a node and displays it
var addNode = function(x, y) {
  var guess  = p.apply([x, y])
  var answer = realAnswer(x, y);
  nodes.push({"cx":x, "cy":y, "r": 0.08, "group": 6, "answer": answer, "guess": guess })

  // Updating the data in the d3.js visualization
  svg.selectAll(".node")
      .data(nodes)
    .enter().append("circle")
      .attr("cx", function(d) { return d.cx; })
      .attr("cy", function(d) { return d.cy; })
      .attr("r",  function(d) { return 0.01; })
      .attr("class", function(d) { return d.answer > 0 ? "node positive" : "node negative"; })
      .transition().ease("elastic").delay(10).duration(1000)
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
    .data([{"x1":-1, "y1": p.f(-1), "x2":4, "y2": p.f(4)}])
    .attr("x1", function(d) { return d.x1; })
    .attr("y1", function(d) { return d.y1; })
    .attr("x2", function(d) { return d.x2; })
    .attr("y2", function(d) { return d.y2; });
};
var rerenderRealFunction = function() {
  svg.selectAll("#rline")
    .data([{"x1":-1, "y1": real.f(-1), "x2":4, "y2": real.f(4)}])
    .transition()
    .attr("x1", function(d) { return d.x1; })
    .attr("y1", function(d) { return d.y1; })
    .attr("x2", function(d) { return d.x2; })
    .attr("y2", function(d) { return d.y2; });
};

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
