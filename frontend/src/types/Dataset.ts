
// Dataset Schema

// Type Location represents a circular region on a map of the Earth
export type Location = {
  latitude: number, // Valid range = [-180, 180]
  longitude: number, // Valid range = [-180, 180]
  radius: number // Radius in km
}

// Type Language represents a spoken language
export type Language = {
  name: string, // Name of the language
  locations: Location[], // Locations of regions where the language is spoken
  speakers: number, // Number of speakers
  parent: Language // field does not exist if no parent
}

// Type Subdivision represents a subdivision of languages
export type Subdivision = {
  name: string, // Name of subdivision
  languages: Language[] // List of languages that belong to the subdivision
}

// Type Dataset represents a subdivision of languages
export type Dataset = Subdivision[]
