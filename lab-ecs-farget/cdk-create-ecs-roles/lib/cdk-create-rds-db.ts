#!/usr/bin/env node
import 'source-map-support/register';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';

export class LabCdkRdsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // MySQL init password from Environment Variable
    const dbPassword = process.env.dbPassword?.toString()!;

    // VPC
    const vpc = new ec2.Vpc(this, 'Vpc06', {
      maxAzs: 2,
      natGateways: 0,
    });

    // RDS Security Group
    const rdsSg = new ec2.SecurityGroup(this, "RdsSecurity06", {
      vpc,
      description: "RDS in this VPC",
      // allowAllOutbound: true,
    });
    rdsSg.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3306),
      "Allow public access to MySQL"
    );

    // RDS Instance
    const rdsInstance = new rds.DatabaseInstance(this, "MySqlInstance06", {
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0,
      }),
      vpc,
      deleteAutomatedBackups: false,  // 刪除前 Backup
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      allocatedStorage: 10,
      credentials: {
        username: "admin",
        password: cdk.SecretValue.unsafePlainText("mysql123"),
      },
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroups: [rdsSg],
      backupRetention: cdk.Duration.days(2),
      allowMajorVersionUpgrade: false,
      autoMinorVersionUpgrade: true,
      databaseName: "tripmgmt",  // Create DB when init
    });

    new cdk.CfnOutput(this, "CfnRds04062330", {
      value: rdsInstance.dbInstanceEndpointAddress,
    });
  }
}
