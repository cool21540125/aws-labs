import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda_ from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";

export class MyWidgetServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket33 = new s3.Bucket(this, "WidgetStore0325");

    const handler = new lambda_.Function(this, "WidgetHandler0325", {
      runtime: lambda_.Runtime.NODEJS_16_X,
      code: lambda_.Code.fromAsset("resources"),
      handler: "widget66.main",
      environment: {
        BUCKET: bucket33.bucketName
      }
    });

    bucket33.grantReadWrite(handler);

    const api = new apigateway.RestApi(this, "widget-api99", {
      restApiName: "WidgetService00",
      description: "0325 - https://docs.aws.amazon.com/cdk/v2/guide/serverless_example.html"
    });

    const widget = api.root.addResource("{id}");
    const widgetsIntegration22 = new apigateway.LambdaIntegration(handler);

    widget.addMethod("POST", widgetsIntegration22);
    widget.addMethod("GET", widgetsIntegration22);
    widget.addMethod("DELETE", widgetsIntegration22);
  }
}
