#!/usr/bin/env node

const { exec } = require('child_process')
const chalk = require('chalk')
const validateMessage = require('validate-commit-msg')

if (require.main === module) {
  exec('git rev-parse --abbrev-ref HEAD', (err, branch) => {
    if (err) {
      throw err
    }

    if (branch.trim() !== 'master') {
      exec('git log --pretty=format:%s master..HEAD', (err, result) => {
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
