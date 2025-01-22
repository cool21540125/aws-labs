# 說明

使用 cdk 建立 OpenSearch

# Caution

會燒錢!

# [OpenSearch pricing](https://aws.amazon.com/opensearch-service/pricing/)

- `t3.small.search` : $0.036/hr (光是 init 就要花 20 mins)

# Usage

```bash
yarn install aws-cdk

nvm use

yarn

export AWS_ACCOUNT_ID=
export AWS_DEFAULT_REGION=us-west-2
export MY_IP=

make deploy
```
