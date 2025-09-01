pipeline {
  agent any
  stages {
    stage('Test kubeconfig') {
      steps {
        sh 'kubectl get nodes'
      }
    }
  }
}
