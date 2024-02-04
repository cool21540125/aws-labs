import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';


export interface BeautifulTokyoNetworkingProps {
  prefix: string;             // "google"
  natRequired?: boolean;
}


export class BeautifulTokyoNetworking extends Construct {
  constructor(scope: Construct, id: string, props: BeautifulTokyoNetworkingProps) {
    super(scope, id);

    // Tokyo AZs
    let tokyoAz = [
      "a",
      "c",
      "d",
    ];

    /* VPC
      https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ec2-vpc-tag.html
    */
    const vpc01 = new ec2.CfnVPC(this, `${props.prefix}-vpc`, {
      cidrBlock: `10.10.0.0/16`,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      tags: [
        {
          key: "Name",
          value: `${props.prefix}-vpc`
        },
      ],
    })

    /* Internet Gateway
      https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ec2-internetgateway.html
    */
    const igw01 = new ec2.CfnInternetGateway(this, `${props.prefix}-igw`, {
      tags: [
        {
          key: "Name",
          value: `${props.prefix}-igw`
        },
      ],
    })

    /* VPC Gateway Attachment
      https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ec2-vpcgatewayattachment.html
    */
    new ec2.CfnVPCGatewayAttachment(this, `${props.prefix}-vpc-igw`, {
      internetGatewayId: igw01.ref,
      vpcId: vpc01.ref,
    })


    /* Subnet
      https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ec2-subnet.html#cfn-ec2-subnet-vpcid
    */
    let subnets = [];

    // private subnet
    for (let sn = 0; sn < 3; sn++) {
      let subnet_name = `Subnet-${tokyoAz[sn]}`;

      subnets[sn] = new ec2.CfnSubnet(this, subnet_name, {
        availabilityZone: `ap-northeast-1${tokyoAz[sn]}`,
        cidrBlock: `10.10.${sn * 4}.0/22`,
        vpcId: vpc01.ref,
        mapPublicIpOnLaunch: false,
        tags: [
          {
            key: "Name",
            value: subnet_name
          },
        ],
      })
    }

    // Public Subnet
    for (let sn = 3; sn < 6; sn++) {
      let Subnet_Name = `Subnet-${tokyoAz[sn - 3].toUpperCase()}`;

      subnets[sn] = new ec2.CfnSubnet(this, Subnet_Name, {
        availabilityZone: `ap-northeast-1${tokyoAz[sn - 3]}`,
        cidrBlock: `10.10.${200 + (sn - 3) * 4}.0/22`,
        vpcId: vpc01.ref,
        mapPublicIpOnLaunch: false,
        tags: [
          {
            key: "Name",
            value: Subnet_Name
          },
        ],
      })
    }


    /* Route Table - Assocations
      https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ec2-routetable.html
      https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ec2-route.html
      https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ec2-gatewayroutetableassociation.html
    */
    const RT01 = new ec2.CfnRouteTable(this, 'RT', {
      vpcId: vpc01.ref,
      tags: [
        {
          key: "Name",
          value: "RT"
        },
      ]
    })
    const rt01 = new ec2.CfnRouteTable(this, 'rt', {
      vpcId: vpc01.ref,
      tags: [
        {
          key: "Name",
          value: "rt"
        },
      ]
    })

    // subnet - associate - route table
    for (let sn = 0; sn < 3; sn++) {
      new ec2.CfnSubnetRouteTableAssociation(this, `subnet-${tokyoAz[sn]}-association-rt${sn}`, {
        routeTableId: rt01.ref,
        subnetId: subnets[sn].ref,
      })
    }

    // private subnet default to Nat Gateway if not 'dev'
    if (props.natRequired) {
      const eip01 = new ec2.CfnEIP(this, `${props.prefix}-Eip`, {})

      const nat01 = new ec2.CfnNatGateway(this, `${props.prefix}-Nat`, {
        allocationId: eip01.attrAllocationId,
        subnetId: subnets[3].ref,
        privateIpAddress: "10.10.200.254",
        tags: [
          {
            key: "Name",
            value: "Nat"
          }
        ]
      })

      // private subnet default to Nat Gateway
      new ec2.CfnRoute(this, 'rt01_route', {
        natGatewayId: nat01.ref,
        routeTableId: rt01.ref,
        destinationCidrBlock: '0.0.0.0/0',
      })
    }

    // Subnet - associate - Route Table
    for (let sn = 3; sn < 6; sn++) {
      new ec2.CfnSubnetRouteTableAssociation(this, `Subnet${tokyoAz[sn - 3]}-association-RT${sn}`, {
        routeTableId: RT01.ref,
        subnetId: subnets[sn].ref,
      })
    }
    // Public Subnet default to Internet Gateway
    new ec2.CfnRoute(this, 'RT01_route', {
      gatewayId: igw01.ref,
      routeTableId: RT01.ref,
      destinationCidrBlock: '0.0.0.0/0',
    })

  }
}


export class CdkVpcInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ENV = process.env['ENV'] || 'dev';

    new BeautifulTokyoNetworking(this, "devops", {
      prefix: 'DevOps',
      natRequired: false
    })
  }
}
