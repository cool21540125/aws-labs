import * as cdk from "aws-cdk-lib";

import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as actions from "aws-cdk-lib/aws-cloudwatch-actions";
import { Schedule } from "aws-cdk-lib/aws-events";
import { aws_applicationautoscaling as appscaling } from "aws-cdk-lib";

interface ConsumerProps extends cdk.StackProps {
  ecs_cluster: ecs.ICluster;
  ecs_taskdef: ecs.FargateTaskDefinition;
  ecs_sg: ec2.SecurityGroup;
  ecs_tg: elbv2.ApplicationTargetGroup;
  alb: elbv2.ApplicationLoadBalancer;
}

export class LabCdkEcsFargateService extends cdk.Stack {
  // constructor(scope: Construct, id: string, props?: cdk.StackProps) {
  constructor(scope: cdk.App, id: string, props: ConsumerProps) {
    super(scope, id, props);

    // ECS Service
    const poc_ecs_service = new ecs.FargateService(this, "poc_ecs_service", {
      cluster: props.ecs_cluster,
      serviceName: "poc_ecs_service",
      taskDefinition: props.ecs_taskdef,
      desiredCount: 1,
      assignPublicIp: true,
      securityGroups: [props.ecs_sg],
      healthCheckGracePeriod: cdk.Duration.seconds(10),
      enableECSManagedTags: true,
      enableExecuteCommand: true
    });
    cdk.Tags.of(poc_ecs_service).add("Name", "poc_ecs_service");
    cdk.Tags.of(poc_ecs_service).add("Usage", "devopstest");
    cdk.Tags.of(poc_ecs_service).add("SRE_COST_SAVING", "true");
    cdk.Tags.of(poc_ecs_service).add("SRE_EXPECTED_START", "09:00");
    cdk.Tags.of(poc_ecs_service).add("SRE_EXPECTED_STOP", "18:00");

    // Register ECS Service to TG: flask_ecs_tg
    props.ecs_tg.addTarget(poc_ecs_service);

    // Output
    new cdk.CfnOutput(this, "LoadBalancerDNS", {
      value: `${props.alb.loadBalancerDnsName}`
    });

    // ================================ ECS - ASG L2 作法 ================================
    // const ecsScaling = poc_ecs_service.autoScaleTaskCount({
    //   minCapacity: 1,
    //   maxCapacity: 3
    // });

    // ecsScaling.scaleOnCpuUtilization("Cpu", {
    //   policyName: "CPUUtilizationPolicy",
    //   disableScaleIn: false,
    //   scaleInCooldown: cdk.Duration.seconds(300),
    //   scaleOutCooldown: cdk.Duration.seconds(300),
    //   targetUtilizationPercent: 60
    // });
    // ecsScaling.scaleOnMemoryUtilization("Memory", {
    //   policyName: "MemoryUtilizationPolicy",
    //   disableScaleIn: true,
    //   scaleInCooldown: cdk.Duration.seconds(300),
    //   scaleOutCooldown: cdk.Duration.seconds(300),
    //   targetUtilizationPercent: 60
    // });
    // ecsScaling.scaleOnRequestCount("Request", {
    //   policyName: "RequestCountPerTargetPolicy",
    //   disableScaleIn: false,
    //   scaleInCooldown: cdk.Duration.seconds(300),
    //   scaleOutCooldown: cdk.Duration.seconds(300),
    //   requestsPerTarget: 200,
    //   targetGroup: props.ecs_tg
    // });

    // Scheduled Scaling
    // 此為 L2 的做法只能一律使用 UTC, 若要變更 timezone, 則需要使用 L1
    //   https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_applicationautoscaling.CfnScalableTarget.html
    // ecsScaling.scaleOnSchedule("PocScheduledScalingScaleIn", {
    //   schedule: Schedule.cron({ hour: "10", minute: "40" }), // 18:40 關閉
    //   minCapacity: 0,
    //   maxCapacity: 0
    // });
    // ecsScaling.scaleOnSchedule("PocScheduledScalingScaleOut", {
    //   schedule: Schedule.cron({ hour: "1", minute: "45" }), // 10:00 開啟
    //   minCapacity: 1,
    //   maxCapacity: 3
    // });

    // ================================ ECS - ASG L1 作法 ================================

    // // 此為 L1
    const ecs_service_id = `service/${props.ecs_cluster
      .clusterName}/${poc_ecs_service.serviceName}`;

    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_applicationautoscaling.CfnScalingPolicy.html#targettrackingscalingpolicyconfiguration
    // new appscaling.CfnScalingPolicy(this, "ScalePolicy", { // TODO: L1 的 Service auto scaling - Scaling Policy 未完成
    //   policyName: "policyName",
    //   policyType: "policyType",
    //   resourceId: ecs_service_id,
    //   scalableDimension: "ecs:service:DesiredCount"
    //   // predictiveScalingPolicyConfiguration: {},
    //   // stepScalingPolicyConfiguration: {},
    //   // targetTrackingScalingPolicyConfiguration: {}
    // });
    // new appscaling.CfnScalableTarget(this, "CfnScaling", {
    //   maxCapacity: 3,
    //   minCapacity: 1,
    //   resourceId: ecs_service_id,
    //   scalableDimension: "ecs:service:DesiredCount",
    //   serviceNamespace: "ecs",
    //   scheduledActions: [
    //     {
    //       schedule: "cron(30 9 * * ? *)",
    //       scheduledActionName: "WorkingTime",
    //       scalableTargetAction: {
    //         minCapacity: 1,
    //         maxCapacity: 1
    //       },
    //       timezone: "Asia/Taipei"
    //     },
    //     {
    //       schedule: "cron(0 18 * * ? *)",
    //       scheduledActionName: "OffDutyHours",
    //       scalableTargetAction: {
    //         minCapacity: 0,
    //         maxCapacity: 0
    //       },
    //       timezone: "Asia/Taipei"
    //     }
    //   ],
    //   suspendedState: {
    //     dynamicScalingInSuspended: false,
    //     dynamicScalingOutSuspended: false,
    //     scheduledScalingSuspended: false
    //   }
    // });

    // // ================ ECS - CloudWatch Alarm ================
    // // SNS Topic
    // const sre_poc_sns_topic = new cdk.aws_sns.Topic(this, "sre_poc_sns_topic", {
    //   topicName: "sre_poc_sns_topic",
    //   fifo: false
    // });
    // sre_poc_sns_topic.addSubscription(
    //   new cdk.aws_sns_subscriptions.EmailSubscription("cool21540125@gmail.com")
    // );

    // // CloudWatch Alarm for ECS CPUUtilization
    // const sre_poc_cpu_alarm = new cloudwatch.Alarm(this, "sre_poc_cpu_alarm", {
    //   alarmName: `sre_poc_ecs_${poc_ecs_service}_cpu_alarm`,
    //   alarmDescription: "ECS CPU Utilization",
    //   actionsEnabled: true,
    //   comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    //   threshold: 60,
    //   metric: poc_ecs_service.metricCpuUtilization({
    //     period: cdk.Duration.minutes(1),
    //     statistic: "Maximum"
    //   }),
    //   evaluationPeriods: 1,
    //   datapointsToAlarm: 1,
    //   treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    // });
    // sre_poc_cpu_alarm.addAlarmAction(new actions.SnsAction(sre_poc_sns_topic));
    // sre_poc_cpu_alarm.addOkAction(new actions.SnsAction(sre_poc_sns_topic));
  }
}
