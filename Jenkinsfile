pipeline {
  agent any
  post {
    always {
      echo "Cleaning up Docker images..."
      sh 'docker system prune -f || true'
    }
  }
}