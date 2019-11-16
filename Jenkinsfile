pipeline {
    agent { label 'docker' }
    environment {
        REPOSITORY_NAME = 'ccu-web'
    }
    options { disableConcurrentBuilds() }
    stages {
        stage('Test') {
            steps {
                echo "Running Tests: ${env.BUILD_ID} on ${env.JENKINS_URL}"
            }
        }
        stage('Build') {
            steps {
                script {
                    sh 'vue-cli-service build --mode staging'
                }
            }
        }
        stage('Deploy') {
            when {
              branch 'master'
            }
            steps {
                script {
                    withAWS(credentials:'aws-credentials') {
                        sh 'vue-cli-service s3-deploy'
                    }
                }
            }
        }
    }
}
