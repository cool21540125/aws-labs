#!/bin/bash
exit 0
# ---------------------------------------------------------------------------

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
aws dynamodb get-item --table-name $DDB_TABLE --key '{"userid": {"S": "YOUR_DDB_TABLE_RECORD_ID"}}'

## ------------ 註冊一個 Cognito User ------------
# https://awscli.amazonaws.com/v2/documentation/api/latest/reference/cognito-idp/sign-up.html#examples
UserName=cool21540125@gmail.com
PASSWORD=1qaz@WSX
aws cognito-idp sign-up --client-id $COGNITO_CLIENT_ID --username $UserName --password $PASSWORD --user-attributes Name="email",Value="$UserName" Name="name",Value="tony"
# 上面用法限於 Cognito App Client 無 Client secret
# 下面用法用於 Cognito App Client 有 Client secret
# 計算方式參考: https://docs.aws.amazon.com/cognito/latest/developerguide/signing-up-users-in-your-app.html#cognito-user-pools-computing-secret-hash
APP_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
HASHED_SECRET=$(echo -n "$UserName$COGNITO_CLIENT_ID" | openssl dgst -sha256 -hmac $APP_CLIENT_SECRET -binary | openssl enc -base64)
aws cognito-idp sign-up --client-id $COGNITO_CLIENT_ID --username $UserName --password $PASSWORD --secret-hash "$HASHED_SECRET" --user-attributes Name="email",Value="$UserName" Name="name",Value="tony"

## ------------ 註冊完後驗證 ------------
# https://awscli.amazonaws.com/v2/documentation/api/latest/reference/cognito-idp/confirm-sign-up.html#examples
# 成功以後, 去收信, 會拿到一個 verification code, 例如: 350035
VERIFICATION_CODE=000000
aws cognito-idp confirm-sign-up --client-id $COGNITO_CLIENT_ID --username=$UserName --confirmation-code $VERIFICATION_CODE
# 同上述理由, 若有啟用 Client secret, 使用下面方式
aws cognito-idp confirm-sign-up --client-id $COGNITO_CLIENT_ID --username=$UserName --secret-hash "$HASHED_SECRET" --confirmation-code $VERIFICATION_CODE
# 成功的話, 不會有 response (只能從 Web Console 上頭確認 ~"~")

## 使用 USER_PASSWORD_AUTH 方式認證並登入到 Cognito, 取得 token
# https://awscli.amazonaws.com/v2/documentation/api/latest/reference/cognito-idp/initiate-auth.html#examples
ID_TOKEN=$(aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id $COGNITO_CLIENT_ID \
  --auth-parameters "UserName=$UserName,PASSWORD=$PASSWORD" \
  --query 'AuthenticationResult.IdToken' \
  --output text)
# 會拿到一包超級長的 token string (這就是 JWT Token)

### Cognito Login Url
#UserPoolId=$(aws cloudformation describe-stacks --stack-name workshop-serverless-patterns-apigateway --output text --query "Stacks[0].Outputs[?OutputKey=='UserPool'].OutputValue")
#UserPoolClient=$(aws cloudformation describe-stacks --stack-name workshop-serverless-patterns-apigateway --output text --query "Stacks[0].Outputs[?OutputKey=='UserPoolClient'].OutputValue")
#echo "https://${UserPoolClient}.auth.us-west-2.amazoncognito.com/login?client_id=${UserPoolClient}&response_type=code&redirect_uri=http://localhost"
# 用來讓 YourApp /login 以後, 可以藉由 Cognito Login Page 來做 login, 並且跳回 YourApp 的 /authorize 做認證

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

pytest tests/integration -v
