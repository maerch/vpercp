/*global d3, Perceptron */

(function(d3, Perceptron) {
  var width = 300,
      height = 200;

  var color = d3.scale.category20();

  var force = d3.layout.force()
      .charge(-200)
      .linkDistance(80)
      .size([width, height]);

  var svg = d3.select("div#perceptron").append("svg")
      .attr("width", width)
      .attr("height", height);

  var p = new Perceptron(2);
  var nodes = p.graph().nodes;
  var links = p.graph().links;

  var mouse = {fixed: true, r: 0};
  nodes.push(mouse);

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
    .enter().append("g")
      .call(force.drag);
   
  node.append("circle")
      .attr("class", "node")
      .attr("r", function(d) { if(d.r===0) {return 0;} else {return d.group === 2 ? 25 : 15;}})
      .style("fill", function(d) { return color(d.group); });

  node.append("text")
      .attr("x", -5)
      .attr("y", 5)
      .text(function(d) { return d.label; });

  svg.on("mousemove", function() {
    var p1 = d3.mouse(this);
    mouse.px = p1[0];
    mouse.py = p1[1];
    force.resume();
  });

  node.append("title")
      .text(function(d) { return d.name; });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });
}(d3, Perceptron));
