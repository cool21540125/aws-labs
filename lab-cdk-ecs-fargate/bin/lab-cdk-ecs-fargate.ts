#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { LabCdkEcsFargateInfra } from "../lib/lab-cdk-ecs-fargate-infra";
import { LabCdkEcsFargateService } from "../lib/lab-cdk-ecs-fargate-service";

const app = new cdk.App();

const infra = new LabCdkEcsFargateInfra(app, "LabCdkEcsFargateInfra", {});
new LabCdkEcsFargateService(app, "LabCdkEcsFargateService", {
  ecs_cluster: infra.ecsCluster,
  ecs_taskdef: infra.ecsTaskDef,
  ecs_sg: infra.ecsSg,
  ecs_tg: infra.ecsTg,
  alb: infra.alb
});
