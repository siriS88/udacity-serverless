import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { createTodo } from '../../businessLogic/todos';
import {CreateTodoRequest} from '../../requests/CreateTodoRequest';
import {getUserId} from '../utils';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body);
  const userId = getUserId(event);
  console.log('Processing event: ', event);
  try {
    const todoAdded = await createTodo(newTodo, userId);
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item: todoAdded
      })
    }

  } catch (e) {
    console.log(e)
    return {
      statusCode: e.status || 500,
      body: JSON.stringify({
        error: `Failed to create todo due to: ${e}`
      })
    }
  }
}
