# User API spec

## Register User
Endpoint: POST /api/users

Request Body :
```json
{
    "username": "username",
    "password": "pass",
    "name": "name"
}
```

Response Body (Success):
```json
{
    "data": {
        "username": "username",
        "name": "name"
    }
}
```

Response Body (Failed):
```json
{
    "errors": "error type"
}
```

## Login User
Endpoint: POST /api/users/login

Request Body :
```json
{
    "username": "username",
    "password": "pass",
}
```

Response Body (Success):
```json
{
    "data": {
        "username": "username",
        "name": "name",
        "token": "session_id"
    }
}
```

Response Body (Failed):
```json
{
    "errors": "error type"
}
```

## Get User
Endpoint: GET /api/users/current

Headers:
 - Authorization : token 

Response Body (Success):
```json
{
    "data": {
        "username": "username",
        "name": "name",
    }
}
```

Response Body (Failed):
```json
{
    "errors": "error type"
}
```

## Update User
Endpoint: PATCH /api/users/current

Headers: 
 - Authorization : token

Request Body :
```json
{
    "username": "username", // optional, if want to change it
    "password": "pass" // optional, if want change password
}
```

Response Body (Success):
```json
{
    "data": {
        "username": "username",
        "name": "name"
    }
}
```

Response Body (Failed):
```json
{
    "errors": "error type"
}
```

## Logout User

Endpoint: DELETE /api/users/current

Headers: 
 - Authorization : token


Response Body (Success):
```json
{
    "data": true // boolean
}
```

Response Body (Failed):
```json
{
    "errors": "error type"
}
```