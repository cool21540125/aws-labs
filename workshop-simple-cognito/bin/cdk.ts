#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { WorkshopSimpleCognitoStack } from "../lib/cdk-cognito-user-pool";

const app = new cdk.App();
new WorkshopSimpleCognitoStack(app, "WorkshopSimpleCognitoStack", {
  stackName: "poc-my-cdk-cup-20240912",
  description: "POC for Cognito User Pool, do it by myself on 2024/09/12",
  env: { account: process.env.AWS_ACCOUNT, region: process.env.AWS_REGION }
});
