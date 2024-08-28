"""
直接藉由 Instance Profile 的 Role 訪問 Secret Manager
Sercret Manger 的 Resource permissions 允許該 Role:
{
    "Version" : "2012-10-17",
    "Statement" : [ {
        "Effect" : "Allow",
        "Principal" : {
        "AWS" : "arn:aws:iam::123456789012:role/CloudWatchAgentServerRole"
        },
        "Action" : "secretsmanager:GetSecretValue",
        "Resource" : "*"
    } ]
}
"""

import boto3

session = boto3.session.Session()

client = session.client(
    service_name="secretsmanager",
    region_name="us-west-2",
)

get_secret_value_response = client.get_secret_value(SecretId="/rds/sretestDB/password")

if "SecretString" in get_secret_value_response:
    response = get_secret_value_response["SecretString"]
    print(response)
else:
    print(dir(get_secret_value_response))
