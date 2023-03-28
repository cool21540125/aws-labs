
- 2023/03/28
- Ref
    - [D17-ASG](https://ithelp.ithome.com.tw/articles/10247274)
- Note
    - 使用 cdk 建立 ASG (launch )
    - 裏頭 VPC && SG 直接寫死 ID


```bash
cdk version
#2.70.0 (build c13a0f1)

### 首次部署的必要一次性操作(指定 AccountID && Region)
cdk bootstrap aws://668363134003/ap-northeast-2 \
    --toolkit-stack-name CDKToolkit-Asg

cdk diff
cdk synth

cdk deploy --require-approval never

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
