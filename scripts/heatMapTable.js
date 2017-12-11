class HeatMapTable{
    constructor(id,data){
      this.svg = d3.select('#heatmap')
      .append("svg")
      .attr("class","canvas")
      .attr("width",1080)
      .attr("height",300)
      //.attr("transform", "translate(" + 50 + "," + 50 + ")");
      var crimeNYCForTable = crossfilter(data);
      var location_dim = crimeNYCForTable.dimension(function(d) { return d.BORO_NM; });
      var hour_dimension = crimeNYCForTable.dimension(function(d) { return d.CMPLNT_FR_TM.split(':')[0];});
      var crimes_dimension = crimeNYCForTable.dimension(function(d) {return d.OFNS_DESC;})
      this.itemSize = 40;
      this.cellSize = this.itemSize - 1;

      this.boroughs = ['Queens','Staten Island','Manhattan','Brooklyn','Bronx']
      this.hours = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23']

      this.data = []
      var auxThis=this
      var maxValue = 0;
      for (var i=0; i < this.boroughs.length; i++) {
        for (var j = 0; j < this.hours.length; j++) {
          hour_dimension.filter(function(d){return d==auxThis.hours[j]})
          location_dim.filter(function(d){return d==auxThis.boroughs[i].toUpperCase()})
          var v = crimes_dimension.top(Infinity).length;
          if(v>maxValue)maxValue=v;
          this.data.push({'borough':this.boroughs[i],'hour':this.hours[j],'value':v})
        }
      }
      this.x_elements = this.hours.sort()
      this.y_elements = this.boroughs.sort();
      var xrange = []
      for (var i =0;i<this.x_elements.length;i++)xrange.push(i*this.itemSize)
      this.xScale = d3.scaleOrdinal()
      .domain(this.x_elements)
      .range(xrange);

      var yrange = []
      for (var i =0;i<this.y_elements.length;i++)yrange.push(i*this.itemSize)
      this.yScale = d3.scaleOrdinal()
      .domain(this.y_elements)
      .range(yrange);

      this.svg.append("g")
      .attr("class", "axisHeatTable")
      .attr("transform", "translate(105," + 20 + ")")
      .call(d3.axisTop(this.xScale));

      this.svg.append("g")
      .attr("class", "axisHeatTable")
      .attr("transform", "translate(85," + 40 + ")")
      .call(d3.axisLeft(this.yScale));
                                          //YlOrRd ou BuPu
      this.colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([Math.round(-maxValue/4), maxValue]).clamp(true);

      var cells = this.svg.selectAll('rect')
          .data(this.data)
          .enter().append('g').append('rect')
          .attr('class', 'cell')
          .attr('width', this.cellSize)
          .attr('height', this.cellSize)
          .attr('y', function(d) { return auxThis.yScale(d.borough); })
          .attr('x', function(d) { return auxThis.xScale(d.hour); })
          .attr('fill', function(d) { return auxThis.colorScale(d.value); })
          .attr("transform", "translate(85," + 20 + ")")
          .on("mouseover", function(d) {
              hour_dimension.filter(function(o) { return o == d.hour; });
              location_dim.filter(function(o) { return o == d.borough.toUpperCase(); });
              var crimeTypes = crimes_dimension.group().top(3)
              var text1 = d.value + ' crime(s) reported in ' + d.borough + ' at ' + d.hour + 'h';
              var text2 = 'Most common: ' + crimeTypes[0].key.toLowerCase() + ', ' + crimeTypes[1].key.toLowerCase() + ', ' + crimeTypes[2].key.toLowerCase();
              auxThis.svg.append("text")
                  .attr("x", 0)
                  .attr("y", 220)
                  .attr("class", "label")
                  .attr("transform", "translate("+(400-text1.length)+"," + 20 + ")")
                  .style("font-family", "arial")
                  .style("font-size", "23px")
                  .style("fill","black")
                  .text(text1);
              auxThis.svg.append("text")
                  .attr("x", 0)
                  .attr("y", 250)
                  .attr("class","label")
                  .attr("transform", "translate("+80+"," + 20 + ")")
                  .style("font-family", "arial")
                  .style("font-size", function(){return (Math.ceil(24-(text2.length/25))).toString()+"px";})
                  .style("fill","black")
                  .text(text2);
          })
          .on("mouseout", function() {
              auxThis.svg.selectAll(".label").remove();
          });
    }
}
