import simplejson as json
import os
import boto3
from boto3.dynamodb.conditions import Key, Attr
from datetime import datetime, timedelta
from utils import get_order
from botocore.exceptions import ClientError
import time


# Custom exception
class OrderStatusError(Exception):
    status_code = 400

    def __init__(self, message):
        super().__init__(message)


# Globals
orders_table = os.getenv("TABLE_NAME")
dynamodb = boto3.resource("dynamodb")


def cancel_order(event):
    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
    order_id = event["pathParameters"]["orderId"]

    current_time = time.time()

    try:
        table = dynamodb.Table(orders_table)
        response = table.update_item(
            Key={"userId": user_id, "orderId": order_id},
            UpdateExpression="set #data.#status = :new_status",
            ConditionExpression="(#data.#status = :current_status) AND (#data.orderTime > :minOrderTime)",
            ExpressionAttributeNames={"#data": "data", "#status": "status"},
            ExpressionAttributeValues={
                ":current_status": "PLACED",
                ":minOrderTime": str(current_time - 600),
                ":new_status": "CANCELED",
            },
            ReturnValues="ALL_NEW",
        )
    except ClientError as exc:
        if exc.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise OrderStatusError(
                f"Order {order_id} cannot be cancelled. Make sure the status of this order is PLACED and it was created less than 10 minutes ago."
            )
        else:
            raise OrderStatusError(
                f"Error occurred: {exc.response['Error']['Code']}: {exc.response['Error']['Message']}"
            )
    except Exception as e:
        raise OrderStatusError(f"An unexpected error occurred: {e}")

    return response["Attributes"]["data"]


def lambda_handler(event, context):
    try:
        updated = cancel_order(event)
        response = {"statusCode": 200, "headers": {}, "body": json.dumps(updated)}
        return response
    except OrderStatusError as oe:
        return {"statusCode": oe.status_code, "body": str(oe)}
    except Exception as err:
        raise
