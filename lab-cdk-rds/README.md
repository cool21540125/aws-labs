

- 2023/03/27
- 使用 cdk 來 RDS
- RDS 不可忽視的重點
    - `cdk deploy` 以前, 一定要 `cdk diff`
    - RDS 更改屬性的話, 極有可能會 rebuild instance!!
    - RDS 砍掉以後, 會有 snapshot, 若確定無用要去砍掉!!
    - RDS 的 建立/砍掉 會花很久的時間~~~~ Orz....
- 參考
    - [D18-RDS](https://ithelp.ithome.com.tw/articles/10247962)
    - 實作上, 會從 env 取得 MySQL 密碼, 需要先設定 `export dbPassword=xxx` 再做 `cdk deploy`

```bash
cdk version
#2.70.0 (build c13a0f1)

### 首次部署的必要一次性操作(指定 AccountID && Region)
cdk bootstrap aws://668363134003/ap-northeast-2 \
    --toolkit-stack-name CDKToolkit-RDS

cdk diff
cdk synth

export dbPassword='mysql_password'
cdk deploy --require-approval never

cdk destroy
```

---------------------------------------------------------------------


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
