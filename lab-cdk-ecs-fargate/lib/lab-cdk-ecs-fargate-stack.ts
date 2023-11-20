import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as iam from "aws-cdk-lib/aws-iam";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';


export class LabCdkEcsFargateStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ECR
    const ecrForLineBotFlaskApp = new ecr.Repository(this, "ecrForLineBotFlaskApp", {
      repositoryName: "ecr-for-linebot-flask-app",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    cdk.Tags.of(ecrForLineBotFlaskApp).add("Name", "ecrForLineBotFlaskApp");
    cdk.Tags.of(ecrForLineBotFlaskApp).add("Usage", "devopstest");


    // VPC
    const vpcForLineBotEcs = new ec2.Vpc(this, 'vpcForLineBotEcs', {
      vpcName: "vpcForLineBotEcs",
      maxAzs: 2,
      natGateways: 0,
    });
    cdk.Tags.of(vpcForLineBotEcs).add("Name", "vpcForLineBotEcs");
    cdk.Tags.of(vpcForLineBotEcs).add("Usage", "devopstest");


    // ECS Cluster
    const ecsClusterForLineBot = new ecs.Cluster(this, "ecsClusterForLineBot", {
      clusterName: "ecsClusterForLineBot",
      vpc: vpcForLineBotEcs,
    });
    cdk.Tags.of(ecsClusterForLineBot).add("Name", "ecsClusterForLineBot");
    cdk.Tags.of(ecsClusterForLineBot).add("Usage", "devopstest");


    // ECS Task Execution Role for task-definition.json
    const ecsTaskExecutionRole = new iam.Role(this, "ecsTaskExecutionRole", {
      roleName: "ecsTaskExecutionRole",
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AmazonECSTaskExecutionRolePolicy"),
      ],
    });
    cdk.Tags.of(ecsTaskExecutionRole).add("Name", "ecsTaskExecutionRole");
    cdk.Tags.of(ecsTaskExecutionRole).add("Usage", "devopstest");


    // Task Definition
    const taskDefLineBotFlask = new ecs.FargateTaskDefinition(this, "taskDefLineBotFlask", {
      family: "taskDefLineBotFlask",
      cpu: 1024,
      memoryLimitMiB: 2048,
      executionRole: ecsTaskExecutionRole,
    });
    cdk.Tags.of(taskDefLineBotFlask).add("Name", "taskDefLineBotFlask");
    cdk.Tags.of(taskDefLineBotFlask).add("Usage", "devopstest");

    // Task Definition - Container
    const ecsContainer = taskDefLineBotFlask.addContainer("web-api", {
      containerName: "web-api",
      image: ecs.ContainerImage.fromRegistry(ecrForLineBotFlaskApp.repositoryUri),
      logging: ecs.LogDrivers.awsLogs({ 
        streamPrefix: "/logEcs",
        logRetention: 3,
      }),
      essential: true,
      cpu: 1024,
      environment: {
        "FLASK_PORT": "5000",
      },
    });
    ecsContainer.addPortMappings({
      containerPort: 5000,
      hostPort: 5000,
      name: "fargate-port-mapping-to-flask-app",
    });


    // SG - ALB
    const albSGLineBot = new ec2.SecurityGroup(this, "albSGLineBot", {
      vpc: vpcForLineBotEcs,
      securityGroupName: "albSGLineBot",
    });
    cdk.Tags.of(albSGLineBot).add("Name", "albSGLineBot");
    cdk.Tags.of(albSGLineBot).add("Usage", "devopstest");
    albSGLineBot.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), "allow 80 port");


    // SG - ECS
    const ecsSgLineBot = new ec2.SecurityGroup(this, "ecsServiceSecurityGroupEni", {
      vpc: vpcForLineBotEcs,
      securityGroupName: "ecsSgLineBot",
    });
    cdk.Tags.of(ecsSgLineBot).add("Name", "ecsSgLineBot");
    cdk.Tags.of(ecsSgLineBot).add("Usage", "devopstest");
    ecsSgLineBot.addIngressRule(albSGLineBot, ec2.Port.tcp(5000), "allow 5000 port");


    // ALB
    const albToEcsFlaskBot = new elbv2.ApplicationLoadBalancer(this, "albToEcsFlaskBot", {
      loadBalancerName: "albToEcsFlaskBot",
      vpc: vpcForLineBotEcs,
      internetFacing: true,
      securityGroup: albSGLineBot,
    });
    cdk.Tags.of(albToEcsFlaskBot).add("Name", "albToEcsFlaskBot");
    cdk.Tags.of(albToEcsFlaskBot).add("Usage", "devopstest");


    // TG for ALB
    const tgForAlbToEcs = new elbv2.ApplicationTargetGroup(this, "tgForAlbToEcs", {
      targetGroupName: "tgForAlbToEcs",
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      vpc: vpcForLineBotEcs,
      targetType: elbv2.TargetType.IP,
    });
    cdk.Tags.of(tgForAlbToEcs).add("Name", "tgForAlbToEcs");
    cdk.Tags.of(tgForAlbToEcs).add("Usage", "devopstest");


    // Listenr + register TG
    const listenerForAlb = albToEcsFlaskBot.addListener("listenerForAlb", {
      port: 80,
      defaultTargetGroups: [tgForAlbToEcs],
    });


    // =========== 需要先上傳 ECR image 才能執行下面動作 ===========


    // ECS Service
    const ecsServiceLineBot = new ecs.FargateService(this, "ecsServiceLineBot", {
      serviceName: "ecsServiceLineBot",
      cluster: ecsClusterForLineBot,
      taskDefinition: taskDefLineBotFlask,
      desiredCount: 1,
      assignPublicIp: true,
      securityGroups: [ecsSgLineBot],
      healthCheckGracePeriod: cdk.Duration.seconds(10),
    });
    cdk.Tags.of(ecsServiceLineBot).add("Name", "ecsServiceLineBot");
    cdk.Tags.of(ecsServiceLineBot).add("Usage", "devopstest");


    // Register ECS Service to TG: tgForAlbToEcs
    tgForAlbToEcs.addTarget(ecsServiceLineBot);


    // Output
    new cdk.CfnOutput(this, "LoadBalancerDNS", {
      value: albToEcsFlaskBot.loadBalancerDnsName,
    });
  }
}
