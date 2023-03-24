
- 2023/03/23
- 使用 CDK 建構出 `SNS` && `SQS` && `SNS-Subscription`
    - [Chap4](https://ithelp.ithome.com.tw/articles/10239592)
    - [Chap5](https://ithelp.ithome.com.tw/articles/10240171)


```bash
### cdk Version
cdk --version
#2.65.0 (build 5862f7a)


### Install dependencies
npm i @aws-cdk/aws-sns @aws-cdk/aws-sns-subscriptions @aws-cdk/aws-sqs @aws-cdk/core


### 首次部署的必要一次性操作(指定 AccountID && Region)
cdk bootstrap aws://668363134003/ap-northeast-3


### 查看目前 cdk 產出的 template (會輸出到 cdk.out/)
cdk synth


### 比對 current cdk state 與 actual CloudFormation stack state
cdk diff


### 部署到 CloudFormation Stack
cdk deploy
# 嘗試了幾次, 似乎無法正常的使用 --region xx 來指定


### 
cdk destroy
```

------------------------------------------------------------

# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
