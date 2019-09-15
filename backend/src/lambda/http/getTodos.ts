import 'source-map-support/register'
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getAllTodosForUser } from '../../businessLogic/todos';
import {getUserId} from '../utils';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Caller event', event)
  const userId = getUserId(event);
  const todos = await getAllTodosForUser(userId);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items: todos
    })
  }

});

handler.use(
  cors({
    credentials: true
  })
);
