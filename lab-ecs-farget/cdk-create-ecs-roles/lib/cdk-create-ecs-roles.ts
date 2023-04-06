#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';

export class CdkEcsRoleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Task Execution Role
    const role1 = new iam.Role(this, 'ecsTaskExecutionRole2023r01', {
      assumedBy: new iam.CompositePrincipal(new iam.ServicePrincipal('ecs-tasks.amazonaws.com')),
      description: 'allow ECS Agent to use this Role to call ECS API',
      roleName: 'ecsTaskExecutionRole2023r01',
    });
    role1.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
    );

    // 2. ECS Instance Role
    const role2 = new iam.Role(this, 'ecsInstanceRole2023r02', {
      assumedBy: new iam.CompositePrincipal(new iam.ServicePrincipal('ec2.amazonaws.com')),
      description: 'allow ECS Agent in EC2 launch Type to call ECS API',
      roleName: 'ecsInstanceRole2023r02',
    });
    role2.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonEC2ContainerServiceforEC2Role')
    );

    // 3. ECS CodeDeploy Role
    const role3 = new iam.Role(this, 'ecsCodeDeployRole2023r03', {
      assumedBy: new iam.CompositePrincipal(new iam.ServicePrincipal('codedeploy.amazonaws.com')),
      description: 'allow CodeDeploy to use ECS API',
      roleName: 'ecsCodeDeployRole2023r03',
    });
    role3.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCodeDeployRoleForECS')
    );

    // 4. Service Linked Role for Amazon ECS
    // 信任 ecs.amazonaws.com 主體可以 assume the role
    // 讓 ECS 可藉由 'AWSServiceRoleForECS' 這個 service-linked role 去訪問 AWS APIs

    // 5. Service Linked Role for Amazone EC2 Auto Scaling
    // 信任 autoscaling.amazonaws.com 主體可以 assume the role
    // 讓 EC2 ASG 可藉由 'AWSServiceRoleForAutoScaling' 這個 service-linked role 去訪問 AWS APIs
  }
}
