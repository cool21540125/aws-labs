
- 2023/03/24 (尚未成功, 卡在 S3Bucket 開不起來...)
- [cdk-StaticSite](https://ithelp.ithome.com.tw/articles/10241696)
- Reference
    - [@aws-cdk/aws-s3-deployment module](https://docs.aws.amazon.com/cdk/api/v1/docs/aws-s3-deployment-readme.html)
    - [d8-部署靜態網頁(寫的有點跳)](https://ithelp.ithome.com.tw/articles/10241696)

```bash
### Dependencies
npm install @aws-cdk/{aws-s3,aws-s3-deployment,aws-certificatemanager,aws-cloudfront,core}


### 
cdk bootstrap aws://152248006875/us-east-1

### 
cdk deploy


### Delete~
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
