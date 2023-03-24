#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { LabCdkSnsSqsStack } from '../lib/lab-cdk-sns-sqs-stack';

const app = new cdk.App();
new LabCdkSnsSqsStack(app, 'LabCdkSnsSqsStack', {

  env: { account: "668363134003", region: "ap-northeast-3" },
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

});