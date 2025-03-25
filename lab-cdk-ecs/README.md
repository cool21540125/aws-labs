- 2023/03/28
- 使用 cdk 來 ECS
- Ref
  - [D19-ECS](https://ithelp.ithome.com.tw/articles/10248263)
  - [Creating an AWS Fargate service using the AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/ecs_example.html)
  - [AWS Services Quota](https://ap-northeast-2.console.aws.amazon.com/servicequotas/home/)

```bash
cdk version
#2.70.0 (build c13a0f1)

cdk bootstrap aws://123456789012/ap-northeast-2 \
    --toolkit-stack-name CDKToolkit-ECS

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
