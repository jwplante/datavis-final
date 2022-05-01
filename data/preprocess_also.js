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
   const schema = JSON.parse(data)
   // Fix the area languages schema
   schema.areas = schema.areas.map(area => {
      const areaCopy = {...area};

      areaCopy.languages = areaCopy.languages.flatMap(d => {
        const languageNames = Object.keys(d);
        const locations = d[languageNames[0]].map((d, i) => { return { ...d, id: languageNames[0] }; });
        return locations;
      })
      return areaCopy
   })

   // Remove references to ID in the subdivisions, replace with name field
   schema.subdivisions = schema.subdivisions.map(subdivision => {
      const subdivisionCopy = {...subdivision}
      subdivisionCopy.languages = subdivisionCopy.languages.map(languageID => {
        const languageName = schema.languages.find((language) => language.id === languageID).name
        return languageName
     })
     console.log(subdivisionCopy)
     return subdivisionCopy
   })
   return schema
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