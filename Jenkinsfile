pipeline {
    agent any
    environment {
        DOCKER_CREDENTIALS_ID = 'dockeraccess'
        REPO_URL = 'https://github.com/tranquangthuan1211/app_service.git'
    }
    parameters {
        string(name: 'BRANCH_NAME', defaultValue: 'main', description: 'Branch to build')
    }
    stages {
        stage('checkout') {
            steps {
                git branch: "${params.BRANCH_NAME}", url: "${REPO_URL}"
            }
        }
        stage('Detect Changed Services') {
            steps {
                script {
                    def prevCommit = sh(script: 'git rev-parse HEAD^ || git rev-parse HEAD', returnStdout: true).trim()
                    def changedFiles = sh(script: "git diff --name-only ${prevCommit} HEAD", returnStdout: true).trim().split("\n")

                    def services = [
                        'gateway',
                        'users',
                        'products',
                        'orders'
                    ]

                    def changedServices = services.findAll { service ->
                        changedFiles.any { it.startsWith("${service}/") }
                    }

                    echo "Changed services: ${changedServices}"
                    env.CHANGED_SERVICES = changedServices.join(',')
                }
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying...'
            }
        }
    }

    post {
        always {
            echo 'This will always run'
        }
    }
}
