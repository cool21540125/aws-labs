"""
首次練習 AWS STS

AWS Resource Owner && Admin, 需要先建立一個 Role, 此 Role 允許 user 去訪問 S3
之後執行這個程式, 去尻 AWS STS AssumeRole API
取得一組 remporary security credentials
並將這組交給 合約廠商

::RoleArn : 自行建立用來允許訪問 S3 的 RoleArn
::RoleSessionName : (自行填寫)Server Side 將來用來追查 log 的時候方便追蹤管理
"""
import os
import boto3
from dotenv import load_dotenv

load_dotenv()

sts_client = boto3.client('sts',
                          aws_access_key_id=os.getenv("ACCESS_KEY"),
                          aws_secret_access_key=os.getenv("SECRET_ACCESS_KEY"))

response = sts_client.assume_role(RoleArn=os.getenv("RoleArn"),
                                  RoleSessionName='first_role_session_20230420',
                                  DurationSeconds=900)

creds = response['Credentials']

print('---------------------------------')
print(creds['AccessKeyId'])
print(creds['SecretAccessKey'])
print(creds['SessionToken'])
print(creds['Expiration'])
print('---------------------------------')
