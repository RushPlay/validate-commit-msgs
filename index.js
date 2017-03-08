#!/usr/bin/env node

const { exec } = require('child_process')
const chalk = require('chalk')
const meow = require('meow')
const validateMessage = require('validate-commit-msg')

if (require.main === module) {
  const cli = meow(`
    Usage
      $ validate-commit-msgs

    Options
      --base, -b  Base branch to compare with. Default is 'master'.

    Examples
      $ validate-commit-msgs
      $ validate-commit-msgs -b origin/master
  `, {
    alias: {
      b: 'base'
    }
  })

  exec('git rev-parse --abbrev-ref HEAD', (err, branch) => {
    if (err) {
      throw err
    }

    if (branch.trim() !== 'master') {
      const base = cli.flags.base || 'master'
      exec(`git log --pretty=format:%s ${base}..HEAD`, (err, result) => {
        if (err) {
          throw err
        }

        const invalidCommits = result.split('\n')
          .filter((commit) => {
            const valid = validateMessage(commit)

            if (valid) {
              console.log(chalk.green(`✔ ${commit}`))
            } else {
              console.log(chalk.red(`❌ ${commit}`))
            }

            return !valid
          })

        if (invalidCommits.length) {
          throw new Error('Some commits don’t match the format `type: message`')
        }
      })
    }
  })
}
