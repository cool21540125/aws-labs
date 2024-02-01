import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
// import * as acm from 'aws-cdk-lib/aws-certificatemanager';
// import * as apigw from 'aws-cdk-lib/aws-apigateway';

export class LabCdkLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const executionRole = new iam.Role(this, "cfn-logic-name-role", {
      roleName: "test-this-is-role-name",
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaVPCAccessExecutionRole"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
      ],
    });

    const mainFN = new lambda.Function(this, "cfn-logic-name-lambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      functionName: "test-this-is-lambda-name",
      code: lambda.Code.fromAsset("src"),  // from src 
      role: executionRole,
      // tracing: lambda.Tracing.ACTIVE,      // 開啟 X-Ray
    });

    // const cert = new acm.Certificate(this, "cert", {
    //   domainName: "*.tonychoucc.com",
    //   validation: acm.CertificateValidation.fromDns(),
    // });
    // new cdk.CfnOutput(this, "ACM-ARN0327", {
    //   value: cert.certificateArn,
    // });

    // // !! 雖說設定了 ApiGateway 的 Custom Domain, 但仍需手動去配 Route53 解析
    // const apigw01 = new apigw.LambdaRestApi(this, 'ApiGatewayEndpoint', {
    //   handler: mainFN,
    //   domainName: {
    //     domainName: "gwcdk.tonychoucc.com",
    //     certificate: cert
    //   },
    //   proxy: false,
    // });

    // apigw01.root.addMethod("GET", new apigw.LambdaIntegration(mainFN));
    // apigw01.root.addResource("other").addMethod("GET", new apigw.LambdaIntegration(otherFN));
  }
}
