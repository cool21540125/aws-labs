#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as asg from 'aws-cdk-lib/aws-autoscaling';
import * as ecspt from 'aws-cdk-lib/aws-ecs-patterns';

export class LabCdkEcsStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);
  
      // VPC
      const vpc = new ec2.Vpc(this, "ecsVpc", {
        maxAzs: 2,
        natGateways: 0,
      });
  
      // ASG - Security Group
      const asgSecurityGroup = new ec2.SecurityGroup(this, "AsgSecurityGroup28", {
        vpc,
        description: "ASG Security Group",
        allowAllOutbound: true,
      });
      asgSecurityGroup.addIngressRule(
        ec2.Peer.ipv4("0.0.0.0/0"),
        ec2.Port.tcp(80),
        "ALB SG all ALL 80"
      );
  
      // ASG in ECS Cluster
      const asg28 = new asg.AutoScalingGroup(this, "Asg28", {
        vpc,
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.BURSTABLE2,
          ec2.InstanceSize.MICRO),
        machineImage: new ec2.AmazonLinuxImage(),  // Latest AmazonLinux
        securityGroup: asgSecurityGroup,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PUBLIC,
        },
        keyName: "key_seoul_4003",  // 已存在的 EC2 Key Pair
        minCapacity: 1,
        maxCapacity: 3,
      });
      // // ASG - scaling by CPU
      asg28.scaleOnCpuUtilization("AsgScalingRuleByCpu", {
        targetUtilizationPercent: 70
      });
      // // ASG - scaling by networking
      // asg28.scaleOnIncomingBytes('LimitIngressPerInstance', {
      //   targetBytesPerSecond: 10 * 1024 * 1024 // 10 MB/s
      // });
  
      const cluster = new ecs.Cluster(this, "cdkDemoEcsCluster28", {
        vpc: vpc,
      });
  
      // ALB ECS
      const ecs28 = new ecspt.ApplicationLoadBalancedFargateService(this, "fargetEcs28", {
        cluster: cluster,
        cpu: 256,
        desiredCount: 2,
        taskImageOptions: {
          image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample")
        },
        memoryLimitMiB: 512,
        publicLoadBalancer: true,
      });
  
      // Output
      new cdk.CfnOutput(this, "EcsOutput28", {
        value: ecs28.loadBalancer.loadBalancerDnsName
      });
    }
  }