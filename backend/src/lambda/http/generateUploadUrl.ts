import 'source-map-support/register'
import * as AWS from 'aws-sdk';
import * as uuid from 'uuid'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const docClient = createDynamoDBClient();
const TODOS_TABLE = process.env.TODOS_TABLE;
const bucketName = process.env.ATTACHMENT_IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  const ExistingTodo = await todoExists(todoId);
  console.log("ExistingTodo", ExistingTodo);


  if (!ExistingTodo) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'TODO does not exist'
      })
    }
  }
  const imageId = uuid.v4()

  const params = {
    TableName: TODOS_TABLE,
    Key: {
      todoId: todoId
    },
    UpdateExpression: 'SET #attachmentUrl =:url',
    ExpressionAttributeNames: { "#attachmentUrl": "attachmentUrl" },
    ExpressionAttributeValues: { ":url": `https://${bucketName}.s3.amazonaws.com/${imageId}` },
    ReturnValues: 'UPDATED_NEW'
  };
  // update the db with the get url for the image before sending out the upload url
  await docClient.update(params).promise();

  const url = getUploadUrl(imageId);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      "uploadUrl": url
    })
  }
}

function getUploadUrl(imageId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration
  })
}

async function todoExists(todoId: string) {
  const result = await docClient
    .get({
      TableName: TODOS_TABLE,
      Key: {
        todoId,
      }
    })
    .promise()
  console.log('Get Todo: ', result)
  return result.Item

}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new AWS.DynamoDB.DocumentClient()
}
