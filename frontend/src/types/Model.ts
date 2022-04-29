/* eslint-disable no-unused-vars */

export interface AreaLanguage {
  latitude: number;
  longitude: number;
  radius: number;
  population: number;
  id: string;
}

export interface Area {
  name: string;
  languages: AreaLanguage[];
}

export interface Family {
  name: string;
  allEntries: string[];
}

export enum Status {
  CriticallyEndangered = 'critically endangered',
  Disputed = 'disputed',
  Empty = '',
  Endangered = 'endangered',
  SeverelyEndangered = 'severely endangered',
  SeverlyEndangered = 'severly endangered',
}

export interface Language {
  id: string;
  name: string;
  family: string;
  subdivision: string;
  status?: Status;
  children: string[];
}

export interface Reglink {
  source: string;
  target: string;
}

export interface Subdivision {
  name: string;
  languages: string[];
}

export interface Model {
  families: Family[];
  subdivisions: Subdivision[];
  languages: Language[];
  reglink: Reglink[];
  areas: Area[];
}
