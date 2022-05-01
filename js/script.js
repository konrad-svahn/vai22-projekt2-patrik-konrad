const orgins = [];
const destinations = [];
const counts = [];

d3.csv("../flights.csv",  function(csvData){
    orgins.push(csvData.origin); 
    destinations.push(csvData.destination); 
    counts.push(csvData.count)    
}).then(function() {createChart()})


function createChart () {

    console.log(orgins);
    console.log(destinations);
    console.log(counts);
    
    const data = {};
    const nodes = [];
    for (i in orgins) {
        if (nodes.length == 0) {
            makeNode(orgins[i], nodes);
        } else {
            var adOrginTooNodes = true;
            var adDestinationTooNodes = true;
            for (j in nodes) {
                if (orgins[i] == nodes[j].name) {adOrginTooNodes = false;}
                if (destinations[i] == nodes[j].name) {adDestinationTooNodes = false;}
            }
        }
        if (adOrginTooNodes == true) {
                makeNode(orgins[i], nodes);
        }
        if (adDestinationTooNodes == true) {
            makeNode(destinations[i], nodes);
        }
    }

    data.links = [];
    for (i in nodes) {
        for (j in nodes[i].links) {
            data.links.push({
                source: nodes[i].name,
                target: nodes[i].links[j].name
            });
        }
    }
    data.nodes = nodes;
    console.log(data.nodes);
    console.log(data.links);
    
    const toolTip = d3.select("#forcegraph")
        .append('div')
            .attr('id', 'tooltip')
            .style('position', 'absolute')
            .style('display', 'none')

    const width = 600, height = 600;
    const simulation = d3.forceSimulation(data.nodes)
        .force('charge', d3.forceManyBody().strength(-100))
        .force('link', d3.forceLink(data.links).id(d => d.name)
        .distance(50))
        .force('center', d3.forceCenter(width/2, height/2))

    const svg = d3.select("#forcegraph")
        .append("svg")
        .attr("viewBox", [0, 0, width, height]);

    const link = svg
        .selectAll('path.link')
            .data(data.links).enter()
                .append('path')
                .attr('stroke', 'black')
                .attr('fill', 'none');


    const node = svg.selectAll('circle')
        .data(data.nodes)
        .enter()
            .append('circle')
            .attr('r', d => d.volume/2)
            .attr('fill', 'white')
            .attr('stroke', 'crimson')
        .on("mouseover", showTooltip)
        .on("mouseout", () => {toolTip.style('display', 'none')})

    const lineGenerator = d3.line();

    simulation.on('tick', () => {
        node.attr('cx', d => d.x);
        node.attr('cy', d => d.y);
        link.attr('d', d => lineGenerator([
            [d.source.x, d.source.y], 
            [d.target.x, d.target.y]]) 
        )
    });
   
    function showTooltip (event, d) {     
        const realWidth = svg.style('width').replace("px", "");
        const coefficient = realWidth / width;
        toolTip.style('display', 'block')
            .style('left', d.x * coefficient + 30 + "px")
            .style('top', d.y * coefficient + "px")
        toolTip.html(d.name)
    } //*/
}

function makeNode (name, nodes) {
    links = [];
    for (i in orgins) {
        if (orgins[i] == name) {
            links.push({
                "name": destinations[i],
                "flights": counts[i]
            });
        } else if (destinations[i] == name) {
            links.push({
                "name": orgins[i],
                "flights": counts[i]
            });
        }
    }
    let vol = 0;
    for (i in links) {
        vol += 1;
    }
    const node = {  
        "name": name,
        "links": links,
        "volume": vol
    }
    nodes.push(node);
}
