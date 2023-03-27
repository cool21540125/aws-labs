
- 2023/03/25
- 2023/03/27 (改用 v2)
- cdk 
    - apigw -- trigger --> lambda -- operate --> S3
    - 作出個 Endpoint, 用來 上傳 & 查看 metadata & 刪除 S3 object
- 參考
    - https://docs.aws.amazon.com/cdk/v2/guide/serverless_example.html


```bash
cdk version
#2.70.0 (build c13a0f1)

### gogo
cdk bootstrap aws://668363134003/us-east-2 \
    --toolkit-stack-name CDKToolkit-ApiGatewayLambdaS3

cdk diff
cdk synth

cdk deploy --require-approval never

cdk destroy
```

----------------------------------------------------------------


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
