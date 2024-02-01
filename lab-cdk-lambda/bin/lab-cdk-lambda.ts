#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LabCdkLambdaStack } from '../lib/lab-cdk-lambda-stack';

const app = new cdk.App();
new LabCdkLambdaStack(app, 'LabCdkLambdaStack', {

  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

});