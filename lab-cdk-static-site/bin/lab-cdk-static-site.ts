#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { LabCdkStaticSiteStack } from '../lib/lab-cdk-static-site-stack';

const app = new cdk.App();
new LabCdkStaticSiteStack(app, 'LabCdkStaticSiteStack', {
  
  env: { account: "152248006875", region: "us-east-1" },
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

});