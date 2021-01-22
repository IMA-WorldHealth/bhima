pipeline {
  agent any
  tools {nodejs "latest"}

  environment {
    CHROME_OPTIONS = '--disable-dev-shm-usage --disable-extensions --no-sandbox'
  }

  stages {
    stage('preflight') {
      steps {
        echo sh(returnStdout: true, script: 'env')
        sh 'node -v'
        sh 'printenv'
      }
    }
    stage('build') {
      steps {
        sh 'yarn --version'
        sh 'git log --reverse -1'
        sh 'yarn'
        sh 'yarn build'
      }
    }
    stage('test') {
      steps {
        sh 'yarn test'
      }
    }
  }
}
