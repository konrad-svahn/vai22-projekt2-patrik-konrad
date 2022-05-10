const orgins = [];
const destinations = [];
const counts = [];

d3.csv("../flights.csv",  function(csvData){
    orgins.push(csvData.origin); 
    destinations.push(csvData.destination); 
    counts.push(csvData.count)    
}).then(function() {createChart()})


function createChart () {
    //console.log(orgins);
    //console.log(destinations);
    //console.log(counts);
    
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
            if (nodes[i].links[j].flights >= 2500) {
                data.links.push({
                    source: nodes[i].name,
                    target: nodes[i].links[j].name,
                    flights: nodes[i].links[j].flights
                });
            }
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
            .style('color', 'White')
            .style('background', 'Black')

    const width = 2000, height = 2000;
    const simulation = d3.forceSimulation(data.nodes)
        .force('charge', d3.forceManyBody().strength(-100))
        .force('link', d3.forceLink(data.links).id(d => d.name)
        .distance(50))
        .force('center', d3.forceCenter(width/2, 400))

    const svg = d3.select("#forcegraph")
        .append("svg")
        .attr("viewBox", [0, 0, width, height]);

    const link = svg
        .selectAll('path.link')
            .data(data.links).enter()
                .append('path')
                .attr('stroke', 'black')
                .attr('stroke-width', d => d.counts * 0.3)
                .attr('fill', 'none');


    const node = svg.selectAll('node')
        .data(data.nodes)
        .enter()
            .append("g")
            .on("mouseover", showTooltip)
                .style('stroke-width', '4')
                .style('cursor','pointer')
            .on("mouseout", () => {toolTip.style('display', 'none')})
                .style('stroke-width', '1')
            .call(d3.drag()
            .on("start", (event, d) => {
                if(!event.active) {
                    simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                }
            })
            .on("drag", (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
                //toolTip.style("display","none")
            })
            .on("end", (event, d) => {
                d.fx = null;
                d.fy = null;
                simulation.alphaTarget(0);
            }));
            
            
            node.on("mouseenter", (event, d) => {
                link
                    .style("display", "none")
                    .filter((l,i) => data.links[i].source.name === d.name  || data.links[i].target.name === d.name)
                    .style("display", "block");
              })
              .on("mouseleave", event => {
                link.style("display", "block");
              });
            

    node.append('circle')
        .attr('r', d => d.volume/2)
        .attr('fill', 'white')
        .attr('stroke', 'crimson');

    node.append("text")
        .style("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", d => d.volume/5 + 2)
        .text(d => d.name)


    const lineGenerator = d3.line();
    simulation.on('tick', () => {
        node.attr("transform", d => `translate(${d.x},${d.y})`)
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
        toolTip.html(d.name + " - " + d.trueSize + "")
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
        "volume": Math.ceil(vol/4 + 10),
        "trueSize": vol
    }
    nodes.push(node);
}
