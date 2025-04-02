#!/bin/bash
exit 0
# ---------------------------------------------------------------------------

### ====================== HTTP Api Gateway 觸發 EventBridge, 是情況 invoke Function ======================
sam deploy -t tmpl--apigw-http-api-eventbridge.yaml

API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name simple-sam-examples --output text --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue")

### invoke
curl --location --request POST $API_ENDPOINT \
  --header 'Content-Type: application/json' \
  --data-raw '{ "Detail":{ "message": "This is my test" } }'

### 直接對 default Event Bus 放置 Event (藉此吻合 source, 來 invoke Function)
aws events put-events \
  --entries '[{"Source": "WebApp", "DetailType": "OrderPlaced", "Detail": "{\"orderId\":\"9876\"}"}]'

sam delete
