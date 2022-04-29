// Type for app dispatch types
export type DispatchAction = {
  type: 'update',
  key: string,
  value: object
};

// Current state of the application
export type AppState = {
  selectedLanguage: string | null
};