import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda_ from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class LabCdkApiLambdaS3Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket33 = new s3.Bucket(this, "WidgetStore0327");

    const lambda_handler = new lambda_.Function(this, "WidgetHandler0327", {
      runtime: lambda_.Runtime.NODEJS_16_X,
      code: lambda_.Code.fromAsset("resources"),
      handler: "widget66.main",
      environment: {
        BUCKET: bucket33.bucketName
      },
      // tracing: lambda_.Tracing.ACTIVE,  // 開啟 X-Ray
    });

    bucket33.grantReadWrite(lambda_handler);

    const apigw01 = new apigateway.RestApi(this, "ApiGatewayEndpoint", {
      restApiName: "WidgetService00",
      description: "0327 - https://docs.aws.amazon.com/cdk/v2/guide/serverless_example.html",
      cloudWatchRole: true,
    });
    
    const root_id = apigw01.root.addResource("{id}");
    const widgetsIntegration22 = new apigateway.LambdaIntegration(lambda_handler);
    
    apigw01.root.addMethod("GET", widgetsIntegration22);
    root_id.addMethod("GET", widgetsIntegration22);
    root_id.addMethod("POST", widgetsIntegration22);
    root_id.addMethod("DELETE", widgetsIntegration22);
  }
}
