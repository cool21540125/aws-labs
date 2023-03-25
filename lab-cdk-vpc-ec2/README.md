

```bash
### Version
cdk --version
# 2.70.0 (build c13a0f1)


### Dependencies
npm i @aws-cdk/core @aws-cdk/aws-ec2 @aws-cdk/aws-iam @aws-cdk/aws-s3-assets


### gogo
cdk bootstrap aws://668363134003/ap-northeast-3

cdk synth
cdk deploy

cdk diff

cdk destroy
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
