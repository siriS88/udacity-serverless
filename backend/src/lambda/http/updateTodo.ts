import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
import { updateTodo } from '../../businessLogic/todos';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  const updateTodoItem: UpdateTodoRequest = JSON.parse(event.body);

  try {
    await updateTodo(todoId, updateTodoItem);
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
      })
    }
  } catch (e) {
    console.log(e)
    return {
      statusCode: e.status || 500,
      body: JSON.stringify({
        error: `Failed to update todo ${todoId} due to: ${e}`
      })
    }

  }
}