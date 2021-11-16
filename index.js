#!/usr/bin/env node

const ohm = require('ohm-js')
const { Command } = require('commander')
const dashherCommand = new Command()
const { readFileSync } = require('fs')
const { spawnSync } = require('child_process')

let program

dashherCommand
  .version(require('./package').version, '-v, --version')

dashherCommand
  .argument('<program>', 'program to test')
  .action(p => {
    program = p
  })

dashherCommand
  .option('-g, --grammar [grammarFile]', 'provide custom grammar file', 'dashh.ohm')
  .option('--optional-bugs', 'bugs section required', false)

dashherCommand
  .configureHelp({
    sortSubcommands: true,
    sortOptions: true,
    helpWidth: 80,
  })
  .showHelpAfterError('(try with -h or --help)')
  .showSuggestionAfterError()

dashherCommand.parse(process.argv)

const options = dashherCommand.opts()

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
const matcher = finalGrammar.match(dashh.status === 0 ? dashh.stdout : dashdashhelp.stdout, 'Sections')

if (matcher.succeeded()) {
  console.log('success!')
} else {
  console.log('err!', matcher.message)
}
