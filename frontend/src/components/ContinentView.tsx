import React, { useEffect, useRef } from 'react';
import { GeoJSON } from 'geojson';

/**
 * Component that represents the d3 visualization of the map
 */
export default function ContinentView (props: { borderData : GeoJSON }) {
  const rootSVG = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const borderData = props.borderData;
    if (borderData.type === 'FeatureCollection') {
      console.log(borderData);
    } else {
      console.error('Incorrect Type of Data for this visualization.');
    }
  }, [props.borderData]);

  return (
    <svg ref={rootSVG} width={800} height={600}>
    </svg>
  );
};
