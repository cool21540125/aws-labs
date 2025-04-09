import boto3
import os
import pytest
import uuid
import json
from datetime import datetime
from decimal import Decimal

APPLICATION_STACK_NAME = os.getenv("USERS_STACK_NAME", None)
MODULE3_STACK_NAME = os.getenv("ORDERS_STACK_NAME", None)
globalConfig = {}


def get_stack_outputs(stack_name):
    result = {}
    cf_client = boto3.client("cloudformation")
    cf_response = cf_client.describe_stacks(StackName=stack_name)
    outputs = cf_response["Stacks"][0]["Outputs"]
    for output in outputs:
        result[output["OutputKey"]] = output["OutputValue"]
    return result


def create_cognito_accounts():
    result = {}
    sm_client = boto3.client("secretsmanager")
    idp_client = boto3.client("cognito-idp")

    # Get a random password from Secrets Manager
    secrets_manager_response = sm_client.get_random_password(
        ExcludeCharacters='"' "`[]{}():;,$/\\<>|=&", RequireEachIncludedType=True
    )
    result["user1UserName"] = "user1User@example.com"
    result["user1UserPassword"] = secrets_manager_response["RandomPassword"]

    # Delete any existing users before creating new
    try:
        idp_client.admin_delete_user(
            UserPoolId=globalConfig["UserPool"], Username=result["user1UserName"]
        )
    except idp_client.exceptions.UserNotFoundException:
        print("User1 not found; no deletion necessary. Continuing...")

    # Create a new user
    idp_response = idp_client.admin_create_user(
        UserPoolId=globalConfig["UserPool"],
        Username=result["user1UserName"],
        UserAttributes=[{"Name": "name", "Value": result["user1UserName"]}],
        TemporaryPassword=result["user1UserPassword"],
        MessageAction="SUPPRESS",
        DesiredDeliveryMediums=[],
    )
    # Change the temporary password
    secrets_manager_response = sm_client.get_random_password(
        ExcludeCharacters='"' "`[]{}():;,$/\\<>|=&", RequireEachIncludedType=True
    )
    result["user1UserPassword"] = secrets_manager_response["RandomPassword"]
    idp_client.admin_set_user_password(
        UserPoolId=globalConfig["UserPool"],
        Username=result["user1UserName"],
        Password=result["user1UserPassword"],
        Permanent=True,
    )
    result["user1UserSub"] = idp_response["User"]["Username"]

    # Get new user authentication info
    idp_response = idp_client.initiate_auth(
        AuthFlow="USER_PASSWORD_AUTH",
        AuthParameters={
            "USERNAME": result["user1UserName"],
            "PASSWORD": result["user1UserPassword"],
        },
        ClientId=globalConfig["UserPoolClient"],
    )
    result["user1UserIdToken"] = idp_response["AuthenticationResult"]["IdToken"]
    result["user1UserAccessToken"] = idp_response["AuthenticationResult"]["AccessToken"]
    result["user1UserRefreshToken"] = idp_response["AuthenticationResult"][
        "RefreshToken"
    ]

    return result


def clear_dynamo_tables():
    """
    Clear all pre-existing data from the tables prior to testing.
    """
    dbd_client = boto3.client("dynamodb")
    db_response = dbd_client.scan(
        TableName=globalConfig["OrdersTable"], AttributesToGet=["userId", "orderId"]
    )
    for item in db_response["Items"]:
        dbd_client.delete_item(
            TableName=globalConfig["OrdersTable"],
            Key={
                "userId": {"S": item["userId"]["S"]},
                "orderId": {"S": item["orderId"]["S"]},
            },
        )


@pytest.fixture(scope="session")
def global_config(request):
    """
    # FIXME: tear_up 與 tear_down 沒有做得很好, 測試開始前會清空 DB, 測試完成後會留下一筆 test data...
    Load stack outputs, create user accounts, and clear database tables.
    """
    global globalConfig

    # load outputs of the stacks to test
    globalConfig.update(get_stack_outputs(APPLICATION_STACK_NAME))
    globalConfig.update(get_stack_outputs(MODULE3_STACK_NAME))
    globalConfig.update(create_cognito_accounts())
    clear_dynamo_tables()
    return globalConfig
