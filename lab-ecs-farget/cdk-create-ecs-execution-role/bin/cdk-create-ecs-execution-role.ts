#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';

class CdkCreateEcsExecutionRoleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create TaskExecutionRole Named: ecsTaskExecutionRole2023cdk
    const role1 = new iam.Role(this, 'ecsTaskExecutionRole2023', {
      assumedBy: new iam.CompositePrincipal(new iam.ServicePrincipal('ecs-tasks.amazonaws.com')),
      description: 'allow ECS Agent to use this Role to call ECS API',
      roleName: 'ecsTaskExecutionRole2023r01',
    });
    role1.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
    );

    // Create EcsInstanceRole Named: ecsInstanceRole2023cdk
    const role2 = new iam.Role(this, 'ecsInstanceRole2023', {
      assumedBy: new iam.CompositePrincipal(new iam.ServicePrincipal('ecs-tasks.amazonaws.com')),
      description: 'allow ECS Agent in EC2 launch Type to call ECS API',
      roleName: 'ecsInstanceRole2023r02',
    });
    role2.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonEC2ContainerServiceforEC2Role')
    );

    // Create EcsCodeDeployRole Named: ecsCodeDeployRole2023cdk
    const role3 = new iam.Role(this, 'ecsCodeDeployRole2023', {
      assumedBy: new iam.CompositePrincipal(new iam.ServicePrincipal('ecs-tasks.amazonaws.com')),
      description: 'allow ECS Agent in EC2 launch Type to call ECS API',
      roleName: 'ecsCodeDeployRole2023r03',
    });

    // 
  }
}

const app = new cdk.App();
new CdkCreateEcsExecutionRoleStack(app, 'CdkCreateEcsExecutionRoleStack', {
  
  env: { account: '668363134003', region: 'us-east-1' },
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

});