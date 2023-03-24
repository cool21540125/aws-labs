
- 2023/03/24
- 使用 cdk 來 deploy `API Gateway` && `Lambda`
    - 須額外配好 Route53 解析, a 到 APIGW
    - 裡頭 APIGW 有使用 custom domain(我不是很懂)
    - 此外也有用到 ACM, 但需要用與此 Stack 相同 Region 的 certs 才行
        - 我有嘗試使用 已經在使用的 us-east-1 的 cert, 不過失敗 (原因沒詳查)
- 參考
    - [D6 - cdk deploy Lambda & APIGW](https://ithelp.ithome.com.tw/articles/10240180)
    - [cdk-LambdaRestApi](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigateway.LambdaRestApi.html)

```bash
### Install dependencies
npm i @aws-cdk/core @aws-cdk/aws-lambda
npm i @aws-cdk/aws-apigateway
npm i @aws-cdk/aws-certificatemanager


### 首次部署的必要一次性操作(指定 AccountID && Region)
cdk bootstrap aws://152248006875/us-east-2


### 
cdk deploy
```


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
