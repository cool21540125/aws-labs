import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';

export class LabCdkVpcEc2Stack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, 'VPC0325', {
      natGateways: 0,
    });

    // EC2 misc
    const ami88 = new ec2.AmazonLinuxImage({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      cpuType: ec2.AmazonLinuxCpuType.X86_64,
    });
    const key99 = new ec2.CfnKeyPair(this, "KeyPair99", {
      keyName: "cdk-keypair99",
    })
    // @@ 即使這樣聲明 key-pair, 會因為沒有 download 下來.... 最終還是無法登入進去XD

    // Security Group
    const sg01 = new ec2.SecurityGroup(this, "securityGroup25", {
      vpc,
      description: "Allow 22 & 80",
      allowAllOutbound: true,
    });
    sg01.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
    );
    sg01.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
    );

    // IAM role
    const role35 = new iam.Role(this, "ec2Role35", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });
    role35.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
    );

    // EC2 Instance
    const ec2Instance = new ec2.Instance(this, "Instance0325", {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ami88,
      securityGroup: sg01,
      keyName: key99.keyName,
      role: role35,
    });
  }
}
