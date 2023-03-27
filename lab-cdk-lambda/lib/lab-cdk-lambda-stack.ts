import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as apigw from 'aws-cdk-lib/aws-apigateway';

export class LabCdkLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const mainFN = new lambda.Function(this, "lambda0327", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda0327"),
      // tracing: lambda.Tracing.ACTIVE,  // 開啟 X-Ray
    });
    const otherFN = new lambda.Function(this, "lambda0327-other", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "other.handler",
      code: lambda.Code.fromAsset("lambda0327"),
    });

    const cert = new acm.Certificate(this, "cert", {
      domainName: "*.tonychoucc.com",
      validation: acm.CertificateValidation.fromDns(),
    });
    new cdk.CfnOutput(this, "ACM-ARN0327", {
      value: cert.certificateArn,
    });

    // !! 雖說設定了 ApiGateway 的 Custom Domain, 但仍需手動去配 Route53 解析
    const apigw01 = new apigw.LambdaRestApi(this, 'ApiGatewayEndpoint', {
      handler: mainFN,
      domainName: {
        domainName: "gwcdk.tonychoucc.com",
        certificate: cert
      },
      proxy: false,
    });

    apigw01.root.addMethod("GET", new apigw.LambdaIntegration(mainFN));
    apigw01.root.addResource("other").addMethod("GET", new apigw.LambdaIntegration(otherFN));
  }
}
