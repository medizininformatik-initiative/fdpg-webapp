const fs = require('fs/promises')
const path = require('path')
const PublicGoogleSheetsParser = require('public-google-sheets-parser')

/**
 * This ID can be extracted from the Google Docs URL
 * https://docs.google.com/spreadsheets/d/1LdXRWTpKVwk8Zgfzb4467hIbOqvIr5TIIv5zjYCz1fA
 * Duplicate it via "File -> Make a copy" and make it accessible to "Anyone with the link"
 * When adding a new category add the sheet name into the 'index' sheet
 */
const SPREADSHEET_ID = '1LdXRWTpKVwk8Zgfzb4467hIbOqvIr5TIIv5zjYCz1fA'
const OUTPUT_PATH = path.resolve(__dirname, '../locales')

const getSheet = (spreadsheetId, sheetName) => {
  const parser = new PublicGoogleSheetsParser(spreadsheetId, sheetName)
  return parser.parse()
}

const buildLangFiles = async () => {
  const indexSheet = await getSheet(SPREADSHEET_ID)

  // => ["general", "errors", ...]
  const sheetNames = indexSheet.map((row) => row.sheetName)

  // => [{ "general": Sheet }, { "errors": Sheet }]
  const sheetsResult = await Promise.all(
    sheetNames.map(async (sheetName) => ({
      [sheetName]: await getSheet(SPREADSHEET_ID, sheetName),
    })),
  )

  // => { "general": Sheet, "errors": Sheet }
  // => { "general": [{ "key": "book", "de-DE": "Buch", "en-EN": "book" }], ... }
  const categories = sheetsResult.reduce((acc, cur) => ({ ...acc, ...cur }), {})

  // collects all the keys found in those sheets and filters out the "key"
  // => [ 'de-DE', 'en-EN' ]
  const languages = Object.keys(
    // => { key: 'german', 'de-DE': 'Deutsch', 'en-EN': 'German' }
    Object.values(categories).reduce(
      (acc, cur) => ({
        ...acc,
        ...cur.reduce((acc2, cur2) => ({ ...cur2, ...acc2 })),
      }),
      {},
    ),
  ).filter((key) => key !== 'key')

  console.info(`languages: ${languages}`)

  const getLocale = (language) =>
    Object.entries(categories).reduce(
      (acc, [category, sheet]) => ({
        ...acc,
        ...sheet.reduce(
          (acc2, row) => ({
            ...acc2,
            [category]: {
              ...acc2[category],
              [row.key]: row[language],
            },
          }),
          {},
        ),
      }),
      {},
    )

  await Promise.all(
    languages.map(async (language) => {
      const locale = getLocale(language)
      const fileName = `${OUTPUT_PATH}/${language}.json`
      await fs.writeFile(fileName, JSON.stringify(locale))
      console.info(`wrote: ${fileName}`)
    }),
  )
}

buildLangFiles()
