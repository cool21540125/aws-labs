#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LabCdkEcsFargateStack } from '../lib/lab-cdk-ecs-fargate-stack';

const app = new cdk.App();

new LabCdkEcsFargateStack(app, 'LabCdkEcsFargateStack', {
});
