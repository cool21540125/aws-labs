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

### ====================== Rest Api Gateway + Usage Plan ======================
# https://serverlessland.com/patterns/apigw-api-key-sam
# https://github.com/aws-samples/serverless-patterns/tree/main/apigw-api-key

example_apigw_usage_plan() {
  sam deploy -t tmpl__apigw-rest-api-usage-plan.yaml

  API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name simple-sam-examples --output text --query "Stacks[0].Outputs[?OutputKey=='AppApiEndpoint'].OutputValue")
  echo $API_ENDPOINT

  curl --location --request GET $API_ENDPOINT/Prod/
  #{"message":"Missing Authentication Token"}%

  API_KEY_ID=$(aws cloudformation describe-stacks --stack-name simple-sam-examples --output text --query "Stacks[0].Outputs[?OutputKey=='ApiKeyId'].OutputValue")
  USAGE_PLAN_ID=$(aws cloudformation describe-stacks --stack-name simple-sam-examples --output text --query "Stacks[0].Outputs[?OutputKey=='UsagePlanId'].OutputValue")
  USAGE_PLAN_API_KEY=$(aws apigateway get-usage-plan-key --usage-plan-id $USAGE_PLAN_ID --key-id $API_KEY_ID | yq '.value')

  # 拿 ApiKey 調用 RestApiGw
  curl -H "x-api-key:$USAGE_PLAN_API_KEY" $API_ENDPOINT | jq

  sam delete
}

### ====================== Rest Api Gateway + Authorizer (using Cognito) ======================
# https://serverlessland.com/patterns/apigw-cognito-authorizer-sam-nodejs
# https://github.com/aws-samples/serverless-patterns/tree/main/cognito-restapi

example_apigw_cognito_auth() {
  sam deploy -t tmpl__apigw-rest-api-cognito.yaml
  API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name simple-sam-examples --output text --query "Stacks[0].Outputs[?OutputKey=='AppApiEndpoint'].OutputValue")
  echo $API_ENDPOINT

  CognitoAppClientId=$(aws cloudformation describe-stacks --stack-name simple-sam-examples --output text --query "Stacks[0].Outputs[?OutputKey=='MyUserPoolClient'].OutputValue")
  echo $CognitoAppClientId

  # 首次登入時必須要重設密碼 (每個 user 進行過一次即可)
  NEWLY_PASSWORD=
  aws cognito-idp respond-to-auth-challenge \
    --client-id "$CognitoAppClientId" \
    --challenge-name NEW_PASSWORD_REQUIRED \
    --challenge-responses USERNAME=tonychoucc@gmail.com,NEW_PASSWORD=$NEWLY_PASSWORD,userAttributes.name=tonychoucc \
    --session "$SESSION"
  # 如果看到 NEW_PASSWORD_REQUIRED, 就表示須要重設密碼

  # 登入到 Cognito
  aws cognito-idp initiate-auth \
    --auth-flow USER_PASSWORD_AUTH \
    --client-id $CognitoAppClientId \
    --auth-parameters USERNAME=tonychoucc@gmail.com,PASSWORD=$NEWLY_PASSWORD
  # response SESSION 非常的長, 快要 1000 字

  curl -i $API_ENDPOINT
  # 401

  curl -i -H "token: $token" $API_ENDPOINT
  # 200
}

### ====================== Rest Api Gateway + CloudWatch access log (with formats) ======================
# https://serverlessland.com/patterns/apigw-cloudwatch
# https://github.com/aws-samples/serverless-patterns/tree/main/apigw-cloudwatch

example_apigw_cloudwatch_access_logs() {
  sam deploy -t tmpl__apigw-rest-api-cloudwatch.yaml
  API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name simple-sam-examples --output text --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue")
  echo $API_ENDPOINT

  ## WARNING: 依照作者給的東西, 依舊沒辦法真的看到 ApiGw 的 access logs; 不過, X-Ray traces 有東西(但還沒能力識別)
  curl -i $API_ENDPOINT
}

