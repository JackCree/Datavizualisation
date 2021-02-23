const projectName = 'bar-chart';

var width = 800,
	height = 400,
	barWidth = width / 275;

var tooltip = d3.select('.visHolder')
				.append('div')
				.attr('id', 'tooltip')
				.style('opacity', 0);

var overlay = d3.select('.visHolder')
				.append('div')
				.attr('class', 'overlay')
				.style('opacity',0);

var svgContainer = d3.select('.visHolder')
					 .append('svg')
					 .attr('width', width + 100)
					 .attr('height', height + 60);

let dataset;
let req = new XMLHttpRequest();
req.open("GET", 'https://raw.githubusercontent.com/JackCree/Datavizualisation/main/GDP-data.json', true);
req.onreadystatechange = ()=>{
  if(req.readyState == 4 && req.status == 200)
    dataset = JSON.parse(req.responseText);
}
req.send();

//Json Request
d3.json(
	dataset,
	function(e, data) {
		svgContainer.append('text')
			      	.attr('transform', 'rotate(-90)')
			      	.attr('x', -200)
			      	.attr('y', 80)
			      	.style('fill', 'rgba(255,255,255,0.4')
			      	.text('Gross Domestic Product');
		svgContainer.append('text')
					.attr('x',width/2 + 120)
					.attr('y', height + 40)
					.style('fill', 'rgba(255,255,255,0.4')
					.text('More Information: https://www.bea.gov/national/pdf/nipaguid.pdf')
					.attr('class', 'info');
		svgContainer.append('text')
					.attr('x', width/2)
					.attr('y', height + 40)
					.attr('class', 'axis-title')
					.style('fill', 'rgba(255,255,255,0.4')
					.text('Years');

		document.getElementById('from_date').innerHTML = data.from_date;
		document.getElementById('to_date').innerHTML = data.to_date;


		const comment = data.description;
		const index = comment.indexOf('-');
		const firstLine = comment.substring(0, index);
		svgContainer.append('text')
					.attr('x', 60)
					.attr('y', height + 60)
					.style('fill', 'rgba(255,255,255,0.2')
					.attr('class', 'comment')
					.text(firstLine);

		//Select the years and the quarter of the years
		var years = data.data.map(function(item){
			var quarter;
			var temp = item[0].substring(5, 7);

			switch(temp) {
				case '01':
				quarter = 'Q1'
				break; 
				case '04':
				quarter = 'Q2'
				break;
				case '07':
				quarter = 'Q3'
				break; 
				case '10':
				quarter = '04'
				break;  
			}
			//return the date with the form AAAA Q1/2/3/4
			return item[0].substring(0,4) + ' ' + quarter;
		});

		var yearsData = data.data.map(function(item) {
			return new Date(item[0]);
		});

		//Define the X-axis
		var xMax = new Date(d3.max(yearsData));
		xMax.setMonth(xMax.getMonth() + 3);
		var xScale = d3.scaleTime()
					   .domain([d3.min(yearsData), xMax])
					   .range([0, width]);

		var xAxis = d3.axisBottom().scale(xScale);

		svgContainer.append('g')
					.call(xAxis)
					.attr('id','x-axis')
					.attr('transform', 'translate(60, 400)')
		
		//Define the y-Axis
		var GDP = data.data.map(function (item) {
			return item[1];
		});

		var scaleGDP = [];

		var gdpMax = d3.max(GDP);

		var linearScale = d3.scaleLinear().domain([0, gdpMax]).range([0, height]);

		scaleGDP = GDP.map(function(item) {
			return linearScale(item);
		});

		var yAxisScale = d3.scaleLinear().domain([0, gdpMax]).range([height, 0]);

		var yAxis = d3.axisLeft(yAxisScale);

		svgContainer.append('g')
					.call(yAxis)
					.attr('id', 'y-axis')
					.attr('transform', 'translate(60, 0)');

		d3.select('svg')
		  .selectAll('rect')
		  .data(scaleGDP)
		  .enter()
		  .append('rect')
		  .attr('data-date', function(d, i) {
		  	return data.data[i][0];
		  })
		  .attr('data-gdp', function(d, i) {
		  	return data.data[i][1];
		  })
		  .attr('class', 'bar')
		  .attr('x', function(d, i) {
		  	return xScale(yearsData[i]);
		  })
		  .attr('y', function(d) {
		  	return height -d;
		  })
		  .attr('width', barWidth)
		  .style('fill', '#33adff')
		  .attr('transform', 'translate(60, 0)')
		  .on("mouseover", function(d, i) {
		  	overlay.transition()
		  	.duration(0)
		  	.style('width', barWidth + 'px')
		  	.style('height', d + 'px')
		  	.style('opacity', 0.5)
		  	.style('left', i * barWidth + 0 + 'px')
		  	.style('top', height - d + 'px')
		  	.style('transform', 'translateX(60px');
		  tooltip.transition().duration(200).style('opacity', 0.9);
		  tooltip.html(
            years[i] +
              '<br>' +
              '$' +
              GDP[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') +
              ' Billion'
          )
		  .attr('data-date', data.data[i][0])
		  .style('left', i * barWidth + 30 + 'px')
		  .style('top', height - 100 + 'px')
		  .style('transform', 'translateX(60px)');
		  })
		  .on('mouseout', function() {
		  	tooltip.transition().duration(200).style('opacity', 0);
		  	overlay.transition().duration(200).style('opacity', 0);
		  })
		  .transition()
		  .duration(2000)
		  .delay((d, i) => i * 10)
		  .attr('height',function(d) {
		  	return  d;
		  })
		  .attr('y', function(d) {
		  	return height - d;
		  	});
		}
	);
