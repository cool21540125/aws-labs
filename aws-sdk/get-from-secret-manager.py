import os
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

load_dotenv()

SECRET_NAME = os.getenv("secret_name")


def get_secret():
    secret_name = SECRET_NAME
    region_name = "ap-northeast-1"

    session = boto3.session.Session()
    client = session.client(service_name="secretsmanager", region_name=region_name)

    try:
        get_secret_value_response = client.get_secret_value(SecretId=secret_name)
    except ClientError as e:
        raise e

    secret = get_secret_value_response["SecretString"]

    print("")
    print("--------------")
    print(secret)
    print("--------------")
    print("")


get_secret()
