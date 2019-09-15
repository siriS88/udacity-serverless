
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import 'source-map-support/register';
import { verify } from 'jsonwebtoken';
import { JwtPayload } from '../../auth/JwtPayload';

const APP_CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJY9qZIXDnoB09MA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi1kajdrZDkyeS5hdXRoMC5jb20wHhcNMTkwOTE0MTc1NjI2WhcNMzMw
NTIzMTc1NjI2WjAhMR8wHQYDVQQDExZkZXYtZGo3a2Q5MnkuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1R3J+UatU+84UJ8iKwX48fWh
EUZab86hxGR6EqilCjJCAoBtVfvXNCUJcpy2tjtqQRyiufdTe6juNUJzqOGBKfvZ
7fCocJyODij1CGT9eMzF1mmQmjCgfC+dr5yhciY5fx3lmP2d1TQKmmfU0I/yZdC7
09GifDTmlq+G4Jr8H1CYLQNjlvNilAUJqLNvY3uC+8fxvHH6AlIXlTe01uaSo7fQ
+uCplasIckYJ9/PFnVxYAzltO9BolJtjNl+NQ5tEUdb+vHVDOaQSucn/3gh3mqoO
SMeYJqPm9/MMtwuMQpCX1aLIKiqDLSkWMtvIa2RbLQVdID+GZWGM2SzMSG2L8wID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBS6aABJsE44FtgR5ESQ
+CKsWVSgmDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBABgXobjG
JVtnyf/Vcs4hk9RHpR9OTe4Gk3Kt5xZtwrPfHxMHagHzMm/exjWXVHscCSDYPRxT
ew8oFL4YDLrTEW+UXCd+Yy+eHco83RGjpedwf3AwsnOjt9TGPeT9ryeZfOKdxWoK
MCapirC28O467qDi0N+TPPGH50l6ivmCllsTqFWCkudmYgUJt+OGIksfsZMUqp1t
xqQ6tXm3O7KSqb79rFRBbo83xC4aXtBA1071jGa7UV3DSMK6MvW3o7kvN8QjFrmO
1Imcui9ZhXG6ecCG6bQk7/iXS7NoiFDUqqSCluN96I+qTc9ArD3CauApel3JTlS+
1eA2VQJi1abeIyA=
-----END CERTIFICATE-----`


export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {

  try {
    const decodedToken = verifyToken(event.authorizationToken);

    console.log('User was authorized', decodedToken)

    return {
      principalId: decodedToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User was not authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader): JwtPayload {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  console.log("authHeader", authHeader)

  const split = authHeader.split(' ')
  const token = split[1];

  console.log("token", token);

  const jwtToken = verify(
    token,           // Token from an HTTP header to validate
    APP_CERTIFICATE,            // A certificate copied from Auth0 website
    { algorithms: ['RS256'] } // We need to specify that we use the RS256 algorithm
  ) as JwtPayload
  return jwtToken;
}
