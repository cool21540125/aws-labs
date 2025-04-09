from boto3.dynamodb.conditions import Key
import boto3
import os

orders_table = os.getenv("TABLE_NAME")
dynamodb = boto3.resource("dynamodb")


def get_order(user_id, order_id):
    table = dynamodb.Table(orders_table)
    response = table.query(
        KeyConditionExpression=(Key("userId").eq(user_id) & Key("orderId").eq(order_id))
    )

    user_orders = []
    for item in response["Items"]:
        user_orders.append(item["data"])

    return user_orders[0]
