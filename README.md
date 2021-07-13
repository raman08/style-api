# Wardo App backend

This backend is implemented using node-express framework.

## Authentication Module

> **Base URL:** /auth

1. **POST** http://localhost:3000/auth/verify

    These are the parameter:

    | Parameter | Type   | Require? | Description                                                |
    | --------- | ------ | -------- | ---------------------------------------------------------- |
    | phoneNo   | Number | True     | The phone number with country code which is to be verified |

This will send an _otp_ to the given phone number and send a responce. If the _statusCode_ is _200_ that means otp send sucessfully

-   **Example:**

    ```json
    POST http://localhost:3000/auth/verify HTTP/1.1
    content-type: application/json

    {
    	"phoneNo": 912223334445
    }
    ```

-   **Responce:**

    ```json
    {
    	"message": "Otp Send Sucessfully",
    	"data": {
    		"phoneNo": "+912223334445",
    		"channel": "sms",
    		"status": "pending",
    		"valid": false,
    		"lookup": {
    			"carrier": {
    				"mobile_country_code": "234",
    				"type": "mobile",
    				"error_code": null,
    				"mobile_network_code": "234",
    				"name": "XXX"
    			}
    		},
    		"statusCode": 200
    	}
    }
    ```

2.  **POST** http://localhost:3000/auth/verify/otp
    These are the parameter:

    | Parameter | Type   | Require? | Description                                                |
    | --------- | ------ | -------- | ---------------------------------------------------------- |
    | phoneNo   | Number | True     | The phone number with country code which is to be verified |
    | otp       | Number | True     | The otp which is send by the server to verify the number   |

This endpoint will verify the authenticity of the phone number. This the opt is approved and verified then the _data.valid_ must be _true_ and _statusCode_ is _200_.

If the opt is invalid then the _statusCode_ is _403_.

-   **Example:**

    ```json
    POST http://localhost:3000/auth/verify/otp HTTP/1.1
    Content-Type: application/json

    {
    	"phoneNo": 912223334445,
    	"otp": "0363"
    }
    ```

-   **Responce:** (If verified)

    ```json
    {
    	"message": "Phone number verified",
    	"data": {
    		"phoneNo": "+912223334445",
    		"channel": "sms",
    		"status": "approved",
    		"valid": true,
    		"statusCode": 200
    	}
    }
    ```

-   **Responce:** (If not verified)

    ```json
    {
    	"message": "Could not verify the phone number!",
    	"statusCode": 403
    }
    ```

3. **POST** http://localhost:3000/auth/user/signup

    These are the parameter:

    | Parameter | Type   | Require? | Description                                    |
    | --------- | ------ | -------- | ---------------------------------------------- |
    | name      | String | True     | The name of the user                           |
    | phoneNo   | Number | True     | The Phone Number of the user                   |
    | password  | String | True     | The password for the user account              |
    | age       | Number | True     | Age of the user                                |
    | gender    | String | True     | The gender of the user (Either Male/Female)    |
    | verified  | Bool   | False    | True if the user is verified. Default is false |

This endpoint will create a new user and store it into database.

-   **Example:**

    ```json
    POST http://localhost:3000/auth/user/signup HTTP/1.1
    Content-Type: application/json

    {
    	"name": "Dummy name",
    	"phoneNo": "2223334445",
    	"password": "test2222",
    	"age": "18",
    	"gender": "Male"
    }
    ```

-   **Responce:**

    ```json
    {
    	"message": "User register sucessfully!",
    	"user": {
    		"_id": "60eddd4e4c42ef1dcd730945",
    		"name": "Dummy name"
    	}
    }
    ```

4. **POST** http://localhost:3000/auth/user/signin/password

    These are the parameter:

    | Parameter | Type   | Require? | Description                       |
    | --------- | ------ | -------- | --------------------------------- |
    | phoneNo   | Number | True     | The Phone Number of the user      |
    | password  | String | True     | The password for the user account |

This endpoint will return the access token and refresh token for the user. The refresh token is stored in the database to regenerate the access token on the further request.

-   **Example:**

    ```json
    POST http://localhost:3000/auth/user/signin/password HTTP/1.1
    Content-Type: application/json

    {
    	"phoneNo": "2223334445",
    	"password": "test2222"

    }
    ```

-   **Responce:** (If authenticated)

    ```json
    {
    	"user": {
    		"id": "60e9dc49dc64bf157d2ba358",
    		"phoneNo": 2223334445
    	},
    	"acessToken": "XXXXX",
    	"refreshToken": "XXXXX"
    }
    ```

-   **Responce:** (If not authenticated)

    ```json
    {
    	"message": "Invalid Password!",
    	"statusCode": 401
    }
    ```

5.  **POST** http://localhost:3000/auth/user/signin/refresh

    These are the parameter:

    | Parameter    | Type   | Require? | Description           |
    | ------------ | ------ | -------- | --------------------- |
    | refreshToken | String | True     | A valid refresh token |

    This endpoint will regenrate the access token if the valid refresh token is supplied.

-   **Example:**

    ```json
    POST http://localhost:3000/auth/user/signin/refresh HTTP/1.1
    Content-Type: application/json

    {
    	"refreshToken": "XXXXX"

    }
    ```

-   **Responce:** (If verified)

    ```json
    {
    	"message": "Access Token generated!",
    	"accessToken": "XXXXX",
    	"refreshToken": "XXXXX"
    }
    ```

-   **Responce:** (If not verified)

    ```json
    {
    	"message": "Invalid Refresh Token!",
    	"statusCode": 403
    }
    ```
