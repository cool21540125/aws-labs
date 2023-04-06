
- 2023/04/06
- 使用 cdk 建立 [ecsTaskExecutionRole](https://catalog.us-east-1.prod.workshops.aws/workshops/4b59b9fb-48b6-461c-9377-907b2e33c9df/en-US/setupawsdeployment/iamroles) 所需要的 Role

```bash
cdk --version
#2.72.1 (build ddbfac7)


### gogo
cdk bootstrap aws://668363134003/us-east-1 \
    --toolkit-stack-name CDKToolkit-ecs-roles \
    --s3-prefix toolkit-ecs-roles

cdk synth
cdk deploy --require-approval never

cdk diff

cdk destroy
```

-----------------------------------------------


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
