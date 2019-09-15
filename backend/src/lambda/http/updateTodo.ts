import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';

const docClient = createDynamoDBClient();
const TODOS_TABLE = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updateTodo: UpdateTodoRequest = JSON.parse(event.body)

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

  // form the update expression and the expression attribute values
  let updateExpression = '';
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};

  if (updateTodo.name) {
    updateExpression = 'SET #name =:n';
    expressionAttributeValues[':n'] = updateTodo.name;
    expressionAttributeNames["#name"] = "name";
  }

  if (updateTodo.dueDate) {
    const dueDateTimestamp = Date.parse(updateTodo.dueDate);
    updateExpression = `${updateExpression}, #dueDate =:d`;
    expressionAttributeValues[':d'] = new Date(dueDateTimestamp).toISOString();
    expressionAttributeNames["#dueDate"] = "dueDate";

  }

  if (updateTodo.done) {
    updateExpression = `${updateExpression}, #done =:do`;
    expressionAttributeValues[':do'] = updateTodo.done;
    expressionAttributeNames["#done"] = "done";

  }

  if (updateExpression === '') {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Did not provide anything to update'
      })
    }
  }
  console.log("updateExpression", updateExpression);
  console.log("expressionAttributeValues", expressionAttributeValues)
  console.log("expressionAttributeNames", expressionAttributeNames)


  const params = {
    TableName: TODOS_TABLE,
    Key: {
      todoId: todoId
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'UPDATED_NEW'
  };

  docClient.update(params).promise();

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