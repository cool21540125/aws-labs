import json


def lambda_handler(event, context):
    print("Lambda 被 ApiGw 調用了 (這是Log)")
    return {
        "statusCode": 200,
        "body": json.dumps(
            {
                "message": "成功由 RestApi Gateway 調用 LambdaFunction",
            },
            ensure_ascii=False,
        ),
    }
