#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { LabCdkLambdaStack } from '../lib/lab-cdk-lambda-stack';

const app = new cdk.App();
new LabCdkLambdaStack(app, 'LabCdkLambdaStack', {
  
  env: { account: "152248006875", region: "us-east-2" },
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  
});