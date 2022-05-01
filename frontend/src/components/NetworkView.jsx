/* eslint-disable react/prop-types */
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * Colorscheme from https://sashamaps.net/docs/resources/20-colors/ with 95% accessibility setting
 */
const colorScheme = [
  '#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
  '#42d4f4', '#f032e6', '#fabed4', '#469990', '#dcbeff',
  '#9A6324', '#fffac8', '#800000', '#aaffc3', '#000075',
  '#a9a9a9', '#ffffff', '#000000'
];

// eslint-disable-next-line react/prop-types
export default function NetworkView ({ dataModel }) {
  const rootSVG = useRef(null);

  // Turns the current dataset into "proper" node data
  // the schema being {id: string, group: x}
  // family is group 1, subdivision is group 2, and language is group 3
  const modelToGraph = (data) => {
    const familiyNodes = data.families.map(d => { return { id: d.name, name: d.name, group: 1 }; });
    const familyLinks = data.families.flatMap(fam => fam.allEntries.map(subd => { return { source: fam.name, target: subd }; }));
    const subdivisionNodes = data.subdivisions.map(d => { return { id: d.name, name: d.name, group: 2 }; });
    const subdivisionLinks = data.subdivisions.flatMap(fam => fam.languages.map(subd => { return { source: fam.name, target: subd }; }));
    const languageNodes = data.languages.map(lang => { return { id: lang.name, name: lang.name, group: 3 }; });

    const nodes = [...familiyNodes, ...subdivisionNodes, ...languageNodes];
    const links = [...familyLinks, ...subdivisionLinks];
    console.log({ nodes, links });
    return { nodes, links };
  };
  useEffect(() => {
    // This implementation was based on code from the networks lab
    // taught by Prof. Lane Harrison on 3-21-22
    if (rootSVG) {
      // on click region: (title of network viz becomes region name)
      // tree needs to go langauge family -> subdivision -> language
      const svg = d3.select(rootSVG.current);

      const height = +svg.attr('height');
      const width = +svg.attr('width');

      const allSubdivisions = dataModel.subdivisions.map(d => d.name);
      const color = d3.scaleOrdinal().domain(allSubdivisions).range(colorScheme);

      const data = modelToGraph(dataModel);

      // Set background -- similar to dark ocean
      svg
        .append('rect')
        .attr('id', 'background-network')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('fill', 'gray');
      // simulation definition
      const simulation = d3.forceSimulation(data.nodes)
        .force('link', d3.forceLink(data.links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-10))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('y', d3.forceY(d => 200 * (d.group - 1)));

      // drawing nodes and links
      const link = svg.append('g')
        .selectAll('line')
        .data(data.links)
        .enter().append('line')
        .attr('stroke-width', d => Math.sqrt(d.weight * 16))
        .attr('stroke', '#000')
        .attr('stroke-opacity', 0.6);

      const node = svg.append('g')
        .selectAll('circle')
        .data(data.nodes)
        .enter().append('circle')
        .attr('r', d => (4 - d.group) * 10)
        .attr('fill', d => {
          if (d.group === 2) {
            return color(d.name);
          } else if (d.group === 3) {
            const foundLanguage = dataModel.languages.find(l => l.name === d.name);
            if (foundLanguage) {
              return color(foundLanguage.subdivision);
            }
          }
          return 'black';
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .call(drag(simulation));

      node.append('title')
        .text(d => d.id);

      // use simulation to update nodes and links
      simulation.on('tick', function () {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        node
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);
      });

      function drag (simulation) {
        function dragstarted (event) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        }

        function dragged (event) {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        }

        function dragended (event) {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }

        return d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended);
      }
    }
  }, []);

  return <svg width={800} height={600} ref={rootSVG}></svg>;
};
