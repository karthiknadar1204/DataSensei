'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function GraphRenderer({ data }) {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const mergedData = data.flat();

    svg.append('g')
      .selectAll('rect')
      .data(mergedData)
      .enter().append('rect')
      .attr('width', d => d.value * 5)
      .attr('height', 20)
      .attr('y', (d, i) => i * 30)
      .attr('fill', (d, i) => d3.schemeCategory10[i % 10]);

  }, [data]);

  return <svg ref={ref} width={600} height={600}></svg>;
}
