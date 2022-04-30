import React, { useEffect, useReducer, useState } from 'react';
import { GeoJSON } from 'geojson';
import { AppState, DispatchAction } from 'types/StateTypes';
import ContinentView from 'components/ContinentView';
import Selector from 'components/Selector';
import { Model } from 'types/Model';

function App () {
  // Setting up the app state
  const initAppState = {
    selectionType: null
  };

  const reducer = (state: AppState, action: DispatchAction) => {
    const updatedState = { ...state };
    if (action.type === 'update') {
      console.log('update');
    } else {
      // No keys found!
      console.error(`Key ${action.key} is not a valid key!`);
    }
    return updatedState;
  };
  const OPTIONS = ['one', 'two', 'three'];
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
        label='Select Language'
        selected={appState.selectionType}
        dispatch={dispatch}
        options={OPTIONS}
      />
    </>
  );
}

export default App;
