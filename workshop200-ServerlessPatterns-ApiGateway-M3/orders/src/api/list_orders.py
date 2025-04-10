import simplejson as json
import os
import boto3
from boto3.dynamodb.conditions import Key, Attr

# Globals
orders_table = os.getenv("TABLE_NAME")
dynamodb = boto3.resource("dynamodb")


def list_orders(event):

    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

    table = dynamodb.Table(orders_table)
    response = table.query(KeyConditionExpression=Key("userId").eq(user_id))

    user_orders = [item["data"] for item in response["Items"]]

    return user_orders


def lambda_handler(event, context):
    try:
        orders = list_orders(event)
        response = {
            "statusCode": 200,
            "headers": {},
            "body": json.dumps({"orders": orders}),
        }
        return response
    except Exception as err:
        raise
