import simplejson as json
import os
import boto3
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError
from decimal import Decimal
from utils import get_order

# Globals
order_table = os.getenv("TABLE_NAME")
dynamodb = boto3.resource("dynamodb")


def edit_order(event):
    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
    order_id = event["pathParameters"]["orderId"]
    new_data = json.loads(event["body"], parse_float=Decimal)
    new_data["userId"] = user_id
    new_data["orderId"] = order_id

    ddb_item = {"orderId": order_id, "userId": user_id, "data": new_data}
    ddb_item = json.loads(json.dumps(ddb_item), parse_float=Decimal)

    table = dynamodb.Table(order_table)
    try:
        table.put_item(
            Item=ddb_item,
            ConditionExpression="attribute_exists(orderId) AND attribute_exists(userId) AND #data.#status = :status",
            ExpressionAttributeNames={"#data": "data", "#status": "status"},
            ExpressionAttributeValues={":status": "PLACED"},
            ReturnValuesOnConditionCheckFailure="ALL_OLD",
        )
    except ClientError as exc:
        if exc.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise Exception(
                f"Cannot edit Order {order_id}. Please check if the order exists and the status is PLACED."
            )
        else:
            raise Exception(
                f"Error occurred: {exc.response['Error']['Code']}: {exc.response['Error']['Message']}"
            )
    except Exception as e:
        raise Exception(f"An unexpected error occurred: {e}")

    return get_order(user_id, order_id)


def lambda_handler(event, context):
    try:
        updated = edit_order(event)
        response = {"statusCode": 200, "headers": {}, "body": json.dumps(updated)}
        return response
    except Exception as err:
        raise Exception(str(err))
