#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkEcsRoleStack } from '../lib/cdk-create-ecs-roles';
import { CdkEcsRdsStack } from '../lib/cdk-create-rds-db';

const app = new cdk.App();

new CdkEcsRoleStack(app, 'CdkEcsRoleStack', {
  env: { account: '668363134003', region: 'us-east-1' },
  description: 'ECS workshop - roles',
});

// new CdkEcsRdsStack(app, 'CdkEcsRdsStack', {
//   env: { account: '668363134003', region: 'us-east-1' },
//   description: 'ECS workshop - rds',
// });
