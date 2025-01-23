import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import * as iam from "aws-cdk-lib/aws-iam";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import {
  Domain,
  EngineVersion,
  IpAddressType
} from "aws-cdk-lib/aws-opensearchservice";
import { CfnOutput } from "aws-cdk-lib";

export class OpensearchStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // FIXME: 這邊寫法可能有問題
    const MY_IP = `${process.env["MY_IP"]}/32` || `55.44.88.77`;

    const EsName = "alb-logs";
    const account_id = props?.env?.account;
    const region = props?.env?.region;

    // ************************ 建立 OpenSearch ************************
    const es_domain = new Domain(this, "es_domain", {

      // Basic & Common
      domainName: EsName,
      version: EngineVersion.OPENSEARCH_2_17,
      enableVersionUpgrade: true,
      enableAutoSoftwareUpdate: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,

      // Networking & VPC
      ipAddressType: IpAddressType.IPV4,
      // Security & Auth & Roles
      // securityGroups: [_sg],
      enforceHttps: true,
      nodeToNodeEncryption: true,
      encryptionAtRest: {
        enabled: true
      },
      accessPolicies: [
        new iam.PolicyStatement({
          actions: ["es:ESHttp*"],
          effect: iam.Effect.ALLOW,
          principals: [
            new iam.AccountPrincipal(account_id),
            new iam.AnyPrincipal()
          ],
          resources: [`arn:aws:es:${region}:${account_id}:domain/${EsName}/*`],
          conditions: {
            "IpAddress": {
              "aws:SourceIp": [MY_IP]
            }
          },
        })
      ],
      // Storage & Size
      ebs: {
        volumeSize: 10,
        volumeType: ec2.EbsDeviceVolumeType.GENERAL_PURPOSE_SSD_GP3,
        throughput: 125,
        iops: 3000
      },
      capacity: {
        // Dedicated Master Node
        masterNodes: 0,
        dataNodes: 1,
        // dataNodeInstanceType: "m7g.large.search",
        dataNodeInstanceType: "t3.small.search",
        multiAzWithStandbyEnabled: false,
        warmNodes: 0
      },
      // Troubleshooting & logging
      logging: {
        auditLogEnabled: false,
        slowSearchLogEnabled: false,
        appLogEnabled: false,
        slowIndexLogEnabled: false
      }
    });
    cdk.Tags.of(es_domain).add("CreatedVia", "aws cdk");
    cdk.Tags.of(es_domain).add("Usage", "ALB access logs");

    // ************************ Output ************************
    new CfnOutput(this, "outOpenSearch", {
      exportName: `OpenSearchUrl`,
      value: `${es_domain.domainEndpoint}/_dashboards`
    });
  }
}
