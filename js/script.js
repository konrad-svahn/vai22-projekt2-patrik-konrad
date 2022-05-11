const orgins = [];
const destinations = [];
const counts = [];
const sizelimit = 2500;
const lables = makeNameList();

d3.csv("./flights.csv",  function(csvData){
    orgins.push(csvData.origin); 
    destinations.push(csvData.destination); 
    counts.push(csvData.count)    
}).then(function() {createChart()})


function createChart () {
    //console.log(orgins);
    //console.log(destinations);
    //console.log("counts" + counts);
    
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
            if (nodes[i].links[j].flights >= sizelimit) {
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

    const width = 1800, height = 900;
    const simulation = d3.forceSimulation(data.nodes)
        .force('charge', d3.forceManyBody().strength(-50))
        .force('link', d3.forceLink(data.links).id(d => d.name)
        .distance(300))
        .force('center', d3.forceCenter(width/2, height/2))

    const svg = d3.select("#forcegraph")
        .append("svg")
        .attr("viewBox", [0, 0, width, height]);

    const link = svg
        .selectAll('path.link')
            .data(data.links).enter()
                .append('path')
                .attr('stroke', 'black')
                //.attr('stroke-width', d => d.counts * 0.3)
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
            .filter((l,i) => data.links[i].source.name === d.name || data.links[i].target.name === d.name)
            .style("display", "block")
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
        toolTip.html(asignLable(d.name) + ", flights per year: " + d.trueSize)
    } //*/
}

function makeNode (name, nodes) {
    links = [];
    let add = false;
    let vol = 0;
    for (i in orgins) {
        if (orgins[i] == name) {
            vol += parseInt(counts[i]);
            if(counts[i] >= sizelimit) {
                add = true
                links.push({
                    "name": destinations[i],
                    "flights": counts[i]
                });
            }
        } else if (destinations[i] == name) {
            vol += parseInt(counts[i]);
            if(counts[i] >= sizelimit) {
                add = true
                links.push({
                    "name": orgins[i],
                    "flights": counts[i]
                });
            }
        }
    }
    const node = {  
        "name": name,
        "links": links,
        "volume": Math.ceil(vol/7000 + 10),
        "trueSize": vol,
    }
    for (i in nodes) {
        if (nodes[i].name == name) {add = false}
    } 
    if (add == true) {nodes.push(node);}
}

function asignLable(name) {
    let lable = name;
    for (i in lables) {
        if (lables[i].id == name) {
            lable = lables[i].lable;
        }
    }
    return lable;
}

