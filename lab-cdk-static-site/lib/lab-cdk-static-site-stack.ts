import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cdn from 'aws-cdk-lib/aws-cloudfront';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as r53_target from 'aws-cdk-lib/aws-route53-targets';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class LabCdkStaticSiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const domain = "tonychoucc.com"
    const siteDomain = `site0327.${domain}`;

    const websiteBucket = new s3.Bucket(this, `Cdk-${domain}`, {
      bucketName: siteDomain,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "error.html",
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    new s3deploy.BucketDeployment(this, "Cdk-Deploy-${domain}", {
      sources: [s3deploy.Source.asset("./artifacts")],
      destinationBucket: websiteBucket,
      // destinationKeyPrefix: 'web/static',
    });

    // ---------- 由以存在的 Route53 && ACM 載入 ----------
    // Route53 - Hosted Zone
    const myExistingZone = route53.HostedZone.fromLookup(this, `Existing-HostZone-${domain}`, {
      domainName: domain,
    });
    // ACM - Certificate ARN (us-east-1)
    const certificateArn = "(位於 us-east-1 的 Cert ARN)";
    const cert = acm.Certificate.fromCertificateArn(this, `Cert-${myExistingZone}`, certificateArn);
    // ---------- 由以存在的 Route53 && ACM 載入 ----------

    // CloudFront
    const siteDistribution = new cdn.CloudFrontWebDistribution(this, "Cdk-Dist-${domain}", {
      viewerCertificate: cdn.ViewerCertificate.fromAcmCertificate(
        cert, {
        aliases: [siteDomain],
        securityPolicy: cdn.SecurityPolicyProtocol.TLS_V1_2_2021,
        sslMethod: cdn.SSLMethod.SNI,
      }),
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
    });

    // ------ Existing Route53 Hosted Zone create Recourd
    new route53.ARecord(this, "CdkStaticSiteRecord", {
      target: route53.RecordTarget.fromAlias(new r53_target.CloudFrontTarget(siteDistribution)),
      zone: myExistingZone,
      recordName: siteDomain
    });
  }
}
