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
    const cdk_ecr_flask_repo = new ecr.Repository(this, "cdk_ecr_flask_repo", {
      repositoryName: "flask-app",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    cdk.Tags.of(cdk_ecr_flask_repo).add("Name", "flask-app");
    cdk.Tags.of(cdk_ecr_flask_repo).add("Usage", "devopstest");


    // VPC
    const cdk_flask_vpc = new ec2.Vpc(this, 'cdk_flask_vpc', {
      vpcName: "cdk_flask_vpc",
      maxAzs: 2,
      natGateways: 0,
    });
    cdk.Tags.of(cdk_flask_vpc).add("Name", "cdk_flask_vpc");
    cdk.Tags.of(cdk_flask_vpc).add("Usage", "devopstest");


    // ECS Cluster
    const cdk_flask_ecs_cluster = new ecs.Cluster(this, "cdk_flask_ecs_cluster", {
      clusterName: "cdk_flask_ecs_cluster",
      vpc: cdk_flask_vpc,
    });
    cdk.Tags.of(cdk_flask_ecs_cluster).add("Name", "cdk_flask_ecs_cluster");
    cdk.Tags.of(cdk_flask_ecs_cluster).add("Usage", "devopstest");


    // ECS Task Execution Role for task-definition.json
    const cdk_ecs_task_execution_role = new iam.Role(this, "cdk_ecs_task_execution_role", {
      roleName: "cdk_ecs_task_execution_role",
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AmazonECSTaskExecutionRolePolicy"),
      ],
    });
    cdk.Tags.of(cdk_ecs_task_execution_role).add("Name", "cdk_ecs_task_execution_role");
    cdk.Tags.of(cdk_ecs_task_execution_role).add("Usage", "devopstest");


    // Task Definition
    const cdk_flask_task_definition = new ecs.FargateTaskDefinition(this, "cdk_flask_task_definition", {
      family: "cdk_flask_task_definition",
      cpu: 256,
      memoryLimitMiB: 512,
      executionRole: cdk_ecs_task_execution_role,
    });
    cdk.Tags.of(cdk_flask_task_definition).add("Name", "cdk_flask_task_definition");
    cdk.Tags.of(cdk_flask_task_definition).add("Usage", "devopstest");

    // Task Definition - Container
    const cdk_ecs_container = cdk_flask_task_definition.addContainer("web-api", {
      containerName: "web-api",
      image: ecs.ContainerImage.fromRegistry(cdk_ecr_flask_repo.repositoryUri),
      logging: ecs.LogDrivers.awsLogs({ 
        streamPrefix: "/logEcs",
        logRetention: 3,
      }),
      essential: true,
      cpu: 256,
      environment: {
        "FLASK_PORT": "5000",
      },
    });
    cdk_ecs_container.addPortMappings({
      containerPort: 5000,
      hostPort: 5000,
      name: "cdk-fargate-port-mapping-to-flask",
    });


    // SG - ALB
    const flask_alb_sg = new ec2.SecurityGroup(this, "flask_alb_sg", {
      vpc: cdk_flask_vpc,
      securityGroupName: "flask-alb-sg",
    });
    cdk.Tags.of(flask_alb_sg).add("Name", "flask-alb-sg");
    cdk.Tags.of(flask_alb_sg).add("Usage", "devopstest");
    flask_alb_sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), "allow 80 port");


    // SG - ECS
    const flask_ecs_sg = new ec2.SecurityGroup(this, "ecsServiceSecurityGroupEni", {
      vpc: cdk_flask_vpc,
      securityGroupName: "flask-ecs-sg",
    });
    cdk.Tags.of(flask_ecs_sg).add("Name", "flask-ecs-sg");
    cdk.Tags.of(flask_ecs_sg).add("Usage", "devopstest");
    flask_ecs_sg.addIngressRule(flask_alb_sg, ec2.Port.tcp(5000), "allow 5000 port");


    // ALB
    const flask_ecs_alb = new elbv2.ApplicationLoadBalancer(this, "flask_ecs_alb", {
      loadBalancerName: "flask-ecs-alb",
      vpc: cdk_flask_vpc,
      internetFacing: true,
      securityGroup: flask_alb_sg,
    });
    cdk.Tags.of(flask_ecs_alb).add("Name", "flask-ecs-alb");
    cdk.Tags.of(flask_ecs_alb).add("Usage", "devopstest");


    // TG for ALB
    const flask_ecs_tg = new elbv2.ApplicationTargetGroup(this, "flask_ecs_tg", {
      targetGroupName: "flask-ecs-tg",
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      vpc: cdk_flask_vpc,
      targetType: elbv2.TargetType.IP,
    });
    cdk.Tags.of(flask_ecs_tg).add("Name", "flask-ecs-tg");
    cdk.Tags.of(flask_ecs_tg).add("Usage", "devopstest");


    // Listenr + register TG
    const alb_listener = flask_ecs_alb.addListener("alb_listener", { // listener + default rule
      port: 80,
      defaultAction: elbv2.ListenerAction.fixedResponse(200, {
        contentType: "text/plain",
        messageBody: "OK",
      }),
    });
    alb_listener.addAction("flask_ecs_tg", {  // listener rule
      action: elbv2.ListenerAction.forward([flask_ecs_tg]),
      priority: 100,
      conditions: [
        elbv2.ListenerCondition.hostHeaders(["flask.tonychoucc.com"]),
      ],
    });


    // =========== 需要先上傳 ECR image 才能執行下面動作 ===========


    // ECS Service
    const flask_ecs_service = new ecs.FargateService(this, "flask_ecs_service", {
      serviceName: "flask_ecs_service",
      cluster: cdk_flask_ecs_cluster,
      taskDefinition: cdk_flask_task_definition,
      desiredCount: 1,
      assignPublicIp: true,
      securityGroups: [flask_ecs_sg],
      healthCheckGracePeriod: cdk.Duration.seconds(10),
    });
    cdk.Tags.of(flask_ecs_service).add("Name", "flask_ecs_service");
    cdk.Tags.of(flask_ecs_service).add("Usage", "devopstest");

    // Register ECS Service to TG: flask_ecs_tg
    flask_ecs_tg.addTarget(flask_ecs_service);


    // Output
    new cdk.CfnOutput(this, "LoadBalancerDNS", {
      value: flask_ecs_alb.loadBalancerDnsName,
    });
  }
}
