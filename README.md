# Serverless TODOS application

This project is developed as part of a udacity nanodegree. This project creates an application that allows creating, updating, deleting TODOS for a user as well as listing todos them. You can add an optional image attachment to a TODO. It uses the backend starter code and client provided by udacity cloud developer nanodegree. The application is built using serverless framework with aws as the provider.  

# Functionality of the application

This appliation allow to create/remove/update/get TODO items. Each TODO item can optionally have an attachment image. Each user only has access to TODO items that he/she has created. 

# Lambda functions implemented

This project implements the following lambda functions:

* `Auth` - this function implements a custom authorizer for API Gateway that should be added to all other functions.
* `GetTodos` - returns all TODOs for a current user. 
* `CreateTodo` - creates a new TODO for a current user. A shape of data send by a client application to this function can be found in the `CreateTodoRequest.ts` file
* `UpdateTodo` - updates a TODO item created by a current user. A shape of data send by a client application to this function can be found in the `UpdateTodoRequest.ts` file
* `DeleteTodo` - deletes a TODO item created by a current user. Expects an id of a TODO item to remove.
* `GenerateUploadUrl` - returns a presigned url that can be used to upload an attachment file for a TODO item. 

All functions are already connected to appropiate events from API gateway

An id of a user is extracted from a JWT token passed by the client.

# Frontend

The `client` folder contains a web application that can use the API that should be developed in the project.

To use it please edit the `config.ts` file in the `client` folder:

```ts
const apiId = '...' API Gateway id
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: '...',    // Domain from Auth0
  clientId: '...',  // Client id from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback'
}
```

# Best practices employed

* Cold Start
    - Each lambda function is packaged individually by node to avoid adding unnecessary dev dependancies thereby reducing the file size to optimize for cold start.
* Distributed Tracing
  - AWS XRAY is used to enable tracing and a map of the application can be viewed
* Canary Deployment
  - A live alias is used for every lambda function and traffic is diverted to the new deployment from the old one by 10% every minute
* Local Execution
  - The backend is setup to work locally by executing the following commands:
  `sls dynamodb start`
  `sls offline`
* Security
  - Every lambda function is given an iam role with specific permissions to what it needs
* Modularity
  - Code is organized to seperate business logic from data access to dynamodb and handling lambda events

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless TODO application.

# Postman collection

An alternative way to use the API is to use the Postman collection that contains sample requests. You can find a Postman collection in this project.
