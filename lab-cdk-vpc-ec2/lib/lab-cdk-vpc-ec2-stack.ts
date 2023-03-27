import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';

export class LabCdkVpcEc2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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

    // IAM role (這邊使用 SSM, 主要是因為 KeyPair 是由 CFN 創建(但無法抓下來), 用來作為 ssh 之用)
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
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      keyName: key99.keyName,
      role: role35,
    });

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
    ec2Instance.addUserData(
      "yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm"
    )
  }
}
