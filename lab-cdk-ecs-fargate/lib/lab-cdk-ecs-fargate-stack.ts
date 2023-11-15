import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr from "aws-cdk-lib/aws-ecr";

import * as ec2 from 'aws-cdk-lib/aws-ec2';
// import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";


export class LabCdkEcsFargateStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ECR
    const ecr2311 = new ecr.Repository(this, "ecr2311", {
      repositoryName: "ecr2311",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // VPC
    const vpc2311 = new ec2.Vpc(this, 'vpc2311', {
      maxAzs: 2,
      natGateways: 0,
    });

    // ECS Cluster
    const cluster2311 = new ecs.Cluster(this, "cluster2311", {
      clusterName: "cluster2311",
      vpc: vpc2311,
    });
    
    // ECS Fargate
    // new ecs_patterns.ApplicationLoadBalancedFargateService(this, "ecsFargate2311", {
    //   cluster: cluster2311,
    //   cpu: 256,
    //   memoryLimitMiB: 512,
    //   desiredCount: 1,
    //   taskImageOptions: {
    //     image: ecs.ContainerImage.fromRegistry(ecr2311.repositoryName),
    //     containerPort: 80,
    //   },
    //   publicLoadBalancer: true,
    // });
  }
}
