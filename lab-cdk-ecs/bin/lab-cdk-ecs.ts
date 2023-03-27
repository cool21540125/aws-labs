#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecspt from 'aws-cdk-lib/aws-ecs-patterns';

class LabCdkEcsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, "ecsVpc", {
      maxAzs: 2,
      natGateways: 0,
    });

    const cluster = new ecs.Cluster(this, "EcsCluster0500", { vpc });
    const asg0500 = cluster.addCapacity("defaultAsgCapacity", {
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      minCapacity: 1,
      maxCapacity: 3,
      desiredCapacity: 1,
      machineImage: ecs.EcsOptimizedImage.amazonLinux2(),
      spotPrice: "0.005",
      spotInstanceDraining: true,
    });

    // 
    asg0500.scaleOnCpuUtilization("scalingByCpu0500", {
      targetUtilizationPercent: 80,
    });
  }
}

const app = new cdk.App();
new LabCdkEcsStack(app, 'LabCdkEcsStack', {

  env: { account: '668363134003', region: 'ap-northeast-2' },
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

});