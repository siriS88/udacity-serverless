import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';

const docClient = createDynamoDBClient();
const TODOS_TABLE = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const validTodo = await todoExists(todoId);
  console.log("ExistingTodo", validTodo);

  const params = {
    TableName: TODOS_TABLE,
    Key: {
      todoId: todoId
    },
    ReturnValues: 'ALL_OLD'
  };

  if (!validTodo) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'TODO does not exist'
      })
    }
  }

  await docClient.delete(params).promise();

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
    })
  }

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
  return !!result.Item

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
