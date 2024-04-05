#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LabCdkVpcEc2Stack } from '../lib/lab-cdk-vpc-ec2-stack';

const app = new cdk.App();
new LabCdkVpcEc2Stack(app, 'cdk-vpc-ec2-stack', {
  env: { account: process.env.AWS_ACCOUNT, region: process.env.AWS_REGION },
});
