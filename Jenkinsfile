pipeline {
  agent any

  environment {
    IMAGE_NAME = "splitdeal-app"
    CONTAINER_PORT = "3000"
  }

  stages {

    stage('Clone Repository') {
      steps {
        git branch: 'main', url: 'https://github.com/225108954/SIT726-SplitDeal-Jenkins.git'
      }
    }

    stage('Generate .env file') {
      steps {
        bat '''
          echo MONGODB_URI=mongodb+srv://joseph:test@cluster0.ifmar.mongodb.net/project-splitdeal?retryWrites=true^&w=majority^&appName=Cluster0 > .env
          echo PORT=3000 >> .env
          echo JWT_SECRET=$$#$$ >> .env
          echo SMTP_HOST=smtp.gmail.com >> .env
          echo SMTP_PORT=465 >> .env
          echo SMTP_USER=gauravspamm@gmail.com >> .env
          echo SMTP_PASS=hfvgmywrhapyqovw >> .env
          echo SMTP_FROM="Gaurav Myana <gauravspamm@gmail.com>" >> .env
          echo FRONTEND_URL=https://yourapp.com >> .env
        '''
      }
    }

    stage('Build Docker Image') {
      steps {
        bat 'docker build -t %IMAGE_NAME% .'
      }
    }

    stage('Run Tests') {
      steps {
        bat 'npm install'
        bat 'npm run test-backend:unit'
        bat 'npm run test-backend:e2e'
      }
    }

    stage('Code Quality') {
      steps {
        bat 'npm run coverage'
        bat '''
          docker run --rm ^
            -e SONAR_HOST_URL=http://host.docker.internal:9000 ^
            -e SONAR_TOKEN=sqa_8dccf7cd27f4b1bdbb348594724edb866b253005 ^
            -v "C:\\ProgramData\\Jenkins\\.jenkins\\workspace\\7.3HD DevOps Pipeline with Jenkins:/usr/src" ^
            sonarsource/sonar-scanner-cli:latest ^
            -Dsonar.projectKey=SplitDeal-753-7.3HD ^
            -Dsonar.sources=src ^
            -Dsonar.tests=backend-test ^
            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
        '''
      }
    }

    stage('Security Audit') {
      steps {
        bat 'echo Running security audit...'
        bat 'npm audit --audit-level=high || exit /b 0'
        bat '''
          echo Running Snyk test on Node dependencies...
          docker run --rm ^
            -e SNYK_TOKEN=456a813e-11d9-49fb-a4d7-4f2f554b118b ^
            -v "%cd%":/project ^
            -w /project ^
            snyk/snyk:docker snyk test || exit /b 0

          echo Running Snyk scan on Docker image...
          docker run --rm ^
            -e SNYK_TOKEN=456a813e-11d9-49fb-a4d7-4f2f554b118b ^
            -v /var/run/docker.sock:/var/run/docker.sock ^
            snyk/snyk:docker snyk container test %IMAGE_NAME% || exit /b 0
        '''
      }
    }

    stage('Deploy to Local Docker') {
      steps {
        bat 'docker run -d --name splitdeal-container -p 3000:3000 --env-file .env %IMAGE_NAME%'
        bat 'docker-compose -f docker-compose.yml up -d'
      }
    }

    stage('Release Tag') {
      steps {
        bat 'git config --global user.email "s225108954@deakin.edu.au"'
        bat 'git config --global user.name "225108954"'
        bat 'git remote set-url origin https://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@github.com/225108954/SIT726-SplitDeal-Jenkins.git'
        bat 'git tag v1.0.%BUILD_NUMBER%'
        bat 'git push origin v1.0.%BUILD_NUMBER%'
      }
    }

    stage('Monitoring') {
      steps {
        bat 'node health-check.js'
        bat '''
          docker run -d --name dd-agent ^
            -e DD_API_KEY=dd68dd181db4c3e574cb91afa3013341 ^
            -e DD_SITE="us5.datadoghq.com" ^
            -e DD_DOGSTATSD_NON_LOCAL_TRAFFIC=true ^
            -e DD_ENV=dev ^
            -v /var/run/docker.sock:/var/run/docker.sock:ro ^
            -v /proc/:/host/proc/:ro ^
            -v /sys/fs/cgroup/:/host/sys/fs/cgroup:ro ^
            -v /var/lib/docker/containers:/var/lib/docker/containers:ro ^
            gcr.io/datadoghq/agent:7
        '''
      }
    }

  }
}
