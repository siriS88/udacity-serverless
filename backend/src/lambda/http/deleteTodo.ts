import 'source-map-support/register';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { deleteTodo } from '../../businessLogic/todos';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;

  try {
    await deleteTodo(todoId);
    return {
      statusCode: 201,
      body: JSON.stringify({
      })
    }
  } catch (e) {
    console.log(e);
    return {
      statusCode: e.status || 500,
      body: JSON.stringify({
        error: `Failed to delete todo ${todoId} due to: ${e}`
      })
    }
  }
})

handler.use(
  cors({
    credentials: true
  })
);