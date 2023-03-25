#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { MyWidgetServiceStack } from '../lib/my_widget_service-stack';

const app = new cdk.App();
new MyWidgetServiceStack(app, 'MyWidgetServiceStack', {
  
  env: { account: "668363134003", region: "us-east-2" },
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

});