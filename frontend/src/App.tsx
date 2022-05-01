import React, { useEffect, useReducer, useState } from 'react';
import { GeoJSON } from 'geojson';
import { Model } from 'types/Model';
import { AppState, DispatchAction } from 'types/StateTypes';
import ContinentView from 'components/ContinentView';
import Selector from 'components/Selector';
import NetworkView from 'components/NetworkView';
import AboutMenu from 'components/AboutMenu';
import { AppBar, Box, Button, Grid, Paper, Toolbar, Typography } from '@mui/material';

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
      updatedState.selectedSubdivision = null;
    } else if (action.type === 'subdivision') {
      updatedState.selectedSubdivision = action.value;
    } else {
      // No keys found!
      console.error(`Key ${action.type} is not a valid operation!`);
    }
    return updatedState;
  };

  // Program state
  const [continentDataset, setContinentDataset] = useState<GeoJSON | null>(null);
  const [locationDataset, setLocationDataset] = useState<Model | null>(null);
  const [appState, dispatch] = useReducer(reducer, initAppState);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    // Grab the dataset from the local server
    fetch('data/map.geo.json')
      .then(res => {
        return res.json();
      })
      .then(data => {
        // Filter the data
        fetch('data/languages.json')
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
      <AboutMenu open={aboutOpen} closeMenu={() => setAboutOpen(false)} />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position='static'>
          <Toolbar>
            <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
              Language Explorer
            </Typography>
            <Button color='inherit' onClick={() => setAboutOpen(true)}>About</Button>
          </Toolbar>
        </AppBar>
      </Box>
      <Box component='div' sx={ { display: 'flex', alignItems: 'stretch', margin: '1em' } }>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper elevation={2}>
              <Typography variant="h3" gutterBottom component="div" sx={ { margin: '5px' } }>
                Select Location and Subdivision
              </Typography>
              { (continentDataset && locationDataset) ? <ContinentView borderData={continentDataset} dataModel={locationDataset} dispatch={dispatch}/> : <p>Loading Dataset</p> }
              <Selector
                id='lang_selector'
                formKey='subdivision'
                label='Select Subdivision'
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
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper elevation={2}>
              <Typography variant="h3" gutterBottom component="div" sx={ { margin: '5px' } }>
                Explore Filtered Languages
              </Typography>
              { (continentDataset && locationDataset) ? <NetworkView dataModel={locationDataset} appState={appState}/> : <p></p> }
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default App;
