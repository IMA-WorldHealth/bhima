pipeline {
  agent any
  tools {nodejs "latest"}

  environment {
    CHROME_OPTIONS = '--disable-dev-shm-usage --disable-extensions --no-sandbox'
    NODE_ENV = 'development'
  }

  stages {
    stage('preflight') {
      steps {
        echo sh(returnStdout: true, script: 'env')
        sh 'node -v'
        sh 'printenv'
      }
    }

    stage('pull') {
      steps {
        sh 'yarn --version'
        sh 'git log --reverse -1'
      }
    }

    stage('deps') {
      steps {
        sh 'yarn'
        sh 'cp .env.sample .env'
      }
    }

    stage('build') {
      steps {
        sh 'yarn build'
      }
    }

    stage('test') {
      steps {
        sh 'echo "Running tests...."'
        sh 'yarn test'
      }
    }
  }
}
