- 2023/03/24 (begin)
- 2023/03/27 (改為 v2 用法)
- 使用 CDK 建構出 `SNS` && `SQS` && `SNS-Subscription`
  - [Chap4](https://ithelp.ithome.com.tw/articles/10239592)
  - [Chap5](https://ithelp.ithome.com.tw/articles/10240171)
- 使用 CDK 以外, 以存在的 Cert(us-east-1 ARN) && Hosted Zone

```bash
cdk --version
#2.70.0 (build c13a0f1)


### 首次部署的必要一次性操作(指定 AccountID && Region)
cdk bootstrap aws://123456789012/ap-northeast-3\
    --toolkit-stack-name $CDK_NAME \
    --bootstrap-vpc-id $VPC_ID


### 查看目前 cdk 產出的 template (會輸出到 cdk.out/)
cdk synth


### 比對 current cdk state 與 actual CloudFormation stack state
cdk diff


### 部署到 CloudFormation Stack
cdk deploy
# or
cdk deploy --require-approval never


###
cdk destroy
```

---

# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
