#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { LabCdkVpcEc2Stack } from '../lib/lab-cdk-vpc-ec2-stack';

const app = new cdk.App();
new LabCdkVpcEc2Stack(app, 'LabCdkVpcEc2Stack', {
  
  env: { account: '668363134003', region: 'ap-northeast-3' },
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

});