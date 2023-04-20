"""
合約廠商(無 IAM User), 第一次要先跟 AWS Resource Owner && Admin 接洽, 從他們那邊取得
Temporary Security Credentials
以此來訪問 their AWS Resources
"""
import os
import boto3
import botocore
import time
from datetime import datetime as dt
from dotenv import load_dotenv

load_dotenv()

def list_objects_forever():
    while True:
        try:
            s3 = boto3.client('s3',
                            aws_access_key_id=os.getenv("Contractor_AccessKeyId"),
                            aws_secret_access_key=os.getenv("Contractor_SecretAccessKey"),
                            aws_session_token=os.getenv("Contractor_SessionToken"))
            
            print(dt.now().strftime("%H:%M:%S"))
            response = s3.list_objects_v2(Bucket='example-bucket-tonychoucc-2023')
            for obj in response['Contents']:
                print(obj['Key'])
            
        except botocore.exceptions.ClientError as err:
            if err.response['Error']['Code'] == 'ExpiredToken':
                sts = boto3.client('sts')
                response = sts.get_session_token(DurationSeconds=900)

                print("====== 前一個 Temporary Credential 到期, 重取一個新的 ======")
                os.environ['Contractor_AccessKeyId'] = response['Credentials']['AccessKeyId']
                os.environ['Contractor_SecretAccessKey'] = response['Credentials']['SecretAccessKey']
                os.environ['Contractor_SessionToken'] = response['Credentials']['SessionToken']
                list_objects_forever()

            else:
                raise

        finally:
            time.sleep(60)

list_objects_forever()
