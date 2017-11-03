class TimeLineBrush{
    constructor(name,posx,posy,id,dataForLine){
      this.id=id;
      this.name = name;
      this.posx=posx;
      this.data = dataForLine;
      this.iniData = dataForLine;
      this.svg = d3.select("body").append("svg")
                  .attr("class","canvas")
                  .attr("width",700)
                  .attr("height",100)
                  .attr("transform","translate("+posx + "," + posy + ")");
      var that = this;

      this.zoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[posx, 0], [posx+641, 100]])
      .extent([[posx, 0], [posx+641, 100]])
      .on("zoom",function(){that.zoomed(that)});

      var parseDate = d3.timeParse("%m/%d/%Y");

      this.x2 = d3.scaleTime().range([posx,posx+641]).domain([parseDate("01/01/2000"),parseDate("12/31/2016")]);

      this.currentYScale = d3.scaleLinear().range([posy+60,posy]).domain([0,781]);

      this.currentScale=d3.scaleTime().range([posx,posx+641]).domain([parseDate("01/01/2000"),parseDate("12/31/2016")]);
      this.currentInvScale=d3.scaleTime().domain([posx,posx+641]).range([parseDate("01/01/2000"),parseDate("12/31/2016")]);
      this.currentInvScale2=d3.scaleTime().domain([posx,posx+641]).range([parseDate("01/01/2000"),parseDate("12/31/2016")]);

      var xScaleAux = this.currentScale;
      var yScaleAux = this.currentYScale;
      this.line = d3.line()
                    .x(function(d) {
                      return xScaleAux(d.key);
                    })
                    .y(function(d) {
                      return yScaleAux(d.value);
                    })

      this.xAxis2 = d3.axisBottom(this.x2).ticks(17);//.tickFormat(d3.timeFormat("%Y"));

      this.brush = d3.brushX()
          .extent([[posx,posy], [posx+641, posy+60]])
          .on("brush end", function(){that.brushed(that)});

      this.svg.append("rect")
      .attr("class", "zoom")
      .attr("width", (641))
      .attr("height", (posy+80))
      .style("pointer-events", "all")
      .style("fill","none")
      .call(this.zoom)

      this.context = this.svg.append("g")
      .attr("class", "context")

      this.context2 = this.svg.append("g")
      .attr("class", "context2")

      this.context2.append("path").attr("d",this.line([])).attr("class","line").style("fill", "none").style("stroke", "blue").style("stroke-width", 2) ;


      this.context.append("g")
      .attr("class", "axisX")
      .attr("transform", "translate(0,"+posy+62+")")
      .call(this.xAxis2);

      this.context.append("g")
      .attr("class", "brush")
      .call(this.brush)
      .call(this.brush.move, [posx,posx+641])
    }

    forceBrush(){
      var x = parseFloat(d3.select(".selection")._groups[0][0].getAttribute("x"));
      var w = parseFloat(d3.select(".selection")._groups[0][0].getAttribute("width"));
      var myname = this.name;
      var arr = [this.currentInvScale(x),this.currentInvScale2(x+w)]
      if(this.dispatcher!=null)this.dispatcher.apply("selectionChanged",{callerID:myname,dates:arr,posx:this.posx,scale:this.currentScale});
    }
    brushed(myself){
      if(!d3.event.selection){
        myself.context.select(".axisX").call(myself.xAxis2.scale(myself.x2));
        myself.context.select(".brush").call(myself.brush.move, [myself.posx,((myself.posx)+641)]);
        this.dispatcher.apply("nullSelection");
        return;
      }
      var myname = this.name;
      var arr = [myself.currentInvScale(d3.event.selection[0]),myself.currentInvScale2(d3.event.selection[1])]
      if(this.dispatcher!=null)this.dispatcher.apply("selectionChanged",{callerID:myname,dates:arr,posx:this.posx,scale:this.currentScale});
    }

    inInterval(c){
      var d0 = this.currentScale.domain()[0];
      var df = this.currentScale.domain()[1];
      var d = c;
      return (d-d0>=0 && df-d>=0);
    }
    zoomed(myself){
      myself.currentScale = d3.event.transform.rescaleX(myself.x2);
      myself.currentInvScale = d3.scaleTime().range(myself.currentScale.domain()).domain(myself.currentScale.range())
      myself.currentInvScale2 = d3.scaleTime().range(myself.currentScale.domain()).domain(myself.currentScale.range())

      myself.context.select(".axisX").call(myself.xAxis2.scale(myself.currentScale));
      myself.context.select(".brush").call(myself.brush.move, myself.x2.range().map(d3.event.transform.invertX,d3.event.transform ));

      var aux=[]
      var auxThis = this;
      this.iniData.forEach(function(d){
        if(auxThis.inInterval(d.key))aux.push(d)
      })

      this.data=aux;
      var xScaleAux = this.currentScale;
      var yScaleAux = this.currentYScale;
      this.line = d3.line()
                    .x(function(d,i) {
                      return xScaleAux(d.key);
                    })
                    .y(function(d,i) {
                      return yScaleAux(d.value);
                    })
      this.context2.select(".line").attr("d", this.line(this.data));
    }

    updateLineChart(data){
        this.data=data;
        this.iniData=data;
        this.context2.select(".line").attr("d", this.line(this.data));
    }
}
