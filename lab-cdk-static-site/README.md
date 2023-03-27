
- 2023/03/24
- 2023/03/27 (改為 v2)
- [cdk-StaticSite](https://ithelp.ithome.com.tw/articles/10241696)
- Reference
    - [@aws-cdk/aws-s3-deployment module](https://docs.aws.amazon.com/cdk/api/v1/docs/aws-s3-deployment-readme.html)
    - [d8-部署靜態網頁(寫的有點跳)](https://ithelp.ithome.com.tw/articles/10241696)
- StaticSite (CloudFront && Certification)
    - us-east-1
        - [DNS validation](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_certificatemanager-readme.html#dns-validation)
    - us-east-1 以外
        - [Cross-region Certificates](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_certificatemanager-readme.html#cross-region-certificates)
- 讀取自已存在的 ACM Cert
    - [Example](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-certificatemanager.Certificate.html#example)

```bash
cdk --version
#2.70.0 (build c13a0f1)

cdk bootstrap aws://152248006875/us-east-1 \
    --toolkit-stack-name CDKToolkit-StaticSite

cdk diff
cdk synth
cdk deploy --require-approval never


### Lab 清除以前, 需要先清空 Bucket
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
