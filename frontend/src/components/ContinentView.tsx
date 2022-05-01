import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GeoJSON } from 'geojson';
import { Model } from 'types/Model';

/**
 * Colorscheme from https://sashamaps.net/docs/resources/20-colors/ with 95% accessibility setting
 */
const colorScheme = [
  '#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
  '#42d4f4', '#f032e6', '#fabed4', '#469990', '#dcbeff',
  '#9A6324', '#fffac8', '#800000', '#aaffc3', '#000075',
  '#a9a9a9', '#ffffff', '#000000'
];

/**
 * Component that represents the d3 visualization of the map
 */
export default function ContinentView (props: { borderData: GeoJSON, dataModel: Model, dispatch: (event: any) => void}) {
  const rootSVG = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const borderData = props.borderData;
    const dataModel = props.dataModel;
    const flattenedAreas = dataModel.areas.flatMap(area => area.languages);

    if (borderData.type === 'FeatureCollection' && rootSVG.current) {
      const allSubdivisions = dataModel.subdivisions.map(d => d.name);

      // Set background -- similar to dark ocean
      d3.select(rootSVG.current)
        .append('rect')
        .attr('id', 'background')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('fill', '#064273');

      // Color scale
      const getSubdivision = (language : string) => {
        const found = dataModel.languages.find(other => language === other.name);
        return found ? found.subdivision : 'Aslian';
      };

      const colors = d3.scaleOrdinal<string, string>().domain(allSubdivisions).range(colorScheme);

      // Opacity
      const populations = flattenedAreas.map(d => d.population);
      const opacity = d3.scaleLinear()
        .domain([Math.min(...populations), Math.max(...populations)])
        .range([0.7, 1]);

      const proj = d3.geoEquirectangular()
        .scale(500)
        .center([50, 50]);

      const gpath = d3.geoPath()
        .projection(proj);
      // Add a selected flag to the geo dataset
      const plottedFeatures = borderData.features;
      // draw country boundaries
      d3.select(rootSVG.current)
        .append('g')
        .attr('id', 'countries')
        .selectAll('path')
        .data(plottedFeatures)
        .enter()
        .append('path')
        .attr('d', function (d) { return gpath(d); })
        .attr('id', d => (d.id) ? d.id : '')
        .attr('stroke-width', 1)
        .attr('stroke', '#654321')
        // Parchment fill
        .attr('fill', '#fcf5e5')
        // On click, select the country
        .on('click', function (event, d) {
          const name : string = (d.properties as any).geounit;
          console.log(`Selected ${name}`);
          // Do the dispatch here
          props.dispatch({ type: 'location', value: name });
          // Modify the schema a bit
          d3.select(rootSVG.current)
            .select('#countries')
            .selectAll('path')
            .attr('fill', '#fcf5e5');

          d3.select(this)
            .attr('fill', 'darkgreen');
        });

      const langGroup = d3.select(rootSVG.current)
        .selectAll('.Area')
        .data(props.dataModel.areas)
        .enter()
        .append('g')
        .attr('class', 'Area')
        .attr('id', d => d.name)
        .selectAll('g, circle')
        .data(d => d.languages)
        .enter()
        .append('g')
        .attr('class', (lang, i) => `LocationGroup_${lang.id}_${i}`);

      // Add the circles in
      langGroup
        .append('circle')
        .attr('class', d => `Circle_${d.id}`)
        .attr('r', 4)
        .attr('fill', d => colors(getSubdivision(d.id)))
        .attr('opacity', d => opacity(d.population))
        .attr('transform', d => {
          return 'translate(' + proj([
            d.longitude,
            d.latitude
          ]) + ')';
        })
        .on('mouseover', function (event, d) {
          // Used this as reference for calculations: https://stackoverflow.com/a/45424292
          const circumference = 6371 * Math.PI * 2;
          const angle = d.radius / circumference * 360;
          const circle = d3.geoCircle().center([d.longitude, d.latitude]).radius(angle);
          // Given a language is highlighted, highlight all of the circles in a language
          d3.select(this.parentElement)
            .append('path')
            .attr('d', gpath(circle()))
            .attr('stroke-width', 2)
            .attr('fill', colors(getSubdivision(d.id)))
            .attr('opacity', opacity(d.population))
            .attr('stroke', '#654321');

          // Add the label in
          d3.select(this.parentElement)
            .append('text')
            .attr('fill', 'goldenrod')
            .style('font', '12px Arial, sans-serif')
            .style('font-weight', 'bold')
            .text(`Language: ${d.id} Population: ${d.population} Radius: ${d.radius} km`)
            .attr('transform', () => {
              return 'translate(' + proj([
                d.longitude,
                d.latitude
              ]) + ')';
            })
            .raise();

          // Raise the 'hitbox' of the OG circle
          d3.select(this)
            .attr('opacity', 0)
            .raise();
        })
        .on('mouseout', function (event, d) {
          d3.select(this)
            .attr('opacity', opacity(d.population));

          d3.select(this.parentElement)
            .selectAll('path, text')
            .remove();
        });

      const zoomed = (e : any) => {
        proj
          .translate([e.transform.x, e.transform.y])
          .scale(e.transform.k);

        // redraw map with new projection settings
        d3.select(rootSVG.current)
          .selectAll('path')
          .attr('d', (d : any) => gpath(d));

        d3.select(rootSVG.current)
          .selectAll('circle,text')
          .attr('transform', (d: any) => {
            return `translate( ${proj([d.longitude, d.latitude])} ) scale( ${e.transform.k / 1000} )`;
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
    <svg ref={rootSVG} width='100%' height='600'>
    </svg>
  );
};
