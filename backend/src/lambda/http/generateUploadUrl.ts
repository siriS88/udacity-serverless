import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { getUploadUrl } from '../../businessLogic/todos';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  try {
    const url = await getUploadUrl(todoId);
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
  } catch (e) {
    console.log(e)
    return {
      statusCode: e.status || 500,
      body: JSON.stringify({
        error: `Failed to get upload Url due to: ${e}`
      })
    }
  }
}


