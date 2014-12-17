/* global d3, Perceptron, $ */
/* exported d3percp */

var DataCanvas = (function(d3, Perceptron, $) {
  var dataCanvas = function(width, height, nnet) {
    this.svg = d3.select("div#data .canvas").append("svg")
                  .attr("width", width)
                  .attr("height", height);

    this.nodeSVGroup  = svg.append('g').attr("id", "nodes-svg-group");
    this.linesSVGroup = svg.append('g').attr("id", "lines-svg-group");
  }

  return dataCanvas;
} (d3, Perceptron, $));
