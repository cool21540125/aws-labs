import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import * as cognito from "aws-cdk-lib/aws-cognito";

export class WorkshopSimpleCognitoIdentityPoolStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // const cip = new cognito.UserPoolClientIdentityProvider(this, "PocUserPoolClientIdentityProvider", {
    //   userPoolClient: new cognito.UserPoolClient(this, "PocUserPoolClient", {
    //     userPool: new cognito.UserPool(this, "PocUserPool", {
    //       selfSignUpEnabled: true,
    //       signInAliases: {
    //         username: true,
    //         email: false,
    //         phone: false
    //       },
    //       standardAttributes: {
    //         email: {
    //           required: true
    //         }
    //       },
    //       accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
    //       removalPolicy: cdk.RemovalPolicy.DESTROY
    //     }),
    //     userPoolClientName: "PocUserPoolClient",
    // })
  }
}