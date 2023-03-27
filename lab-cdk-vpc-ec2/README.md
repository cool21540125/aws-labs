
- 2023/03/25
- 2023/03/27 (改為 cdk v2)
- 參考:
    - [cdk-EC2](https://ithelp.ithome.com.tw/articles/10243374)
    - [cdk-EC2 with SSM](https://ithelp.ithome.com.tw/articles/10243406)
    - [cdk deploy-webapp-ec2](https://aws.amazon.com/tw/getting-started/guides/deploy-webapp-ec2/module-one/)
- 使用 cdk 建立 VPC && subnet, 以及一台 EC2, 並可藉由 SSM login
- 另一個比較有趣的事情是, EC2 給 SSM 必要的 role 以後, 即可由 SSM 做 ssh loggin
    - 此外也可參考 [use SSM ssh login EC2](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html) 來操作 本地端登入 `aws ssm start-session --target ${InstanceID}`


```bash
### Version
cdk --version
# 2.70.0 (build c13a0f1)


### gogo
cdk bootstrap aws://668363134003/ap-northeast-3 \
    --toolkit-stack-name CDKToolkit-VpcEc2

cdk synth
cdk deploy

cdk diff

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
