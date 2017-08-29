#!/usr/bin/env node

const { exec } = require('child_process')
const chalk = require('chalk')
const meow = require('meow')
const validateMessage = require('validate-commit-msg')

function parseCommitString(string) {
  const matches = string.match(/^(\w+)\s(.+)$/)
  return {
    sha: matches[1],
    message: matches[2],
  }
}

if (require.main === module) {
  const cli = meow(`
    Usage
      $ validate-commit-msgs

    Options
      --base, -b     Base branch to compare with. Default is 'master'.
      --print-valid  Print valid commit messages

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
      exec(`git log --no-merges --pretty=format:"%h %s" ${base}..HEAD`, (err, result) => {
        if (err) {
          throw err
        }

        const invalidCommits = result.split('\n')
          .map(parseCommitString)
          .filter((commit) => {
            const valid = validateMessage(commit.message)

            if (valid) {
              if (cli.flags.printValid) {
                console.log(chalk.green(`✔ ${commit.message}\n`))
              }
            } else {
              console.log(chalk.red(`✖ SHA: ${commit.sha}\n`))
            }

            return !valid
          })

        if (invalidCommits.length) {
          process.exit(1)
        }
      })
    }
  })
}
