
- 2023/03/28
- [ECS Farget](https://catalog.us-east-1.prod.workshops.aws/workshops/4b59b9fb-48b6-461c-9377-907b2e33c9df/en-US/prerequisites/software)
- deploy Blue/Green Pipeline ECS on:
    - EC2
    - Farget
- 


```bash
### 處理好底下 env
export AWS_DEFAULT_REGION=ap-northeast-2
export AWS_REGION=ap-northeast-2
export AWS_ACCOUNT_ID=668363134003
echo $JAVA_HOME


### java11
### node14

npm install -g generator-jhipster@7.1
jhipster


### Build prod flag App (3~5 mins)
./gradlew bootWar -Pprod -Pwar
./gradlew.bat bootWar -Pprod -Pwar
# 生成 gradle/ && build/


### build image from gradle output
docker build -t tripmgmt .


### Test production release App locally
docker-compose -f src/main/docker/app.yml up

```
