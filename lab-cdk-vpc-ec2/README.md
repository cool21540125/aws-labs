
- 2024/01/01
- cdk 建立 VPC && subnet && EC2, 並可藉由 SSM login
    - EC2 需給 SSM 必要的 role 以後, 即可由 SSM 做 ssh loggin
        - [use SSM ssh login EC2](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html) 來操作
        - 本地端登入 `aws ssm start-session --target ${InstanceID}`
- Ref:
    - [cdk-EC2](https://ithelp.ithome.com.tw/articles/10243374)
    - [cdk-EC2 with SSM](https://ithelp.ithome.com.tw/articles/10243406)
    - [cdk deploy-webapp-ec2](https://aws.amazon.com/tw/getting-started/guides/deploy-webapp-ec2/module-one/)


```bash
### Version
cdk --version
# 2.134.0 (build 265d769)


### gogo
cdk bootstrap
cdk build

cdk synth
cdk deploy

cdk diff

cdk destroy
```
