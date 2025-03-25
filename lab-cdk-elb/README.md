- 2023/03/25
- 2023/03/27 (改為 v2)
- cdk 建出 ELB
  - EC2 註冊在 TG 內, 僅能允許由 ELB_SG 近來 80
    - 22 port 則是 0.0.0.0/0
- Ref
  - https://ithelp.ithome.com.tw/articles/10245340

```bash
cdk --version
# 2.70.0 (build c13a0f1)

### gogo
cdk bootstrap aws://123456789012/ap-northeast-3 \
    --toolkit-stack-name CDKToolkit-ELB

cdk diff
cdk synth
cdk deploy --require-approval never

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
