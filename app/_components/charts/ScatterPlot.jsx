'use client'

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ScatterPlot = ({ data, width = 600, height = 400, margin = { top: 20, right: 30, bottom: 60, left: 60 } }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !data.length) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Get dynamic keys
    const keys = Object.keys(data[0]);
    const xKey = keys[0];
    const yKey = keys[1];

    // Format data
    const formattedData = data.map(d => ({
      x: d[xKey],
      y: Number(d[yKey]) || 0,
      label: d[xKey],
      value: Number(d[yKey]) || 0
    }));

    // Create scales
    const xScale = d3.scaleBand()
      .domain(formattedData.map(d => d.x))
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(formattedData, d => d.y) * 1.1])
      .range([innerHeight, 0]);

    const sizeScale = d3.scaleLinear()
      .domain([0, d3.max(formattedData, d => d.value)])
      .range([5, 20]);

    // Create container group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add dots
    g.selectAll('.dot')
      .data(formattedData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.x) + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(d.y))
      .attr('r', d => sizeScale(d.value))
      .attr('fill', 'var(--chart-1, #ef4444)')
      .attr('opacity', 0.7)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 1);
        
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background-color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
          .style('opacity', 0);

        tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        
        tooltip.html(`
          <strong>${d.label}</strong><br/>
          ${xKey}: ${d.x}<br/>
          ${yKey}: ${d.y}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.7);
        d3.selectAll('.tooltip').remove();
      });

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-0.8em')
      .attr('dy', '0.15em');

    g.append('g')
      .call(d3.axisLeft(yScale));

    // Add axis labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + margin.bottom - 5)
      .attr('text-anchor', 'middle')
      .text(data.xAxis || xKey);

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 15)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .text(data.yAxis || yKey);

  }, [data, width, height, margin]);

  return (
    <div className="relative">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ScatterPlot; 