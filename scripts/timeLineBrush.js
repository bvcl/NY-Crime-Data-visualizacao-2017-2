class TimeLineBrush{
    constructor(name,posx,posy,id){
      this.id=id;
      this.name = name;
      this.posx=posx;
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

      this.currentScale=d3.scaleTime().range([posx,posx+641]).domain([parseDate("01/01/2000"),parseDate("12/31/2016")]);
      this.currentInvScale=d3.scaleTime().domain([posx,posx+641]).range([parseDate("01/01/2000"),parseDate("12/31/2016")]);
      this.currentInvScale2=d3.scaleTime().domain([posx,posx+641]).range([parseDate("01/01/2000"),parseDate("12/31/2016")]);


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

    zoomed(myself){
      myself.currentScale = d3.event.transform.rescaleX(myself.x2);
      myself.currentInvScale = d3.scaleTime().range(myself.currentScale.domain()).domain(myself.currentScale.range())
      myself.currentInvScale2 = d3.scaleTime().range(myself.currentScale.domain()).domain(myself.currentScale.range())

      myself.context.select(".axisX").call(myself.xAxis2.scale(myself.currentScale));
      myself.context.select(".brush").call(myself.brush.move, myself.x2.range().map(d3.event.transform.invertX,d3.event.transform ));
    }
}
