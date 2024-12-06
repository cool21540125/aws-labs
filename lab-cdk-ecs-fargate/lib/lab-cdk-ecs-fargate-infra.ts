import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import * as iam from "aws-cdk-lib/aws-iam";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";

export class LabCdkEcsFargateInfra extends cdk.Stack {
  public readonly ecsCluster: ecs.Cluster;
  public readonly ecsTaskDef: ecs.FargateTaskDefinition;
  public readonly ecsSg: ec2.SecurityGroup;
  public readonly ecsTg: elbv2.ApplicationTargetGroup;
  public readonly alb: elbv2.ApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ECR
    const sre_poc_flask_repo = new ecr.Repository(this, "sre_poc_flask_repo", {
      repositoryName: "sre-poc-flask-app",
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
    cdk.Tags.of(sre_poc_flask_repo).add("Name", "sre-poc-flask-app");
    cdk.Tags.of(sre_poc_flask_repo).add("SreNote", "SrePocTest");

    // VPC
    const sre_poc_vpc = new ec2.Vpc(this, "sre_poc_vpc", {
      vpcName: "sre_poc_vpc",
      maxAzs: 2,
      natGateways: 0
    });
    cdk.Tags.of(sre_poc_vpc).add("Name", "sre_poc_vpc");
    cdk.Tags.of(sre_poc_vpc).add("SreNote", "SrePocTest");

    // ECS Cluster
    const sre_poc_cluster = new ecs.Cluster(this, "sre_poc_cluster", {
      clusterName: "sre_poc_cluster",
      vpc: sre_poc_vpc
    });
    cdk.Tags.of(sre_poc_cluster).add("Name", "sre_poc_cluster");
    cdk.Tags.of(sre_poc_cluster).add("SreNote", "SrePocTest");

    // ECS Task Execution Role for task-definition.json
    const sre_poc_ecs_task_execution_role = new iam.Role(
      this,
      "sre_poc_ecs_task_execution_role",
      {
        roleName: "sre_poc_ecs_task_execution_role",
        assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AmazonECSTaskExecutionRolePolicy"
          )
        ]
      }
    );
    cdk.Tags
      .of(sre_poc_ecs_task_execution_role)
      .add("Name", "sre_poc_ecs_task_execution_role");
    cdk.Tags.of(sre_poc_ecs_task_execution_role).add("SreNote", "SrePocTest");

    // Task Definition
    const sre_poc_taskdef = new ecs.FargateTaskDefinition(
      this,
      "sre_poc_taskdef",
      {
        family: "sre_poc_taskdef",
        cpu: 256,
        memoryLimitMiB: 512,
        executionRole: sre_poc_ecs_task_execution_role
      }
    );
    cdk.Tags.of(sre_poc_taskdef).add("Name", "sre_poc_taskdef");
    cdk.Tags.of(sre_poc_taskdef).add("SreNote", "SrePocTest");

    // Task Definition - Container
    const sre_poc_container = sre_poc_taskdef.addContainer("web-api", {
      containerName: "web-api",
      image: ecs.ContainerImage.fromRegistry(sre_poc_flask_repo.repositoryUri),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: "SrePoc",
        logRetention: 3
      }),
      essential: true,
      cpu: 256,
      environment: {
        FLASK_PORT: "5000"
      }
    });
    sre_poc_container.addPortMappings({
      containerPort: 5000,
      name: "sre-poc-flask"
    });

    // SG - ALB
    const sre_poc_alb_sg = new ec2.SecurityGroup(this, "sre_poc_alb_sg", {
      vpc: sre_poc_vpc,
      securityGroupName: "sre-poc-alb-sg"
    });
    cdk.Tags.of(sre_poc_alb_sg).add("Name", "sre-poc-alb-sg");
    cdk.Tags.of(sre_poc_alb_sg).add("SreNote", "SrePocTest");
    sre_poc_alb_sg.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      "allow 80 port"
    );

    // SG - ECS
    const sre_poc_ecs_sg = new ec2.SecurityGroup(this, "sre_poc_ecs_sg", {
      vpc: sre_poc_vpc,
      securityGroupName: "sre-poc-ecs-sg"
    });
    cdk.Tags.of(sre_poc_ecs_sg).add("Name", "sre-poc-ecs-sg");
    cdk.Tags.of(sre_poc_ecs_sg).add("SreNote", "SrePocTest");
    sre_poc_ecs_sg.addIngressRule(
      sre_poc_alb_sg,
      ec2.Port.tcp(5000),
      "allow 5000 port"
    );

    // ALB
    const sre_poc_alb = new elbv2.ApplicationLoadBalancer(this, "sre_poc_alb", {
      loadBalancerName: "SrePocAlb",
      vpc: sre_poc_vpc,
      internetFacing: true,
      securityGroup: sre_poc_alb_sg
    });
    cdk.Tags.of(sre_poc_alb).add("Name", "SrePocAlb");
    cdk.Tags.of(sre_poc_alb).add("SreNote", "SrePocTest");

    // TG for ALB
    const sre_poc_tg = new elbv2.ApplicationTargetGroup(this, "sre_poc_tg", {
      targetGroupName: "sre-poc-tg",
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      vpc: sre_poc_vpc,
      targetType: elbv2.TargetType.IP
    });
    cdk.Tags.of(sre_poc_tg).add("Name", "sre-poc-tg");
    cdk.Tags.of(sre_poc_tg).add("SreNote", "SrePocTest");

    // Listenr + register TG
    const sre_poc_listener = sre_poc_alb.addListener("sre_poc_listener", {
      // listener + default rule
      port: 80,
      defaultAction: elbv2.ListenerAction.fixedResponse(200, {
        contentType: "text/plain",
        messageBody: "OK"
      })
    });
    sre_poc_listener.addAction("sre_poc_tg", {
      // listener rule
      action: elbv2.ListenerAction.forward([sre_poc_tg]),
      priority: 100,
      conditions: [elbv2.ListenerCondition.pathPatterns(["/"])]
    });

    this.ecsCluster = sre_poc_cluster;
    this.ecsTaskDef = sre_poc_taskdef;
    this.ecsSg = sre_poc_ecs_sg;
    this.ecsTg = sre_poc_tg;
    this.alb = sre_poc_alb;
  }
}
