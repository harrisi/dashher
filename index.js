const ohm = require('ohm-js')
const { readFileSync } = require('fs')
const { spawnSync } = require('child_process')

const args = process.argv.slice(1)
if (args.length !== 2) {
  console.error(`Usage: ${args[0]} <program>`)
  return
}

const contents = readFileSync('dashh.ohm', 'utf-8')
const myGrammar = ohm.grammar(contents)

const program = args[1]

const dashh = spawnSync(program, ['-h'])
const dashdashhelp = spawnSync(program, ['--help'])
const matcher = myGrammar.match(dashh.status === 0 ? dashh.stdout : dashdashhelp.stdout)

if (matcher.succeeded()) {
  console.log('success!')
} else {
  console.log('err!', matcher.message)
}