function makeNameList() {
    const finalList = [];
    const nameList = [
        "Alabama                                                   AL",
        "Birmingham International Airport                        BHM ",
        "Dothan Regional Airport                                 DHN ",
        "Huntsville International Airport 	                      HSV",
        "Mobile 	                                              MOB",
        "Montgomery                                               MGM",
        "Alaska 	                                               AK",
        "Anchorage International Airport 	                      ANC",
        "Fairbanks International Airport 	                      FAI",
        "Juneau International Airport 	                          JNU",
        "Arizona 	                                               AZ",
        "Flagstaff 	                                              FLG",
        "Phoenix, Phoenix Sky Harbor International Airport 	      PHX",
        "Tucson International Airport 	                          TUS",
        "Yuma International Airport 	                          YUM",
        "Arkansas 	                                               AR",
        "Fayetteville 	                                          FYV",
        "Little Rock National Airport 	                          LIT",
        "Northwest Arkansas Regional Airport 	                  XNA",
        "California 	                                           CA",
        "Burbank                                                  BUR",
        "Fresno 	                                              FAT",
        "Long Beach 	                                          LGB",
        "Los Angeles International Airport 	                      LAX",
        "Oakland 	                                              OAK",
        "Ontario 	                                              ONT",
        "Palm Springs 	                                          PSP",
        "Sacramento 	                                          SMF",
        "San Diego 	                                              SAN",
        "San Francisco International Airport 	                  SFO",
        "San Jose 	                                              SJC",
        "Santa Ana 	                                              SNA",
        "Colorado 	                                               CO",
        "Aspen 	                                                  ASE",
        "Colorado Springs 	                                      COS",
        "Denver International Airport 	                          DEN",
        "Grand Junction 	                                      GJT",
        "Pueblo 	                                              PUB",
        "Connecticut 	                                           CT",
        "Hartford 	                                              BDL",
        "Tweed New Haven 	                                      HVN",
        "District of Columbia 	                                   DC",
        "Washington, Dulles International Airport 	              IAD",
        "Washington National Airport 	                          DCA",
        "Florida 	                                               FL",
        "Daytona Beach 	                                          DAB",
        "Fort Lauderdale-Hollywood International Airport 	      FLL",
        "Fort Meyers 	                                          RSW",
        "Jacksonville 	                                          JAX",
        "Key West International Airport 	                      EYW",
        "Miami International Airport 	                          MIA",
        "Orlando 	                                              MCO",
        "Pensacola 	                                              PNS",
        "St. Petersburg 	                                      PIE",
        "Sarasota 	                                              SRQ",
        "Tampa 	                                                  TPA",
        "West Palm Beach 	                                      PBI",
        "Panama City-Bay County International Airport 	          PFN",
        "Georgia 	                                               GA",
        "Atlanta Hartsfield International Airport 	              ATL",
        "Augusta 	                                              AGS",
        "Savannah 	                                              SAV",
        "Hawaii 	                                               HI",
        "Hilo 	                                                  ITO",
        "Honolulu International Airport 	                      HNL",
        "Kahului 	                                              OGG",
        "Kailua 	                                              KOA",
        "Lihue 	                                                  LIH",
        "Idaho 	                                                   ID",
        "Boise 	                                                  BOI",
        "Illinois 	                                               IL",
        "Chicago Midway Airport 	                              MDW",
        "Chicago, O'Hare International Airport Airport 	          ORD",
        "Moline 	                                              MLI",
        "Peoria 	                                              PIA",
        "Indiana 	                                               IN",
        "Evansville 	                                          EVV",
        "Fort Wayne 	                                          FWA",
        "Indianapolis International Airport 	                  IND",
        "South Bend 	                                          SBN",
        "Iowa 	                                                   IA",
        "Cedar Rapids 	                                          CID",
        "Des Moines 	                                          DSM",
        "Kansas 	                                               KS",
        "Wichita 	                                              ICT",
        "Kentucky 	                                               KY",
        "Lexington 	                                              LEX",
        "Louisville 	                                          SDF",
        "Louisiana 	                                               LA",
        "Baton Rouge 	                                          BTR",
        "New Orleans International Airport 	                      MSY",
        "Shreveport 	                                          SHV",
        "Maine 	                                                   ME",
        "Augusta 	                                              AUG",
        "Bangor 	                                              BGR",
        "Portland 	                                              PWM",
        "Maryland 	                                               MD",
        "Baltimore 	                                              BWI",
        "Massachusetts 	                                           MA",
        "Boston, Logan International Airport 	                  BOS",
        "Hyannis 	                                              HYA",
        "Nantucket 	                                              ACK",
        "Worcester 	                                              ORH",
        "Michigan 	                                               MI",
        "Battlecreek 	                                          BTL",
        "Detroit Metropolitan Airport 	                          DTW",
        "Detroit 	                                              DET",
        "Flint 	                                                  FNT",
        "Grand Rapids 	                                          GRR",
        "Kalamazoo-Battle Creek International Airport 	          AZO",
        "Lansing 	                                              LAN",
        "Saginaw 	                                              MBS",
        "Minnesota 	                                               MN",
        "Duluth 	                                              DLH",
        "Minneapolis/St.Paul International Airport 	              MSP",
        "Rochester 	                                              RST",
        "Mississippi 	                                           MS",
        "Gulfport 	                                              GPT", 
        "Jackson 	                                              JAN",
        "Missouri 	                                               MO",
        "Kansas City 	                                          MCI",
        "St Louis, Lambert International Airport 	              STL",
        "Springfield 	                                          SGF",
        "Montana 	                                               MT",
        "Billings 	                                              BIL",
        "Nebraska 	                                               NE",
        "Lincoln 	                                              LNK",
        "Omaha 	                                                  OMA",
        "Nevada 	                                               NV",
        "Las Vegas, Las Vegas McCarran International Airport 	  LAS",
        "Reno-Tahoe International Airport 	                      RNO",
        "New Hampshire 	                                           NH",
        "Manchester 	                                          MHT",
        "New Jersey 	                                           NJ",
        "Atlantic City International Airport 	                  ACY",
        "Newark International Airport 	                          EWR",
        "Trenton 	                                              TTN",
        "New Mexico 	                                           NM",
        "Albuquerque International Airport 	                      ABQ",
        "Alamogordo  	                                          ALM",
        "New York 	                                               NY",
        "Albany International Airport 	                          ALB",
        "Buffalo 	                                              BUF",
        "Islip 	                                                  ISP",
        "New York, John F Kennedy International Airport 	      JFK",
        "New York, La Guardia Airport 	                          LGA",
        "Newburgh 	                                              SWF",
        "Rochester 	                                              ROC",
        "Syracuse 	                                              SYR",
        "Westchester 	                                          HPN",
        "North Carolina 	                                       NC",
        "Asheville 	                                              AVL",
        "Charlotte/Douglas International Airport 	              CLT",
        "Fayetteville 	                                          FAY",
        "Greensboro 	                                          GSO",
        "Raleigh 	                                              RDU",
        "Winston-Salem 	                                          INT",
        "North Dakota 	                                           ND",
        "Bismark 	                                              BIS",
        "Fargo 	                                                  FAR",
        "Ohio 	                                                   OH",
        "Akron 	                                                  CAK",
        "Cincinnati 	                                          CVG",
        "Cleveland 	                                              CLE",
        "Columbus 	                                              CMH",
        "Dayton 	                                              DAY",
        "Toledo 	                                              TOL", 
        "Oklahoma 	                                               OK",
        "Oklahoma City 	                                          OKC",
        "Tulsa 	                                                  TUL",
        "Oregon 	                                               OR",
        "Eugene 	                                              EUG",
        "Portland International Airport 	                      PDX",
        "Portland, Hillsboro Airport 	                          HIO",
        "Salem 	                                                  SLE",
        "Pennsylvania 	                                           PA",
        "Allentown 	                                              ABE",
        "Erie 	                                                  ERI",
        "Harrisburg 	                                          MDT",
        "Philadelphia 	                                          PHL",
        "Pittsburgh 	                                          PIT",
        "Scranton 	                                              AVP",
        "Rhode Island 	                                           RI",
        "Providence - T.F. Green Airport 	                      PVD",
        "South Carolina 	                                       SC",
        "Charleston 	                                          CHS",
        "Columbia 	                                              CAE",
        "Greenville 	                                          GSP",
        "Myrtle Beach 	                                          MYR",
        "South Dakota                                          	   SD",
        "Pierre 	                                              PIR",
        "Rapid City 	                                          RAP",
        "Sioux Falls 	                                          FSD",
        "Tennessee 	                                               TN",
        "Bristol 	                                              TRI",
        "Chattanooga 	                                          CHA",
        "Knoxville 	                                              TYS",
        "Memphis 	                                              MEM",
        "Nashville 	                                              BNA",
        "Texas 	                                                   TX",
        "Amarillo 	                                              AMA",
        "Austin Bergstrom International Airport 	              AUS",
        "Corpus Christi 	                                      CRP",
        "Dallas Love Field Airport 	                              DAL",
        "Dallas/Fort Worth International Airport 	              DFW",
        "El Paso 	                                              ELP",
        "Houston, William B Hobby Airport 	                      HOU",
        "Houston, George Bush Intercontinental Airport 	          IAH",
        "Lubbock 	                                              LBB",
        "Midland 	                                              MAF",
        "San Antonio International Airport 	                      SAT",
        "Utah 	                                                   UT",
        "Salt Lake City 	                                      SLC",
        "Vermont 	                                               VT",
        "Burlington 	                                          BTV",
        "Montpelier 	                                          MPV",
        "Rutland 	                                              RUT",
        "Virginia 	                                               VA",
        "Dulles 	                                              IAD",
        "Newport News 	                                          PHF",
        "Norfolk 	                                              ORF",
        "Richmond 	                                              RIC",
        "Roanoke 	                                              ROA",
        "Washington 	                                           WA",
        "Pasco, Pasco/Tri-Cities Airport 	                      PSC",
        "Seattle, Tacoma International Airport 	                  SEA",
        "Spokane International Airport 	                          GEG",
        "West Virginia 	                                           WV",
        "Charleston 	                                          CRW",
        "Clarksburg 	                                          CKB",
        "Huntington Tri-State Airport 	                          HTS",
        "Wisconsin 	                                               WI",
        "Green Bay 	                                              GRB",
        "Madison 	                                              MSN",
        "Milwaukee 	                                              MKE",
        "Wyoming 	                                               WY",
        "Casper 	                                              CPR",
        "Cheyenne 	                                              CYS",
        "Jackson Hole 	                                          JAC",
        "Rock Springs 	                                          RKS"
    ];

    for (i in nameList) {
        let str = nameList[i];
        let kode = str.substring(str.length-3, str.length);
        const pair = {
            "lable" : str.slice(0,str.search("  ")),
            "id" : kode,
        }
        finalList.push(pair);
    }
    return finalList;
}
