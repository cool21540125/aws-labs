#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkCodecommitPrCodebuildStack } from '../lib/cdk-codecommit-pr-codebuild-stack';

const app = new cdk.App();
new CdkCodecommitPrCodebuildStack(app, 'CdkCodecommitPrCodebuildStack', {
  env: { account: process.env.AWS_ACCOUNT, region: process.env.AWS_REGION },
});