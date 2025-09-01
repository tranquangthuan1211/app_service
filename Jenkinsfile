pipeline {
    agent any
    environment {
        DOCKER_CREDENTIALS_ID = 'dockeraccess'
        REPO_URL = 'https://github.com/tranquangthuan1211/app_service.git'
        KUBECONFIG = "/etc/rancher/k3s/k3s.yaml"
        IMAGE_PUSH = ""
        TAG = ""
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
                    env.TAG = commitId
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
                        env.IMAGE_PUSH = imageName
                        echo "Building and pushing image for: ${service} as ${imageName}"

                        dir(service) {
                            sh "npm install"
                            sh "npm run build || echo 'No build script defined, skipping build'"

                            withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                                sh 'echo $DOCKER_PASSWORD | docker login --username $DOCKER_USERNAME --password-stdin'

                                sh "docker build -t ${imageName}:latest ."

                                sh "docker tag ${imageName}:latest ${imageName}:${commitId}"

                                sh "docker push ${imageName}:${commitId}"
                                sh "docker push ${imageName}:latest"
                            }
                        }
                    }
                }
            }
        }
        stage('Update Helm values') {
            steps {
                script {
                    def changedServices = env.CHANGED_SERVICES.split(',').findAll { it?.trim() }
                    sh "yq e -i '.*.enabled = false' ./chart-helm/pet-service/values.yaml"
                    echo "${changedServices}"
                    changedServices.each { svc ->
                        sh """
                        yq e -i '.${svc}.enabled = true' ./chart-helm/pet-service/values.yaml
                        yq e -i '.${svc}.image.tag = "${TAG}"' ./chart-helm/pet-service/values.yaml
                        yq e -i '.${svc}.ingress.enabled = true' ./chart-helm/pet-service/values.yaml
                        """
                    }
                }
            }
        }
        stage('Lint Helm Chart') {
            steps {
                sh 'yq --version'
                script {
                    // Lấy danh sách service có enabled = true
                    def enabledServices = sh(
                        script: '''
                        for key in $(yq e 'keys | .[]' ./chart-helm/pet-service/values.yaml); do
                            if [ "$(yq e .${key}.enabled ./chart-helm/pet-service/values.yaml)" = "true" ]; then
                            echo ${key}
                            fi
                        done
                        ''',
                        returnStdout: true
                    ).trim().split("\n")

                    echo "✅ Services enabled: ${enabledServices}"
                }
            }
        }
        stage('Deploy Helm Chart') {
            when {
                expression { return env.CHANGED_SERVICES?.trim() }
            }
            steps {
                sh """
                helm dependency update ./chart-helm/pet-service
                helm template pet-service ./chart-helm/pet-service -f ./chart-helm/pet-service/values.yaml
                helm upgrade --install pet-service ./chart-helm/pet-service -f ./chart-helm/pet-service/values.yaml -n deployment
                """
            }
        }
    }

    post {
        always {
            echo 'This will always run'
        }
    }
}
