'use strict'

const hogan = require('hogan.js')
const fs = require('fs')
const path = require('path')
const argv = require('yargs')
  .usage('Usage: readme path/to/package.json')
  .check(function (argv) {
    if (!argv._.length) throw new Error('A path to a valid package.json is required')
    return true
  })
  .argv

module.exports = () => {
  const pkgPath = path.resolve(process.cwd(), argv._[0])
  let pkg = null
  try {
    pkg = require(pkgPath)
  } catch (e) {
    console.error('Invalid JSON file: %s', pkgPath)
    process.exit()
  }

  let getDeps = deps => {
    return Object.keys(deps).map(depname => {
      let dep = require(path.resolve(path.dirname(argv._[0])) + '/node_modules/' + depname + '/package.json')
      dep.repository = 'https://ghub.io/' + depname
      return dep
    })
  }

  if (pkg.dependencies) pkg.depDetails = getDeps(pkg.dependencies)
  if (pkg.devDependencies) pkg.devDepDetails = getDeps(pkg.devDependencies)

  let templatePath = path.join(__dirname, 'README.template.md')
  let template = hogan.compile(fs.readFileSync(templatePath).toString())

  process.stdout.write(template.render(pkg))
}
