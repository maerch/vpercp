/*global d3, Perceptron */

var width = 300,
    height = 200;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-2000)
    .linkDistance(40)
    .size([width, height]);

var svg = d3.select("div#perceptron").append("svg")
    .attr("width", width)
    .attr("height", height);

var p = new Perceptron(2);
var nodes = p.graph().nodes;
var links = p.graph().links;

force
    .nodes(nodes)
    .links(links)
    .start();

var link = svg.selectAll(".link")
    .data(links)
  .enter().append("line")
    .attr("class", "link")
    .style("stroke-width", function(d) { return d.weight; });

var node = svg.selectAll(".node")
    .data(nodes)
  .enter().append("circle")
    .attr("class", "node")
    .attr("r", function(d) { return d.group === 2 ? 20 : 10; })
    .style("fill", function(d) { return color(d.group); })
    .call(force.drag);

node.append("title")
    .text(function(d) { return d.name; });

force.on("tick", function() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
});