### ====================== Workshop - Rest Api Gateway + Lambda Authorizer + Cognito User Pool + DynamoDB ======================
# https://catalog.workshops.aws/serverless-patterns/en-US/module2/sam-python
workshop_apigw_authorizer_cup() {

  module_m2_2() {
    git checkout WorkshopApiGwServerlessPattern200M22

    ## 初始化 DynamoDB && LambdaFn(用來 CRUD DynamoDB)
    sam deploy -t tmpl__apigw-rest-api-lambda-authorizer-workshop200.yaml

    # 簡單調用 LambdaFn (直接尻 LambdaFn, 建立一筆 DDB record)
    sam local invoke UsersFunction \
      --template tmpl__apigw-rest-api-lambda-authorizer-workshop200.yaml \
      --event events/tmpl__apigw-rest-api-lambda-authorizer-workshop200/event-post-user.json \
      --env-vars envs/tmpl__apigw-rest-api-lambda-authorizer-workshop200/env.json

    # Output
    DDB_TABLE=$(aws cloudformation describe-stacks \
      --stack-name simple-sam-examples \
      --output text \
      --query "Stacks[0].Outputs[?OutputKey=='UsersTable'].OutputValue")
    echo $DDB_TABLE

    # Query from Ddb
    aws dynamodb get-item \
      --table-name $DDB_TABLE \
      --key '{"userid": {"S": "YOUR_DDB_TABLE_RECORD_ID"}}'

    # 簡單調用 LambdaFn (直接尻 LambdaFn, 建立一筆 DDB record)
    sam local invoke UsersFunction \
      --template tmpl__apigw-rest-api-lambda-authorizer-workshop200.yaml \
      --event events/tmpl__apigw-rest-api-lambda-authorizer-workshop200/event-post-user2.json \
      --env-vars envs/tmpl__apigw-rest-api-lambda-authorizer-workshop200/env.json
  }

  module_m2_3() {
    git checkout WorkshopApiGwServerlessPattern200M23

    ## 增加 Rest Api Gateway
    sam deploy -t tmpl__apigw-rest-api-lambda-authorizer-workshop200.yaml

    export API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name simple-sam-examples --output text --query "Stacks[0].Outputs[?OutputKey=='APIEndpoint'].OutputValue")
    echo "API endpoint: $API_ENDPOINT"

    # 直接調用 Api Endpoint 做查詢 (此時尚無需做認證)
    curl $API_ENDPOINT/users
  }

  module_m2_3_1() {
    git checkout WorkshopApiGwServerlessPattern200M231

    ## 增加 Cognito User Pool
    sam deploy -t tmpl__apigw-rest-api-lambda-authorizer-workshop200.yaml

    COGNITO_CLIENT_ID=$(aws cloudformation describe-stacks --stack-name simple-sam-examples --output text --query "Stacks[0].Outputs[?OutputKey=='UserPoolClient'].OutputValue")

    ## 註冊一個 Cognito User
    # https://awscli.amazonaws.com/v2/documentation/api/latest/reference/cognito-idp/sign-up.html#examples
    PASSWORD=
    aws cognito-idp sign-up --client-id $COGNITO_CLIENT_ID --username cool21540125@gmail.com --password $PASSWORD --user-attributes Name="email",Value="cool21540125@gmail.com" Name="name",Value="tony"
    # 成功以後, 去收信, 會拿到一個 verification code, 例如: 350035

    ## 註冊完後驗證
    # https://awscli.amazonaws.com/v2/documentation/api/latest/reference/cognito-idp/confirm-sign-up.html#examples
    VERIFICATION_CODE=
    aws cognito-idp confirm-sign-up --client-id $COGNITO_CLIENT_ID --username=cool21540125@gmail.com --confirmation-code $VERIFICATION_CODE
    # 成功的話, 不會有 response (只能從 Web Console 上頭確認 ~"~")

    ## 尚未啟用認證 (依舊可正常訪問)
    curl $API_ENDPOINT/users
  }

  module_m2_3_2() {
    git checkout WorkshopApiGwServerlessPattern200M232

    # 前置作業
    mkdir -p src/apigw-rest-api-lambda-authorizer-workshop200/dependencies/layer/python/lib/python3.12/site-packages

    ## Layer (a.k.a. requirements.txt 有異動, 就需要重新執行)
    pip install \
      -r src/apigw-rest-api-lambda-authorizer-workshop200/dependencies/requirements.txt \
      -t src/apigw-rest-api-lambda-authorizer-workshop200/dependencies/layer/python
    zip -r src/apigw-rest-api-lambda-authorizer-workshop200/dependencies/python.zip src/apigw-rest-api-lambda-authorizer-workshop200/dependencies/layer/python

    ## 將 Rest Api Gateway 加上驗證機制 (secure API), 並要求使用 Lambda Authorizer(custom authorizer) 做驗證
    sam deploy -t tmpl__apigw-rest-api-lambda-authorizer-workshop200.yaml

    ## 使用 USER_PASSWORD_AUTH 方式認證並登入到 Cognito, 取得 token
    # https://awscli.amazonaws.com/v2/documentation/api/latest/reference/cognito-idp/initiate-auth.html#examples
    ID_TOKEN=$(aws cognito-idp initiate-auth \
      --auth-flow USER_PASSWORD_AUTH \
      --client-id $COGNITO_CLIENT_ID \
      --auth-parameters "USERNAME=cool21540125@gmail.com,PASSWORD=$PASSWORD" \
      --query 'AuthenticationResult.IdToken' \
      --output text)
    # 會拿到一包超級長的 token string (這就是 JWT Token)

    ## Cognito Login Url
    UserPoolId=$(aws cloudformation describe-stacks --stack-name simple-sam-examples --output text --query "Stacks[0].Outputs[?OutputKey=='UserPool'].OutputValue")

    UserPoolClient=$(aws cloudformation describe-stacks --stack-name simple-sam-examples --output text --query "Stacks[0].Outputs[?OutputKey=='UserPoolClient'].OutputValue")
    echo "https://${UserPoolClient}.auth.us-west-2.amazoncognito.com/login?client_id=${UserPoolClient}&response_type=code&redirect_uri=http://localhost"
    # 上面我還不曉得實際用途... 但可以 redirect 到其他頁面 (似乎這就是所謂的 Authorization Code Flow?)

    curl -i $API_ENDPOINT/users
    # 401 {"message":"Unauthorized"}%

    # 目前 User 對於自己所擁有的 Resources 的 principalID, 並無相應資源 (也就是沒有屬於你的東西啦)
    curl -i $API_ENDPOINT/users -H "Authorization:$ID_TOKEN"
    # 403 {"Message":"User is not authorized to access this resource"}%

    ## 把 ID_TOKEN 拿到 https://jwt.io/ 做 decode
    SUB=

    ## 即使此時 DB 有東西, 也拿不到東西 (因為都不是此 User 的)
    curl -i $API_ENDPOINT/users/$SUB -H "Authorization:$ID_TOKEN"

    ## 使用自己登入後的 JWT token, 新增一筆資源
    curl --location --request PUT "$API_ENDPOINT/users/$SUB" \
      --data-raw '{"name": "My name is WhatTheParkWorld"}' \
      --header "Authorization: $ID_TOKEN" \
      --header "Content-Type: application/json"

    ## 這時候再來拿, 就有東西了
    curl -i $API_ENDPOINT/users/$SUB -H "Authorization:$ID_TOKEN"
  }
}
