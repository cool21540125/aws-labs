#!/bin/bash
exit 0
# ---------------------------------------------------------------------------

## 由於使用到 sub stack (因此需要留意 capability 的問題)
sam deploy --capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND
# CAPABILITY_IAM         : CloudFormation 在部署過程中, 建立/修改 IAM && 它的名稱是由 CloudFormation 自動生成
# CAPABILITY_NAMED_IAM   : CloudFormation 在部署過程中, 建立/修改 IAM && 具體指明了 IAM 資源名稱, 則必須使用 CAPABILITY_NAMED_IAM (可視為 CAPABILITY_IAM 的進階版)
# CAPABILITY_AUTO_EXPAND : 用於處理 nested Template
# 使用 root stack 包裹 user nested stack (用來做認證)

COGNITO_LOGIN_PAGE=$(aws cloudformation describe-stacks --stack-name workshop-serverless-patterns-apigateway --output text --query "Stacks[0].Outputs[?OutputKey=='CognitoLoginURL'].OutputValue")
echo $COGNITO_LOGIN_PAGE

### ======================== M3 1.1 ========================
# ⬇️⬇️⬇️⬇️⬇️ 記得要設 ⬇️⬇️⬇️⬇️⬇️
export USERS_STACK_NAME=workshop-serverless-patterns-apigateway-users-XZL005MV528A
export ORDERS_STACK_NAME=workshop-serverless-patterns-apigateway-orders-1KE2WQWZI8459
# ⬆️⬆️⬆️⬆️⬆️ 記得要換設 ⬆️⬆️⬆️⬆️⬆️
PYTHONPATH=orders pytest orders/tests/integration -v -W ignore::DeprecationWarning

###
#
#
#
#
#
#
#
#
#
#
#
#
#

# ===================== 前置作業 =====================
mkdir -p layer/python/lib/python3.12/site-packages

## Layer (a.k.a. requirements.txt 有異動, 就需要重新執行)
pip install -r src/requirements.txt -t layer/python
zip -r layer/python.zip layer/python

# S3
export AWS_PROFILE=devops
aws s3 mb s3://workshop-serverless-patterns-apigateway

# ===================== Start =====================
sam deploy

# 直接調用 LambdaFn (直接尻 LambdaFn, 跳過 ApiGateway)
sam local invoke UsersFunction \
  --event events/event-post-user.json \
  --env-vars env.json

DDB_TABLE=$(aws cloudformation describe-stacks --stack-name workshop-serverless-patterns-apigateway --output text --query "Stacks[0].Outputs[?OutputKey=='UsersTable'].OutputValue")
API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name workshop-serverless-patterns-apigateway --output text --query "Stacks[0].Outputs[?OutputKey=='APIEndpoint'].OutputValue")
COGNITO_CLIENT_ID=$(aws cloudformation describe-stacks --stack-name workshop-serverless-patterns-apigateway --output text --query "Stacks[0].Outputs[?OutputKey=='UserPoolClient'].OutputValue")

# Query from Ddb
aws dynamodb get-item \
  --table-name $DDB_TABLE \
  --key '{"userid": {"S": "YOUR_DDB_TABLE_RECORD_ID"}}'

## 註冊一個 Cognito User
# https://awscli.amazonaws.com/v2/documentation/api/latest/reference/cognito-idp/sign-up.html#examples
PASSWORD=1qaz@WSX
aws cognito-idp sign-up --client-id $COGNITO_CLIENT_ID --username cool21540125@gmail.com --password $PASSWORD --user-attributes Name="email",Value="cool21540125@gmail.com" Name="name",Value="tony"
# 成功以後, 去收信, 會拿到一個 verification code, 例如: 350035

## 註冊完後驗證
# https://awscli.amazonaws.com/v2/documentation/api/latest/reference/cognito-idp/confirm-sign-up.html#examples
VERIFICATION_CODE=000000
aws cognito-idp confirm-sign-up --client-id $COGNITO_CLIENT_ID --username=cool21540125@gmail.com --confirmation-code $VERIFICATION_CODE
# 成功的話, 不會有 response (只能從 Web Console 上頭確認 ~"~")

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
UserPoolId=$(aws cloudformation describe-stacks --stack-name workshop-serverless-patterns-apigateway --output text --query "Stacks[0].Outputs[?OutputKey=='UserPool'].OutputValue")

UserPoolClient=$(aws cloudformation describe-stacks --stack-name workshop-serverless-patterns-apigateway --output text --query "Stacks[0].Outputs[?OutputKey=='UserPoolClient'].OutputValue")
echo "https://${UserPoolClient}.auth.us-west-2.amazoncognito.com/login?client_id=${UserPoolClient}&response_type=code&redirect_uri=http://localhost"
# 上面我還不曉得實際用途... 但可以 redirect 到其他頁面 (似乎這就是所謂的 Authorization Code Flow?)

curl -i $API_ENDPOINT/users
# 401 {"message":"Unauthorized"}%

# 目前 User 對於自己所擁有的 Resources 的 principalID, 並無相應資源 (也就是沒有屬於你的東西啦)
curl -i $API_ENDPOINT/users -H "Authorization:$ID_TOKEN"
# 403 {"Message":"User is not authorized to access this resource"}%

## 即使此時 DB 有東西, 也拿不到東西
SUB=00000000-0000-0000-0000-000000000000 ## 把 ID_TOKEN 拿到 https://jwt.io/ 做 decode
curl -X GET $API_ENDPOINT/users/$SUB -i -H "Authorization:$ID_TOKEN"
# 200 (找不到資源, 因為目前沒有屬於該 user 的東西)

## 使用自己登入後的 JWT token, 新增一筆資源
curl --location --request PUT "$API_ENDPOINT/users/$SUB" \
  --data-raw '{"name": "tony1234"}' \
  --header "Authorization: $ID_TOKEN" \
  --header "Content-Type: application/json"

## 這時候再來拿, 就有東西了
curl -i $API_ENDPOINT/users/$SUB -H "Authorization:$ID_TOKEN"
# 200 (可以拿到東西了)

## -------------- Test --------------
# https://catalog.workshops.aws/serverless-patterns/en-US/module2/sam-python/test-unit
pytest tests/unit -v -W ignore::DeprecationWarning # WARNING: 由於使用的 moto 版本為 3, 新版已經到 5, 出現一堆 DeprecationWarning

# https://catalog.workshops.aws/serverless-patterns/en-US/module2/sam-python/test-integration
export ENV_STACK_NAME=workshop-serverless-patterns-apigateway
pytest tests/integration -v -W ignore::DeprecationWarning
