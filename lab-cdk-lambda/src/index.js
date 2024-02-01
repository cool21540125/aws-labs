exports.handler = async (event) => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Hello world" }),
    };
};