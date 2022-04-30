// Type for app dispatch types
export type DispatchAction = {
  type: 'location' | 'subdivision',
  value: string,
};

// Current state of the application
export type AppState = {
  selectionType: 'location' | 'subdivision' | 'language' | null
  selectedValue?: string
};
