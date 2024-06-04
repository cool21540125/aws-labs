"""
列出所有 CloudWatch Log Groups
"""
import boto3
import os

session = boto3.Session(profile_name=os.environ.get("AWS_PROFILE"))
client = session.client("logs")


first_time = True
idx = 0
next_token = ""
while first_time or next_token:
    if first_time:
        first_time = False
        response = client.describe_log_groups(
            limit=50,
            includeLinkedAccounts=False,
            logGroupClass="STANDARD",
        )
    else:
        response = client.describe_log_groups(
            limit=50,
            nextToken=next_token,
            includeLinkedAccounts=False,
            logGroupClass="STANDARD",
        )
    next_token = response.get("nextToken", "")
    for lg in response["logGroups"]:
        idx += 1
        print(idx, lg["logGroupName"])
        if lg["metricFilterCount"] > 0:
            print(f' FOUND ---> f{lg["logGroupName"]} <---')

print("=== DONE ===")
