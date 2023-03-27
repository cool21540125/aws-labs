#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LabCdkApiLambdaS3Stack } from '../lib/lab-cdk-api-lambda-s3-stack';

const app = new cdk.App();
new LabCdkApiLambdaS3Stack(app, 'LabCdkApiLambdaS3Stack', {

  env: { account: "668363134003", region: "us-east-2" },
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

});