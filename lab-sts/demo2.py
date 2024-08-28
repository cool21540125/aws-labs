"""
Instance Profile 本身的 Role 無法直接訪問
不過藉此去 assume 可以訪問 SecretManager 的 Role
而 RoleToRetrieveSecrets 上頭的 Trusted entities 需要 allow 目前使用的 Role 去做 assume
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Ec2DataCenter",
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "arn:aws:iam::123456789012:user/istore-server",
                    "arn:aws:sts::123456789012:assumed-role/CloudWatchAgentServerRole/i-abcdefg1234567890"
                ]
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
"""

import boto3

sts = boto3.client("sts")

response = sts.assume_role(
    RoleArn="arn:aws:iam::123456789012:role/RoleToRetrieveSecrets",
    RoleSessionName="sreDemoAssumeRole-2024-08-22",
)

client = boto3.client(
    service_name="secretsmanager",
    region_name="us-west-2",
    aws_access_key_id=response["Credentials"]["AccessKeyId"],
    aws_secret_access_key=response["Credentials"]["SecretAccessKey"],
    aws_session_token=response["Credentials"]["SessionToken"],
)

get_secret_value_response = client.get_secret_value(SecretId="/rds/sretestDB/app_user")

if "SecretString" in get_secret_value_response:
    response = get_secret_value_response["SecretString"]
    print(response)
else:
    print(dir(get_secret_value_response))
