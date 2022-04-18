import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GeoJSON } from 'geojson';

/**
 * Component that represents the d3 visualization of the map
 */
export default function ContinentView (props: { borderData: GeoJSON }) {
  const rootSVG = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const borderData = props.borderData;
    if (borderData.type === 'FeatureCollection' && rootSVG.current) {
      const proj = d3.geoEquirectangular()
        .translate([250, 250])
        .scale(300);

      const gpath = d3.geoPath()
        .projection(proj);

      // draw country boundaries
      d3.select(rootSVG.current)
        .append('g')
        .attr('id', 'countries')
        .selectAll('path')
        .data(borderData.features)
        .enter()
        .append('path')
        .attr('d', function (d) { console.log(d); return gpath(d); })
        .attr('id', d => (d.id) ? d.id : '')
        .attr('stroke-width', 1)
        .attr('stroke', 'gray')
        .attr('fill', 'gray');

      const zoomed = (e : any) => {
        proj
          .translate([e.transform.x, e.transform.y])
          .scale(e.transform.k);

        console.log(e.transform.k);

        if (e.transform.k > 400) {
          console.log('toggle adaptive map feature');
        }

        // redraw map with new projection settings
        d3.select(rootSVG.current)
          .selectAll('path')
          .attr('d', (d : any) => gpath(d));
      };

      const mapZoom = d3.zoom<SVGSVGElement, unknown>()
        .on('zoom', zoomed);

      const zoomSettings = d3.zoomIdentity
        .translate(250, 250)
        .scale(300);

      d3.select(rootSVG.current)
        .call(mapZoom)
        .call(mapZoom.transform, zoomSettings);
    } else {
      console.error('Incorrect Type of Data for this visualization.');
    }
  }, [props.borderData]);

  return (
    <svg ref={rootSVG} width={800} height={600}>
    </svg>
  );
};
