import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import * as cognito from "aws-cdk-lib/aws-cognito";

export class WorkshopSimpleCognitoUserPoolStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const HOSTED_URL =
      "https://404a-2001-b011-8008-3fb3-44d6-482f-8e56-a3d8.ngrok-free.app";

    const userPool = new cognito.UserPool(this, "PocUserPool", {
      // Step1: Configure sign-in experience
      signInAliases: {
        // 建立後無法再修改
        username: true,
        email: false,
        phone: false
      },
      signInCaseSensitive: false,

      // Step2: Configure security requirements
      passwordPolicy: {
        // Password policy
        minLength: 8,
        requireLowercase: true,
        requireUppercase: false,
        requireDigits: true,
        requireSymbols: false
      },
      // mfa: cognito.Mfa.OPTIONAL,
      mfa: cognito.Mfa.OFF,
      mfaSecondFactor: {
        sms: true,
        otp: true
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY, // User account recovery

      // Step3: Configure sign-up experience
      selfSignUpEnabled: true,
      autoVerify: {
        email: true
      },
      // userVerification: {
      //   emailSubject: 'Verify your email for PocUserPool',
      //   emailBody: 'Thanks for signing up to PocUserPool. Your verification code is {####}',
      //   emailStyle: cognito.VerificationEmailStyle.CODE,
      // },
      standardAttributes: {
        email: {
          required: true
        }
      },
      // customAttributes: {
      //   tenant_id: new cognito.StringAttribute({
      //     mutable: false,
      //   }),
      //   user_id: new cognito.StringAttribute({
      //     mutable: false,
      //   }),
      // },

      // Step4: Configure message delivery
      email: cognito.UserPoolEmail.withCognito(),
      // smsRole: new iam.Role(this, "SmsRole", {
      //   roleName: "PocCognitoSnsRole",
      //   description: "Cognito POC Role",
      //   assumedBy: new iam.ServicePrincipal("cognito-idp.amazonaws.com", {
      //     conditions: {
      //       StringEquals: {
      //         "sts:ExternalId": "poc-cognito-sns-role"
      //       }
      //     }
      //   }),
      //   inlinePolicies: {
      //     smsPolicy: new iam.PolicyDocument({
      //       statements: [
      //         new iam.PolicyStatement({
      //           effect: iam.Effect.ALLOW,
      //           actions: ["sns:Publish"],
      //           resources: ["*"]
      //         })
      //       ]
      //     })
      //   }
      // }),

      // Step5: Integrate your app
      userPoolName: "PocUserPool",

      // Step6: Review and create (and others)
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false
    });
    new cdk.CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId,
      description: "cdk created poc user pool id"
    });

    // // CUP - App integration - Domain
    // const domain = userPool.addDomain("PocCognitoDomain", {
    //   cognitoDomain: {
    //     domainPrefix: "tonychoucc"
    //   }
    // });
    // new cdk.CfnOutput(this, "BaseEndpoint", {
    //   value: `${domain.baseUrl()}/`,
    //   description: "The Base HOSTED_URL for the Cognito Hosted UI"
    // });

    // // CUP - App integration - Resource servers
    // const readScope = new cognito.ResourceServerScope({
    //   scopeName: "read",
    //   scopeDescription: "Read-only access"
    // });
    // const listScope = new cognito.ResourceServerScope({
    //   scopeName: "list",
    //   scopeDescription: "List access"
    // });
    // const objectsServer = userPool.addResourceServer(
    //   "PocResourceServerIdentifier",
    //   {
    //     userPoolResourceServerName: "PocResourceServerIdentifier",
    //     identifier: "PocResourceServerIdentifier",
    //     scopes: [readScope, listScope]
    //   }
    // );
    // const objectScopes = [
    //   cognito.OAuthScope.resourceServer(objectsServer, readScope),
    //   cognito.OAuthScope.resourceServer(objectsServer, listScope)
    // ];

    // Step5: Integrate your app - AppClient01
    const hostedUiClient = userPool.addClient("AppClient01", {
      userPoolClientName: "AppClient01",
      generateSecret: false,
      authFlows: {
        // Authentication flows
        userPassword: true
        // userSrp: true,
      },
      // authSessionValidity: cdk.Duration.days(1),     // Authentication flow session duration
      // refreshTokenValidity: cdk.Duration.days(1),    // Refresh token expiration
      // accessTokenValidity: cdk.Duration.minutes(60), // Access token expiration
      // idTokenValidity: cdk.Duration.minutes(60),     // ID token expiration
      oAuth: {
        flows: {
          implicitCodeGrant: true,
          authorizationCodeGrant: true
        },
        scopes: [
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
          cognito.OAuthScope.COGNITO_ADMIN
          // ...objectScopes
        ]
        // callbackUrls: [
        //   // `${HOSTED_URL}/tokens`,
        //   "https://blog.tonychoucc.com"
        // ],
        // logoutUrls: [`${HOSTED_URL}/cognito`]
      }
    });
    new cdk.CfnOutput(this, "AppClientId", {
      value: hostedUiClient.userPoolClientId,
      description: "cdk created poc AppClient01 id"
    });

    // domain.signInUrl(hostedUiClient, {
    //   redirectUri: HOSTED_URL
    // });
    // new cdk.CfnOutput(this, "AppClientId01", {
    //   value: hostedUiClient.userPoolClientId,
    //   description: "The Cognito App Client ID for the Hosted UI"
    // });
  }
}
