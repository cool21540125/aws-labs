import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as assets from 'aws-cdk-lib/aws-s3-assets';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as tg from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';


export class LabCdkElbStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const httpPort = 80;

    // VPC
    const vpc = new ec2.Vpc(this, 'VPC0327', {
      maxAzs: 2,
      natGateways: 0,
    });

    // ALB - SG
    const albSg = new ec2.SecurityGroup(this, 'securityGroup27', {
      vpc,
      description: "ALB SG",
      allowAllOutbound: true,
    });
    albSg.addIngressRule(
      ec2.Peer.ipv4("0.0.0.0/0"),
      ec2.Port.tcp(80),
      "ALB SG all ALL 80"
    )

    // Target Group - SG
    const tg_sg0328 = new ec2.SecurityGroup(this, "securityGroup28", {
      vpc,
      description: "EC2 SG",
      allowAllOutbound: true,
    });
    tg_sg0328.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      "ipv4 22 port"
    );

    // ALB
    const alb = new elbv2.ApplicationLoadBalancer(this, "alb0327", {
      vpc,
      internetFacing: true,
      securityGroup: albSg,
    });
    const manual_tg = new elbv2.ApplicationTargetGroup(this, "manualTargetGroup", {
      vpc,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.INSTANCE,
    });
    tg_sg0328.addIngressRule(albSg, ec2.Port.tcp(80));
    // -----------------

    // ALB - listener
    const listener123 = alb.addListener("Listener123", {
      port: httpPort,
      open: true,
      defaultTargetGroups: [manual_tg]
    });

    // EC2 misc
    const ami12 = new ec2.AmazonLinuxImage({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      cpuType: ec2.AmazonLinuxCpuType.X86_64,
    });
    const ec2_user_data26 = new assets.Asset(this, "ec2_user_data26", {
      path: path.join(__dirname, "../", "ec2-init", "userdata.sh"),
    });
    const role35 = new iam.Role(this, "ec2Role35", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });
    role35.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore"),
    );
    const key49 = new ec2.CfnKeyPair(this, "KeyPair99", {
      keyName: "cdk-keypair99",
    });

    // EC2 Instance
    const ec2Instance = new ec2.Instance(this, "Instance0327", {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ami12,
      securityGroup: tg_sg0328,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      role: role35,
      keyName: key49.keyName,
    });

    // Role
    const localPath = ec2Instance.userData.addS3DownloadCommand({
      bucket: ec2_user_data26.bucket,
      bucketKey: ec2_user_data26.s3ObjectKey,
    });
    ec2Instance.userData.addExecuteFileCommand({
      filePath: localPath,
      arguments: "--verbose -y",
    });
    ec2_user_data26.grantRead(ec2Instance.role);

    // CloudFormation Output - EC2
    new cdk.CfnOutput(this, "Ec2PublicDns51", {
      value: ec2Instance.instancePrivateDnsName,
    });
    new cdk.CfnOutput(this, "Ec2PublicIp52", {
      value: ec2Instance.instancePublicIp,
    });
    // -----------------------

    // ALB - listener
    listener123.addTargets("ec2-tg", {
      healthCheck: {
        enabled: true,
      },
      port: httpPort,
      targets: [new tg.InstanceTarget(ec2Instance)],
    });

    // CloudFormation Output - ALB
    new cdk.CfnOutput(this, "LoadBalancerDNS44", {
      value: alb.loadBalancerDnsName,
    });
  }
}
