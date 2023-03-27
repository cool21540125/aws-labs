import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';

export class LabCdkRdsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // MySQL init password from Environment Variable
    const dbPassword = process.env.dbPassword?.toString()!;

    // VPC
    const vpc = new ec2.Vpc(this, 'Vpc27', {
      maxAzs: 2,
      natGateways: 0,
    });

    // RDS Security Group
    const rdsSg = new ec2.SecurityGroup(this, "RdsSecurity27", {
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
    const rdsInstance = new rds.DatabaseInstance(this, "MySqlInstance27", {
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
        // password: cdk.SecretValue.unsafePlainText("password"),  // @@ 應該有其他方式可以設定初始密碼吧!!
        password: cdk.SecretValue.unsafePlainText(dbPassword),
      },
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroups: [rdsSg],
      backupRetention: cdk.Duration.days(2),
      allowMajorVersionUpgrade: false,
      autoMinorVersionUpgrade: true,
      databaseName: "demo",  // Create DB when init
    });

    new cdk.CfnOutput(this, "CfnRds03272200", {
      value: rdsInstance.dbInstanceEndpointAddress,
    });
  }
}
