import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as uuid from 'uuid';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { TodoItem } from '../../models/TodoItem';
import { getUserId } from '../utils';

const docClient = createDynamoDBClient();
const TODOS_TABLE = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body);

  console.log('Processing event: ', event);

  // const newItem = await createGroup(newGroup, jwtToken)
  
  const itemId = uuid.v4()
  const userId = getUserId(event);

  const newItem: TodoItem = {
    userId,
    todoId: itemId,
    createdAt: new Date().toISOString(),
    name: newTodo.name,
    dueDate: newTodo.dueDate,
    done: false,
    attachmentUrl: 'test'
  }

  await docClient.put({
    TableName: TODOS_TABLE,
    Item: newItem
  }).promise()

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      newItem
    })
  }
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
