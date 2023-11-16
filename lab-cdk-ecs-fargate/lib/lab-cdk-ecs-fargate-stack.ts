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
    const ecr2311 = new ecr.Repository(this, "ecr2311", {
      repositoryName: "ecr2311",
      // removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // VPC
    const vpc2311 = new ec2.Vpc(this, 'vpc2311', {
      vpcName: "vpc2311",
      maxAzs: 2,
      natGateways: 0,
    });

    // ECS Cluster
    const cluster2311 = new ecs.Cluster(this, "cluster2311", {
      clusterName: "cluster2311",
      vpc: vpc2311,
    });

    const ecsTaskExecutionRole = new iam.Role(this, "ecsTaskExecutionRole", {
      roleName: "ecsTaskExecutionRole",
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AmazonECSTaskExecutionRolePolicy"),
      ],
    });

    // Task Definition
    const taskDefinition2311 = new ecs.FargateTaskDefinition(this, "taskDefinition2311", {
      memoryLimitMiB: 512,
      cpu: 256,
      executionRole: ecsTaskExecutionRole,
    });

    // Container in Task Definition
    const container = taskDefinition2311.addContainer("container2311", {
      image: ecs.ContainerImage.fromRegistry(ecr2311.repositoryUri),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: "conatinerLog2311" }),
    });
    container.addPortMappings({
      containerPort: 3000,
    });

    // Security Group
    const sssgg = new ec2.SecurityGroup(this, "ecsServiceSecurityGroup", {
      vpc: vpc2311,
      securityGroupName: "ecsSg2311",
    });

    // Add Tag to sssgg
    cdk.Tags.of(sssgg).add("Name", "ecsSg2311");

    sssgg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), "allow 80 port");

    // Target Group for ALB
    const tttg = new elbv2.ApplicationTargetGroup(this, "tg2311", {
      targetGroupName: "tg2311",
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      vpc: vpc2311,
      targetType: elbv2.TargetType.IP,
    });

    // ALB
    const aaalb = new elbv2.ApplicationLoadBalancer(this, "alb2311", {
      loadBalancerName: "alb2311",
      vpc: vpc2311,
      internetFacing: true,
      securityGroup: sssgg,
    });
    // const lllistener = aaalb.addListener("listener2311", {
    //   port: 80,
    // });

    // Listenr + register Target Group
    // lllistener.addTargetGroups("targetGroup2311", {
    //   targetGroups: [tttg],
    // });

    // ECS Service
    // const ecsServiceee = new ecs.FargateService(this, "service2311", {
    //   serviceName: "service2311",
    //   cluster: cluster2311,
    //   taskDefinition: taskDefinition2311,
    //   desiredCount: 1,
    //   assignPublicIp: false,
    //   healthCheckGracePeriod: cdk.Duration.seconds(60),
    // });

    // // Auto Scaling
    // const asg2311 = ecsServiceee.autoScaleTaskCount({ maxCapacity: 3, minCapacity: 1 });
    // asg2311.scaleOnCpuUtilization("CpuScaling", {
    //   targetUtilizationPercent: 80,
    //   scaleInCooldown: cdk.Duration.seconds(60),
    //   scaleOutCooldown: cdk.Duration.seconds(60),
    // });

    // tttg.addTarget(ecsServiceee);

    // // Listener all port open
    // lllistener.connections.allowDefaultPortFromAnyIpv4("Open to the world");

    // Output
    new cdk.CfnOutput(this, "LoadBalancerDNS", {
      value: aaalb.loadBalancerDnsName,
    });
  }
}
