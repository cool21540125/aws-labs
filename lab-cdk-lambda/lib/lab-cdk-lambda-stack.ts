import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';
import * as acm from "@aws-cdk/aws-certificatemanager";

export class LabCdkLambdaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const mainFN = new lambda.Function(this, "lambda0324", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda0324"),
    });

    const cert = new acm.Certificate(this, "cert", {
      domainName: "*.tonychoucc.com",
      validation: acm.CertificateValidation.fromDns(),
    });
    new cdk.CfnOutput(this, "ACM-ARN0324", {
      value: cert.certificateArn,
    });

    // 這邊有點不懂的是, 作者說他沒用 Route53, 但我沒設定會無法訪問...
    // 因此還是得去 Route53 A alias 才行 Orz......
    new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: mainFN,
      domainName: {
        domainName: "apigw-cdk.tonychoucc.com",
        certificate: cert
      }
    });
  }
}
