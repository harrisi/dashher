#!/usr/bin/env node

const ohm = require('ohm-js')
const { Command } = require('commander')
const dashherCommand = new Command()
const { readFileSync } = require('fs')
const { spawnSync } = require('child_process')

let program, report = [], options

dashherCommand
  .version(require('./package').version, '-v, --version')

dashherCommand
  .argument('<program>', 'program to test')
  .action(p => {
    program = p
    options = dashherCommand.opts()
  })

dashherCommand
  .option('-e, --equivalent', 'require -h and --help output to be identical', true)
  .option('-g, --grammar [grammarFile]', 'provide custom grammar file', 'dashh.ohm')
  .option('--optional-bugs', 'bugs section required')
  .option('-V, --verbose', 'provide verbose output')

dashherCommand
  .configureHelp({
    sortSubcommands: true,
    sortOptions: true,
    helpWidth: 80,
  })
  .showHelpAfterError('(try with -h or --help)')
  .showSuggestionAfterError()

dashherCommand.parse(process.argv)

const contents = readFileSync(options.grammar, 'utf-8')
const myGrammar = ohm.grammar(contents)

const finalGrammar = ohm.grammar(`
  DashHFinal <: DashH {
    Sections =
      Usage
      Options
      Bugs${options.optionalBugs ? '?' : ''}
  }`, {DashH: myGrammar})

const dashh = spawnSync(program, ['-h'])
const dashdashhelp = spawnSync(program, ['--help'])

if (options.equivalent) {
  let equivalent = Buffer.compare(dashh.stdout, dashdashhelp.stdout) === 0
  report.push(function() {
    return ({ equivalent })
  })
}

report.push(function() {
  let matcher = finalGrammar.match(
    dashh.status === 0 ? dashh.stdout : dashdashhelp.stdout,
    'Sections')
  return ({
    parsed: matcher.succeeded()
  })
})

if (options.verbose) {
  for (let [_, res] of Object.entries(report.map(e => e()))) {
    console.log(res)
  }
}

console.log(
  report.every(e => Object.values(e())[0])
  ? 'success!'
  : 'failure!'
)
