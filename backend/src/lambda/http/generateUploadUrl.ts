import 'source-map-support/register';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getUploadUrl } from '../../businessLogic/todos';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  try {
    const url = await getUploadUrl(todoId);
    return {
      statusCode: 201,
      body: JSON.stringify({
        "uploadUrl": url
      })
    }
  } catch (e) {
    console.log(e)
    return {
      statusCode: e.status || 500,
      body: JSON.stringify({
        error: `Failed to get upload Url due to: ${e}`
      })
    }
  }
});

handler.use(
  cors({
    credentials: true
  })
);

