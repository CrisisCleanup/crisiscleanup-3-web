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
        stage('Deploy') {
            when {
              branch 'master'
            }
            steps {
                script {
                    withAWS(credentials:'aws-credentials') {
                        sh 'docker build . -t ccu-web'
                        sh 'docker run -e AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID} -e AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY} ccu-web'
                    }
                }
            }
        }
    }
}
