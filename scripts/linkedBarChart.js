class LinkedBarChart{
    constructor(name,posx,posy,id,dataForPlot,component){
      //data = crimeBySomething
      this.id=id;
      this.name = name;
      this.posx=posx;
      this.data = dataForPlot;
      this.iniData = dataForPlot;
      this.dataGroup = dataForPlot;
      this.svg = d3.select(component).append("svg")
                  .attr("class","canvas")
                  .attr("width",600)
                  .attr("height",150)
                  //.attr("transform","translate("+posx + "," + posy + ")");

      this.newData=[];
      this.redBars=[];

      this.x = d3.scaleLinear().range([35, 600]);
      this.y = d3.scaleBand().range([100, 0]);

      var parseDate = d3.timeParse("%m/%d/%Y");

      this.svg.append("g")
          .attr("class", "xAxis")
             .attr("transform", "translate(50," + 100 + ")")
            .call(d3.axisBottom(this.x));

      this.svg.append("g")
          .attr("class", "yAxis")
          .attr("transform", "translate(85," + 0 + ")")
          .call(d3.axisLeft(this.y).ticks(7));
  }

  getDia(num){
    if(Number(num)<7){
      var dias = ['Dom','Seg','Ter','Qua','Qui','Sex','Sab']
      return dias[num]
    }
    else return num
  }

  generatePlot(data){
      this.data=data;
      this.iniData=data;
      this.dataGroup=data.group()
      var auxThis = this;
      var color2=d3.scaleSequential(d3.interpolateYlOrRd).domain([-d3.max(this.dataGroup.all(), function(d) { return d.value; }), d3.max(this.dataGroup.all(), function(d) { return d.value; })]).clamp(true);
      this.x.domain([0, d3.max(this.dataGroup.all(), function(d) { return d.value; })]);
      this.y.domain(this.dataGroup.all().map(function(d) { return auxThis.getDia(d.key); })).padding(0.1);
      console.log(this.y.domain());
      this.svg.select(".yAxis").call(d3.axisLeft(this.y).ticks(7));
      this.svg.select(".xAxis").call(d3.axisBottom(this.x));
      this.svg.selectAll(".bar1")
          .data(this.dataGroup.all())
          .enter().append("rect")
          .attr("class", "bar1")
          .attr("x", 0)
          .attr("height", this.y.bandwidth())
          .attr("y", function(d) { return auxThis.y(auxThis.getDia(d.key)); })
          .attr("width", function(d) { return (auxThis.x(d.value)-35); })
          .attr("transform", "translate(85," + 0 + ")")
          .attr("fill",function(d){return color2(d.value)})
          .on('mouseover',function(d){console.log(d.value);})
          .on('click',function(d){if(this.style.fill!="purple"){
                                    this.style.fill = "purple";
                                    auxThis.redBars.push(this.__data__.key)
                                    if(auxThis.dispatcher!=null)auxThis.dispatcher.apply("filterChanged",{id:auxThis.id,filters:auxThis.redBars});
                                  }
                                  else{
                                    this.style.fill=color2(d.value)
                                    auxThis.redBars.splice(auxThis.redBars.indexOf(this.__data__.key),1)
                                    if(auxThis.dispatcher!=null)auxThis.dispatcher.apply("filterChanged",{id:auxThis.id,filters:auxThis.redBars});
                                  }})
  }

  updatePlot(data,currentBars){
    console.log(currentBars);
    this.x.domain([0, d3.max(data.group().all(), function(d) { return d.value; })]);
    var auxThis = this;
    this.svg.select(".xAxis")
        .attr("transform", "translate(50," + 100 + ")")
        .call(d3.axisBottom(this.x));

    var color2=d3.scaleSequential(d3.interpolateYlOrRd).domain([-d3.max(data.group().all(), function(d) { return d.value; }), d3.max(data.group().all(), function(d) { return d.value; })]).clamp(true);
    var bars = this.svg.selectAll(".bar1")
                       .remove()
                       .exit()
                       .data(data.group().all())
    if(currentBars===undefined){
      bars.enter().append("rect")
      .attr("class", "bar1")
      .attr("x", 0)
      .attr("height", this.y.bandwidth())
      .attr("y", function(d) { return auxThis.y(auxThis.getDia(d.key));})
      .attr("width", function(d) { return (auxThis.x(d.value)-35); })
      .attr("transform", "translate(85," + 0 + ")")
      .attr("fill",function(d,i){return color2(d.value)})
      .on('mouseover',function(d){console.log(d.value);})
      .on('click',function(d){if(this.style.fill!="purple"){
                                this.style.fill="purple";
                                auxThis.redBars.push(this.__data__.key)
                                if(auxThis.dispatcher!=null)auxThis.dispatcher.apply("filterChanged",{id:auxThis.id,filters:auxThis.redBars});
                              }
                              else{
                                this.style.fill=color2(d.value)
                                auxThis.redBars.splice(auxThis.redBars.indexOf(this.__data__.key),1)
                                if(auxThis.dispatcher!=null)auxThis.dispatcher.apply("filterChanged",{id:auxThis.id,filters:auxThis.redBars});
                              }})


    }
    else{
      bars.enter().append("rect")
      .attr("class", "bar1")
      .attr("x", 0)
      .attr("height", this.y.bandwidth())
      .attr("y", function(d) { return auxThis.y(auxThis.getDia(d.key)); })
      .attr("width", function(d) { return (auxThis.x(d.value)-35); })
      .attr("transform", "translate(85," + 0 + ")")
      .attr("fill",function(d,i){
                                 if(currentBars[i].hasAttribute('style') && currentBars[i].getAttribute('style')=='fill: purple;'){
                                  console.log("tem style purple");
                                  this.style.fill="purple";
                                  return "purple"
                                 }
                                 else{
                                  this.style.fill=color2(d.value)
                                  return color2(d.value)
                                 }
                                 })
      .on('mouseover',function(d){console.log(d.value);})
      .on('click',function(d){if(this.style.fill!="purple"){
                                this.style.fill="purple";
                                auxThis.redBars.push(this.__data__.key)
                                if(auxThis.dispatcher!=null)auxThis.dispatcher.apply("filterChanged",{id:auxThis.id,filters:auxThis.redBars});
                              }
                              else{
                                this.style.fill=color2(d.value)
                                auxThis.redBars.splice(auxThis.redBars.indexOf(this.__data__.key),1)
                                if(auxThis.dispatcher!=null)auxThis.dispatcher.apply("filterChanged",{id:auxThis.id,filters:auxThis.redBars});
                              }})
    }

  }
}
