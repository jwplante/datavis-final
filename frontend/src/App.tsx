import React, { useEffect, useReducer, useState } from 'react';
import { GeoJSON } from 'geojson';
import { AppState, DispatchAction } from 'types/StateTypes';
import ContinentView from 'components/ContinentView';
import Selector from 'components/Selector';
import { Model } from 'types/Model';

function App () {
  // Setting up the app state
  const initAppState = {
    selectedRegion: null,
    selectedSubdivision: null
  };

  const reducer = (state: AppState, action: DispatchAction) => {
    const updatedState = { ...state };
    if (action.type === 'location') {
      updatedState.selectedRegion = action.value;
    } else if (action.type === 'subdivision') {
      updatedState.selectedSubdivision = action.value;
    } else {
      // No keys found!
      console.error(`Key ${action.type} is not a valid operation!`);
    }
    return updatedState;
  };
  const [continentDataset, setContinentDataset] = useState<GeoJSON | null>(null);
  const [locationDataset, setLocationDataset] = useState<Model | null>(null);
  const [appState, dispatch] = useReducer(reducer, initAppState);

  useEffect(() => {
    // Grab the dataset from the local server
    fetch('http://localhost:8000/data/map.geo.json')
      .then(res => {
        return res.json();
      })
      .then(data => {
        // Filter the data
        fetch('http://localhost:8000/data/languages.json')
          .then(res => {
            return res.json();
          })
          .then(locationData => {
            console.log(locationData);
            setContinentDataset(data);
            setLocationDataset(locationData);
          });
      })
      .catch(err => console.log(`Data could not be loaded! Error: ${err}`));
  }, []);

  return (
    <>
      { (continentDataset && locationDataset) ? <ContinentView borderData={continentDataset} dataModel={locationDataset} dispatch={dispatch}/> : <p>Loading Dataset</p> }
      <Selector
        id='lang_selector'
        formKey='selectedLanguage'
        label='Select '
        selected={appState.selectedSubdivision}
        dispatch={dispatch}
        options={(() => {
          if (locationDataset) {
            const subdivisions = locationDataset?.areas
              // Filter the list based on location
              .filter(area => appState.selectedRegion ? area.name === appState.selectedRegion : true)
              // For every language, get all subdivision names
              .flatMap(area => area.languages)
              .map(areaLanguage => {
                const language = locationDataset.languages.find(e => e.name === areaLanguage.id);
                return language ? language.subdivision : 'none';
              });
            return [...new Set(subdivisions)].filter(elt => elt !== 'none');
          } else {
            return [];
          }
        })()}
      />
    </>
  );
}

export default App;
