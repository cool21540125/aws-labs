#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';

class CdkCreateEcsExecutionRoleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Role Named: ecsTaskExecutionRole
    const ecsNewRole = new iam.Role(this, 'ecsTaskExecutionRole20230329', {
      assumedBy: new iam.CompositePrincipal(new iam.ServicePrincipal('ecs-tasks.amazonaws.com')),
      description: 'allow ECS Agent to use this Role to call ECS API',
    });

    ecsNewRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
    );
  }
}

const app = new cdk.App();
new CdkCreateEcsExecutionRoleStack(app, 'CdkCreateEcsExecutionRoleStack', {
  
  env: { account: '668363134003', region: 'ap-northeast-2' },
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

});