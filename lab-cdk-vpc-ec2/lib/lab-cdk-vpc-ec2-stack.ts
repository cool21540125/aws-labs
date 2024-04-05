import { readFileSync } from 'fs';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';

export class LabCdkVpcEc2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, 'cdk-vpc', {
      natGateways: 0,
    });

    // EC2 misc
    const amiLinux2 = new ec2.AmazonLinuxImage({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      cpuType: ec2.AmazonLinuxCpuType.X86_64,
    });
    const key0 = new ec2.CfnKeyPair(this, "cdk-ec2-key", {
      keyName: "mac13-24a",  // NOTE: Already created
    })

    // Security Group
    const sg01 = new ec2.SecurityGroup(this, "cdk-sg-my-ip", {
      vpc,
      description: "Allow 22 & 80",
      allowAllOutbound: true,
    });
    sg01.addIngressRule(
      ec2.Peer.ipv4(`${process.env['MyIP']}/32`), ec2.Port.tcp(22), 'allow MyIP ssh',
    );
    sg01.addIngressRule(
      // ec2.Peer.ipv4(`${process.env['MyIP']}/32`), ec2.Port.tcp(80), 'allow MyIP http',
      ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'allow all IP access http',
    );

    // EC2 Instance
    const ec2Instance = new ec2.Instance(this, "cdk-ec2", {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: amiLinux2,
      securityGroup: sg01,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      keyName: key0.keyName,
      // role: role35,
    });

    // FIXME: 仍需要有 arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy
    // EC2 Instance Role (為了要能用 SSM login)
    ec2Instance.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "ssmmessages:*",
          "ssm:UpdateInstanceInformation",
          "ec2messages:*",
        ],
        resources: ["*"],
      })
    );

    // EC2 userdata (!! 需要先把機器 Terminate 再來重建才有效果)
    const webSGUserData = readFileSync('./init/init.sh','utf-8');
    ec2Instance.addUserData(webSGUserData);
  }
}
