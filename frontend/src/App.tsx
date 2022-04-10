import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'geojson';
import ContinentView from 'components/ContinentView';

function App () {
  const [continentDataset, setContinentDataset] = useState<GeoJSON | null>(null);

  useEffect(() => {
    // Grab the dataset from the local server
    fetch('/data/map.geo.json')
      .then(res => {
        return res.json();
      })
      .then(data => {
        // Filter the data
        setContinentDataset(data);
      })
      .catch(err => console.log(`Data could not be loaded! Error: ${err}`));
  }, []);

  return (
    <>
      { (continentDataset) ? <ContinentView borderData={continentDataset} /> : <p>Loading Dataset</p> }
    </>
  );
}

export default App;
