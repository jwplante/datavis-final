/***
 * CS573 Final Data preprocessor
 */
import { readFile, writeFile } from 'fs'
import { argv } from 'process'
import { randomUUID } from 'crypto';

/**
 * Reads the dataset as a string and outputs an object that represents the data model 
 * @param {string} data - The dataset as a string
 */
const parseFile = (data) => {
  const lines = data
                  .split('\n')
                  .map(s => s.split('\t'))
                  .slice(1)
                  .map(line => { return {id: randomUUID(), values: line} });
  
  // Create a list of languages
  const languageLeaves = lines.map(line => {
    const id = line.id
    const name = line.values[0]
    const family = line.values[1]
    const subdivision = line.values[2]
    const status = line.values[9]
    const parentName = line.values[3]
    return {id, name, family, status, subdivision, parentName}
  })

  // Check if the parent exists in the original list, else use the old id
  const languages = []
  for (const language of languageLeaves) {
    const newLang = {id: language.id, name: language.name, family: language.family, subdivision: language.subdivision, status: language.status, children: []}
    languages.push(newLang)

    // Check if the parent already exists, if not, create one
    if (language.parentName !== '') {
      const foundParent = languages.find(l => l.name === language.parentName)
      if (foundParent) {
        foundParent.children.push(newLang.id)
      } else {
        languages.push({id: randomUUID(), family: language.family, name: language.parentName, subdivision: language.subdivision, children: [language.id]})
      }
    }
  
  }

  const areas = lines.map(line => {
    const name = line.values[4]
    const language = line.id

    // Parse the locations first, then create the objects
    const latitudes = line.values[5].split(',').map(Number.parseFloat)
    const longitudes = line.values[6].split(',').map(Number.parseFloat)
    const radii = line.values[7].split(',').map(Number.parseFloat)
    const population = Number.parseInt(line.values[8])

    const locations = []
    for (let i = 0; i < latitudes.length; i++) {
      locations.push({latitude: latitudes[i], longitude: longitudes[i], radius: radii[i]})
    }

    return {name, language, locations, population}
  })


  const subdivisionNames = [ ... new Set(languages.map( l => l.subdivision))]
  const subdivisions = new Map([])
  
  for (const subdivision of subdivisionNames) {
    const allEntries = languages.filter(l => l.subdivision === subdivision).map(l => l.id)
    subdivisions.set(subdivision, {name: subdivision, languages: allEntries})
  }

  const familyNames = [ ... new Set(lines.map(line => line.values[1]))]
  const families = new Map([])
  
  for (const family of familyNames) {
    const allEntries = [... new Set(languages.filter(l => l.family === family).map(line => line.subdivision))]
    families.set(family, {name: family, allEntries})
  }

  return {families: [... families.values()], subdivisions: [... subdivisions.values()], languages, areas}
}

// Argument passing
if (argv.length >= 2) {
  // Read the tsv from the filesystem
  readFile(argv[2], 'utf-8', (err, data) => {
    if (err) throw err;
    const parsedData = parseFile(data)
    writeFile("languages.json", JSON.stringify(parsedData, null, 2), (err) => { if (err) throw err })
  })
} else {
  console.log("Usage: preprocess.js <filename>")
}