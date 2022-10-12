export class NamedError extends Error {

  name: string;

  getName() {
    return this.name;
  }  
}

export class TimeoutError extends NamedError {
  constructor() {
    const message = 'A timeout occurred while communicating with Spotify\'s Web API.';
    super(message);
  }
}

/* Web API Parent and fallback error */
export class WebapiError extends NamedError {

  body: any;
  headers: any;
  statusCode: any;
  message: any;

  constructor(body: any, headers: any, statusCode: any, message: any) {
    super(message);
    this.body = body;
    this.headers = headers;
    this.statusCode = statusCode;
  }

}

/** 
 * Regular Error
 * { status : <integer>, message : <string> }
 */
 export class WebapiRegularError extends WebapiError {
  constructor(body: any, headers: any, statusCode: any) {
    const message = 'An error occurred while communicating with Spotify\'s Web API.\n' +
    'Details: ' + body.error.message + '.';

    super(body, headers, statusCode, message);
  }
}

/**
 * Authentication Error 
 * { error : <string>, error_description : <string> }
 */
 export class WebapiAuthenticationError extends WebapiError {
  constructor(body: any, headers: any, statusCode: any) {
    const message = 'An authentication error occurred while communicating with Spotify\'s Web API.\n' +
    'Details: ' + body.error + (body.error_description ? ' ' + body.error_description + '.' : '.');

    super(body, headers, statusCode, message);
  }
}

/**
 * Player Error 
 * { status : <integer>, message : <string>, reason : <string> }
 */
 export class WebapiPlayerError extends WebapiError {
  constructor(body: any, headers: any, statusCode: any) {
    const message = 'An error occurred while communicating with Spotify\'s Web API.\n' +
    'Details: ' + body.error.message + (body.error.reason ? ' ' + body.error.reason + '.' : '.');

    super(body, headers, statusCode, message);
  }
}

