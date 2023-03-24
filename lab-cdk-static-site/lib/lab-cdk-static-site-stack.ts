import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as cdn from '@aws-cdk/aws-cloudfront';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';

export class LabCdkStaticSiteStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const siteDomain = "cdk-site.tonychoucc.com";

    const websiteBucket = new s3.Bucket(this, "CdkWebsiteBucket0325", {
      bucketName: siteDomain,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "error.html",
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    new s3deploy.BucketDeployment(this, "CdkDeployWebsite0325", {
      sources: [s3deploy.Source.asset("./dist")],
      destinationBucket: websiteBucket,
      destinationKeyPrefix: 'web/static',
    });

    const cert = new acm.Certificate(this, "cert", {
      domainName: "*.tonychoucc.com",
      validation: acm.CertificateValidation.fromDns(),
    });
    new cdn.CloudFrontWebDistribution(this, "CdkSiteDistribution0325", {
      viewerCertificate: cdn.ViewerCertificate.fromAcmCertificate(
        cert, {
        aliases: [siteDomain],
        securityPolicy: cdn.SecurityPolicyProtocol.TLS_V1_2_2021,
        sslMethod: cdn.SSLMethod.SNI,
      }
      ),
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
    });
  }
}
