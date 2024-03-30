
# sam cli 基礎使用範例

- [AWS Lambda workshop](https://catalog.us-east-1.prod.workshops.aws/workshops/66943748-f648-4a43-8b44-da8cfcc53286/en-US/2-first/2-invoke)


```bash
### init project
sam init --runtime python3.11 --name poc-sam
#1 - AWS Quick Start Templates
#1 - Hello World Example
#N
#N
#N

### 本地 build, 產生 .aws-sam
sam build


### 部署到 CloudFormation
sam deploy


### 

API_URL=$(aws cloudformation describe-stacks --stack-name poc-sam --query 'Stacks[0].Outputs[?OutputKey==`HelloWorldApi`].OutputValue' --output text)
LAMBDA_ARN=$(aws cloudformation describe-stacks --stack-name poc-sam --query 'Stacks[0].Outputs[?OutputKey==`HelloWorldFunction`].OutputValue' --output text)
echo API_URL=$API_URL
echo LAMBDA_ARN=$LAMBDA_ARN

aws lambda invoke --function-name $LAMBDA_ARN --payload '{}' output.json
cat output.json | jq
```


# Load test

本文使用 `artillery` 這個 Load Test 工具

```bash
artillery --version
#Artillery: 2.0.5

### 模擬 150 次/sec, 持續 300 秒
cat << EOF > loadtest.yaml 
config:
  phases:
    - duration: 300
      arrivalRate: 150
scenarios:
    - flow:
      - get:
            url: "/"
EOF
artillery run --target $API_URL loadtest.yaml
```

可以發現 CloudWatch > Metrics > Lambda > (找到目前 Lambda Function)

比較了一開始 Lambda Function 會做出一個 spike, on-demand 部署一堆 concurrency

相較之下可選用 Provisioned Concurrency 或是 Auto Scaling
