pipeline {
  agent {
    docker { image 'node:latest' }
  }

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
}
