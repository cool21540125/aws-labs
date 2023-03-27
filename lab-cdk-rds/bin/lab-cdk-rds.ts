#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LabCdkRdsStack } from '../lib/lab-cdk-rds-stack';

const app = new cdk.App();
new LabCdkRdsStack(app, 'LabCdkRdsStack', {
  
  env: { account: '668363134003', region: 'ap-northeast-2' },
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

});