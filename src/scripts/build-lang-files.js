// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')

function writeFileSyncRecursive(filename, content, charset) {
  // -- normalize path separator to '/' instead of path.sep,
  // -- as / works in node for Windows as well, and mixed \\ and / can appear in the path
  let filepath = filename.replace(/\\/g, '/')

  // -- preparation to allow absolute paths as well
  let root = ''
  if (filepath[0] === '/') {
    root = '/'
    filepath = filepath.slice(1)
  } else if (filepath[1] === ':') {
    root = filepath.slice(0, 3) // c:\
    filepath = filepath.slice(3)
  }

  // -- create folders all the way down
  const folders = filepath.split('/').slice(0, -1) // remove last item, file
  folders.reduce(
    (acc, folder) => {
      const folderPath = `${acc + folder}/`
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath)
      }
      return folderPath
    },
    root, // first 'acc', important
  )

  // -- write file
  fs.writeFileSync(root + filepath, content, charset)
}

function parseSource(data) {
  const tabsName = Object.keys(data)
  const detectedLanguages = Object.keys(data[tabsName[0]][Object.keys(data[tabsName[0]])[0]])

  detectedLanguages.forEach((language) => {
    const messages = tabsName.reduce((acc, tabName) => {
      if (!(tabName in acc)) {
        acc[tabName] = {}
      }

      Object.keys(data[tabName]).forEach((key) => {
        acc[tabName][key] = data[tabName][key][language]?.replace(/\\n/g, '\n') ?? ''
      })

      return acc
    }, {})

    const fileContent = JSON.stringify(messages)
    writeFileSyncRecursive(`./src/locales/${language.toLocaleLowerCase()}.json`, fileContent)
  })
}

// The export file must be placed at this location : src/assets/
fs.readFile('./src/assets/locales/i18n.json', (err, data) => {
  if (err) throw err
  parseSource(JSON.parse(data))
})
