/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

"use strict";

exports.handler = async (event, context) => ({
  statusCode: 200,
  body: JSON.stringify({
    isBase64Encoded: true | false,
    statusCode: httpStatusCode,
    headers: { headerName: "headerValue" },
    body: "Successful"
  })
});
