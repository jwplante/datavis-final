import React, { useEffect, useReducer, useState } from 'react';
import { GeoJSON } from 'geojson';
import { AppState, DispatchAction } from 'types/StateTypes';
import ContinentView from 'components/ContinentView';
import Selector from 'components/Selector';

function App () {
  // Setting up the app state
  const initAppState = {
    selectedLanguage: null
  };

  const reducer = (state: AppState, action: DispatchAction) => {
    const updatedState = { ...state };
    if (action.type === 'update') {
      if (action.key === 'selectedLanguage' && typeof action.value === 'string') {
        updatedState.selectedLanguage = action.value;
      }
    } else {
      // No keys found!
      console.error(`Key ${action.key} is not a valid key!`);
    }
    return updatedState;
  };
  const OPTIONS = ['one', 'two', 'three'];
  const [continentDataset, setContinentDataset] = useState<GeoJSON | null>(null);
  const [appState, dispatch] = useReducer(reducer, initAppState);

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
      <span>{appState.selectedLanguage}</span>
      <Selector
        id='lang_selector'
        formKey='selectedLanguage'
        label='Select Language'
        selected={appState.selectedLanguage}
        dispatch={dispatch}
        options={OPTIONS}
      />
    </>
  );
}

export default App;
