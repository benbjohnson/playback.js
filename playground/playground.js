$(function() {
var Player = require("playback/lib/player");
var player = new Player();
player.model(new Model());

var svg = d3.select("#chart").append("svg")
    .attr("width", 500)
    .attr("height", 500)
var g = svg.append("g");

player.frame(function(frame) {
    var model = this.model();
    model.nodes.push(new Node("joe"));
    model.nodes.push(new Node("susan"));

    this.timer(function() {
        model.nodes[0].x += 10;
    }, 100);
});

player.onupdate(function() {
    var model = player.current().model();
    svg.selectAll("circle").data(model.nodes)
        .call(function() {
            var enter = this.enter(), exit = this.exit();
            enter.append("circle")
                .attr("r", "25")
                .style("fill", "steelblue")
            ;
            this.transition().ease("linear")
                .attr("cx", function(d) { return d.x})
                .attr("cy", function(d) { return d.y})
            ;
        })
    ;
})

player.play();


});



function Model() {
    this.nodes = [];
}

function Node(name) {
    this.name = name;
    this.x = 50;
    this.y = 50;
}
