import json
import time

time.sleep(1)


def lambda_handler(event, context):

    time.sleep(0.1)

    return {
        "statusCode": 200,
        "body": json.dumps(
            {
                "message": "hello world",
            }
        ),
    }
