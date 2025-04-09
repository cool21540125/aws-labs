import simplejson as json
from utils import get_order


def lambda_handler(event, context):
    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
    order_id = event["pathParameters"]["orderId"]

    try:
        orders = get_order(user_id, order_id)
        response = {"statusCode": 200, "headers": {}, "body": json.dumps(orders)}
        return response
    except Exception as err:
        raise
