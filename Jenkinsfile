pipeline {
    agent any
    environment {
        DOCKER_CREDENTIALS_ID = 'dockeraccess'
        REPO_URL = 'https://github.com/tranquangthuan1211/app_service.git'
    }
    tools {
        nodejs "NodeJS_18" 
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
        stage('Skip Build (No Services Changed)') {
            when {
                not {
                    expression { return env.CHANGED_SERVICES?.trim() }
                }
            }
            steps {
                echo "No changed services detected. Skipping build and push."
            }
        }
        stage('Build & Push Changed Images') {
            when {
                expression { return env.CHANGED_SERVICES?.trim() }
            }
            steps {
                sh 'node -v'
                sh 'npm -v'
                script {
                    def commitId = sh(script: 'git rev-parse HEAD', returnStdout: true).trim().take(7)
                    def changedServices = env.CHANGED_SERVICES.split(',').findAll { it?.trim() }

                    // Ánh xạ service -> image name
                    def imageMap = [
                        'users': 'tqthuan2504/users-service',
                        'gateway': 'tqthuan2504/gateway-service',
                        'orders': 'tqthuan2504/orders-service',
                        'products': 'tqthuan2504/products-service'
                    ]

                    changedServices.each { service ->
                        def imageName = imageMap[service]
                        echo "Building and pushing image for: ${service} as ${imageName}"

                        dir(service) {
                            // Install dependencies & build Node.js app
                            sh "npm install"
                            sh "npm run build || echo 'No build script defined, skipping build'"

                            withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                                sh 'echo $DOCKER_PASSWORD | docker login --username $DOCKER_USERNAME --password-stdin'
                                sh "docker tag ${imageName} ${imageName}:${commitId}"
                                sh "docker push ${imageName}:${commitId}"
                                sh "docker push ${imageName}:latest"
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'This will always run'
        }
    }
}
