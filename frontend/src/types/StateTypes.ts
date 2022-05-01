// Type for app dispatch types
export type DispatchAction = {
  type: 'location' | 'subdivision' | 'location_clear',
  value: string,
};

// Current state of the application
export type AppState = {
  selectedRegion: string | null
  selectedSubdivision: string | null
};
