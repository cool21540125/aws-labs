import * as cdk from "aws-cdk-lib";

import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as actions from "aws-cdk-lib/aws-cloudwatch-actions";

interface ConsumerProps extends cdk.StackProps {
  ecs_cluster: ecs.ICluster;
  ecs_taskdef: ecs.FargateTaskDefinition;
  ecs_sg: ec2.SecurityGroup;
  ecs_tg: elbv2.IApplicationTargetGroup;
  alb: elbv2.IApplicationLoadBalancer;
}

export class LabCdkEcsFargateService extends cdk.Stack {
  // constructor(scope: Construct, id: string, props?: cdk.StackProps) {
  constructor(scope: cdk.App, id: string, props: ConsumerProps) {
    super(scope, id, props);

    // ECS Service
    const flask_ecs_service = new ecs.FargateService(
      this,
      "flask_ecs_service",
      {
        serviceName: "flask_ecs_service",
        cluster: props.ecs_cluster,
        taskDefinition: props.ecs_taskdef,
        desiredCount: 1,
        assignPublicIp: true, // 若要 Public Access, 一定得 true
        securityGroups: [props.ecs_sg],
        healthCheckGracePeriod: cdk.Duration.seconds(10)
      }
    );
    cdk.Tags.of(flask_ecs_service).add("Name", "flask_ecs_service");
    cdk.Tags.of(flask_ecs_service).add("Usage", "devopstest");

    // Register ECS Service to TG: flask_ecs_tg
    props.ecs_tg.addTarget(flask_ecs_service);

    // Output
    new cdk.CfnOutput(this, "LoadBalancerDNS", {
      value: `${props.alb.loadBalancerDnsName}`
    });

    // // ================ 底下是在做 ECS ASG ================
    // // SNS Topic for notification
    // const cdk_sns_topic = new cdk.aws_sns.Topic(this, "cdk-sns-topic", {
    //   topicName: "cdk-email-notification-topic",
    //   fifo: false
    // });
    // cdk_sns_topic.addSubscription(
    //   new cdk.aws_sns_subscriptions.EmailSubscription("cool21540125@gmail.com")
    // );

    // // CloudWatch Alarm for ECS CPU - 15%
    // const ecs_cpu15_cwa = new cloudwatch.Alarm(this, "cdk-ecs-cpu15-alarm", {
    //   alarmName: `cdk-${flask_ecs_service}-CPU-15-alarm`,
    //   alarmDescription: "ECS CPU Utilization",
    //   actionsEnabled: true,
    //   comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    //   threshold: 15,
    //   metric: flask_ecs_service.metricCpuUtilization({
    //     period: cdk.Duration.minutes(1),
    //     statistic: "Maximum"
    //   }),
    //   evaluationPeriods: 1,
    //   datapointsToAlarm: 1,
    //   treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    // });
    // ecs_cpu15_cwa.addAlarmAction(new actions.SnsAction(cdk_sns_topic));
    // ecs_cpu15_cwa.addOkAction(new actions.SnsAction(cdk_sns_topic));

    // // CloudWatch Alarm for ECS CPU - 20%
    // const ecs_cpu20_cwa = new cloudwatch.Alarm(this, "cdk-ecs-cpu20-alarm", {
    //   alarmName: `cdk-${flask_ecs_service}-CPU-20-alarm`,
    //   alarmDescription: "ECS CPU Utilization",
    //   actionsEnabled: true,
    //   comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    //   threshold: 20,
    //   metric: flask_ecs_service.metricCpuUtilization({
    //     period: cdk.Duration.minutes(1),
    //     statistic: "Maximum"
    //   }),
    //   evaluationPeriods: 1,
    //   datapointsToAlarm: 1,
    //   treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    // });
    // ecs_cpu20_cwa.addAlarmAction(new actions.SnsAction(cdk_sns_topic));
    // ecs_cpu20_cwa.addOkAction(new actions.SnsAction(cdk_sns_topic));
  }
}
