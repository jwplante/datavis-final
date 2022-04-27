import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GeoJSON } from 'geojson';
import { Model } from 'types/Model';

/**
 * Component that represents the d3 visualization of the map
 */
export default function ContinentView (props: { borderData: GeoJSON, dataModel: Model }) {
  const rootSVG = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const borderData = props.borderData;

    if (borderData.type === 'FeatureCollection' && rootSVG.current) {
      const proj = d3.geoEquirectangular()
        .scale(500)
        .center([50, 50]);

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
        .attr('stroke', 'black')
        .attr('fill', 'white');

      d3.select(rootSVG.current)
        .selectAll('g')
        .data(props.dataModel.areas)
        .enter()
        .append('g')
        .attr('id', d => d.name)
        .selectAll('circle')
        .data(d => d.languages.flatMap(d => {
          const languageNames = Object.keys(d);
          const locations = d[languageNames[0]].map((d, i) => { return { ...d, id: languageNames[i] }; });
          return locations;
        }))
        .enter()
        .append('circle')
        .attr('class', d => d.id)
        .attr('r', 1)
        .attr('transform', (d) => {
          return 'translate(' + proj([
            d.longitude,
            d.latitude
          ]) + ')';
        });

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

        d3.select(rootSVG.current)
          .selectAll('circle')
          .attr('transform', (d: any) => {
            return 'translate(' + proj([
              d.longitude,
              d.latitude
            ]) + ')';
          });
      };

      const mapZoom = d3.zoom<SVGSVGElement, unknown>()
        .on('zoom', zoomed);

      const zoomSettings = d3.zoomIdentity
        .scale(500);

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
