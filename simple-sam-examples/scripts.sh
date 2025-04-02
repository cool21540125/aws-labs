#!/bin/bash
exit 0
# ---------------------------------------------------------------------------

### ====================== Step0 先建立 Bucket (要改 samconfig.toml 的 bucket name) ======================
aws s3 mb s3://sre-demo-test-simple-sam-examples2025

### ====================== HTTP Api Gateway 觸發 EventBridge, 視情況 invoke Function ======================
# https://serverlessland.com/patterns/apigateway-http-eventbridge-java-sam
# https://github.com/aws-samples/serverless-patterns/tree/main/apigw-http-api-eventbridge-java

example_apigw_eventbridge() {
  sam deploy -t tmpl__apigw-http-api-eventbridge.yaml

  API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name simple-sam-examples --output text --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue")
  echo $API_ENDPOINT

  ### 法1. invoke - 發送請求到 ApiGw Endpoint (不會觸發 Function, 因為 EventPattern 不符合)
  curl --location --request POST $API_ENDPOINT \
    --header 'Content-Type: application/json' \
    --data-raw '{ "Detail":{ "message": "This is my test" } }'

  ### 法2. invoke - 直接對 default Event Bus 放置 Event (藉此吻合 source, 來 invoke Function)
  aws events put-events \
    --entries '[{"Source": "WebApp", "DetailType": "OrderPlaced", "Detail": "{\"orderId\":\"9876\"}"}]'

  sam delete
}

### ====================== HTTP Api Gateway 觸發 SQS, invoke Function ======================
# https://serverlessland.com/patterns/api-sqs-lambda-python
# https://github.com/aws-samples/serverless-patterns/tree/main/api-sqs-lambda-python
example_apigw_sqs() {
  sam deploy -t tmpl__apigw-http-api-sqs.yaml

  API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name simple-sam-examples --output text --query "Stacks[0].Outputs[?OutputKey=='MyHttpApiEndpoint'].OutputValue")
  echo $API_ENDPOINT

  ### 法1. invoke - 發送請求到 ApiGw Endpoint
  curl --location --request POST $API_ENDPOINT/submit \
    --header 'Content-Type: application/json' \
    --data-raw '{ "isMessageReceived": "Yes" }'

  ### 法2. invoke - 直接丟 Message 到 Queue
  # (略)

  sam delete
}

### ====================== Rest Api Gateway 調用 Lambda 藉由 SES 寄信 (尚未完成測試) ======================
# https://serverlessland.com/patterns/api-lambda-ses-sam-python
# https://github.com/aws-samples/serverless-patterns/tree/main/api-lambda-ses
example_apigw_lambda_ses() {
  sam deploy -t tmpl__apigw-rest-api-lambda-ses.yaml

  API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name simple-sam-examples --output text --query "Stacks[0].Outputs[?OutputKey=='apiGatewayInvokeURL'].OutputValue")
  echo $API_ENDPOINT

  # (當然是發不出去XD, 因為 SES 沒研究過, 沒配置權限)
  curl --location --request GET $API_ENDPOINT/s1/

  sam delete
}
