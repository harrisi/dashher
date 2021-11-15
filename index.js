#!/usr/bin/env node

const ohm = require('ohm-js')
const { Command } = require('commander')
const dashherCommand = new Command()
const { readFileSync } = require('fs')
const { spawnSync } = require('child_process')

let program

dashherCommand
  .version('0.0.1', '-v, --version')
  .argument('<program>', 'program to test')
  .action(p => {
    program = p
  })
  .configureHelp({
    sortSubcommands: true,
    sortOptions: true,
    helpWidth: 80,
  })
  .showHelpAfterError('(try with -h or --help)')
  .showSuggestionAfterError()

dashherCommand.parse(process.argv)

const contents = readFileSync('dashh.ohm', 'utf-8')
const myGrammar = ohm.grammar(contents)

const dashh = spawnSync(program, ['-h'])
const dashdashhelp = spawnSync(program, ['--help'])
const matcher = myGrammar.match(dashh.status === 0 ? dashh.stdout : dashdashhelp.stdout)

if (matcher.succeeded()) {
  console.log('success!')
} else {
  console.log('err!', matcher.message)
}
