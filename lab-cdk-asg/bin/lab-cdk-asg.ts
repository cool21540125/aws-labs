#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as asg from 'aws-cdk-lib/aws-autoscaling';

export class LabCdkAsgStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // from default VPC
    const vpc = ec2.Vpc.fromLookup(this, "defaultVpc", {
      isDefault: true
    });

    // from default SG
    const asgSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      "asgSecuritygroup0500",
      "sg-0074aabea1dd14fb5",  // 寫死!! Seoul default Vpc from existing default SG
    );

    // new ASG
    const asg0500 = new asg.AutoScalingGroup(this, 'Asg0500', {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2, ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      securityGroup: asgSecurityGroup,
      keyName: "key_seoul_4003",
      groupMetrics: [
        asg.GroupMetrics.all()
      ],
      minCapacity: 1,
      maxCapacity: 3,
      desiredCapacity: 1,
    });

    // Health check
    cdk.aws_autoscaling.HealthCheck.ec2({
      grace: cdk.Duration.seconds(30),
    });

    // autoscaling condition - by CPU
    asg0500.scaleOnCpuUtilization('byCpu0500', {
      targetUtilizationPercent: 80,
    });

    // autoscaling condition - by request (需要搭配 ALB 才能用)
    // asg0500.scaleOnRequestCount('byCpu0500', {
    //   targetRequestsPerMinute: 1200,
    // });
  }
}

const app = new cdk.App();
new LabCdkAsgStack(app, 'LabCdkAsgStack', {
  env: { account: '668363134003', region: 'ap-northeast-2' },
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
