import { isNil } from 'lodash';
import superagent from 'superagent';

import { SpotifyWebRequest } from '../types';

import {
  TimeoutError,
  WebapiError,
  WebapiRegularError,
  WebapiAuthenticationError,
  WebapiPlayerError
} from './responseError';
import { 
  swrGetBodyParameters,
  swrGetHeaders,
  swrGetQueryParameters,
  swrGetURI,
 } from './spotifyWebRequest';


export const httpManagerGetParametersFromRequest = (request: SpotifyWebRequest): any => {

  const options: any = {};

  if (!isNil(swrGetQueryParameters(request))) {
    options.query = swrGetQueryParameters(request);
  }

  if (!isNil(swrGetHeaders(request)) && swrGetHeaders(request) === "['Content-Type'] === 'application/json'") {
    options.data = JSON.stringify(swrGetBodyParameters(request));
  } else if (swrGetBodyParameters(request)) {
    options.data = swrGetBodyParameters(request);
  }

  if (swrGetHeaders(request)) {
    options.headers = swrGetHeaders(request);
  }
  return options;
};

export const httpManagerToError = (response: any): any => {
  if (typeof response.body === 'object' && response.body.error && typeof response.body.error === 'object' && response.body.error.reason) {
    return new WebapiPlayerError(response.body, response.headers, response.statusCode);
  }

  if (typeof response.body === 'object' && response.body.error && typeof response.body.error === 'object') {
    return new WebapiRegularError(response.body, response.headers, response.statusCode);
  }

  if (typeof response.body === 'object' && response.body.error && typeof response.body.error === 'string') {
    return new WebapiAuthenticationError(response.body, response.headers, response.statusCode);
  }

  /* Other type of error, or unhandled Web API error format */
  return new WebapiError(response.body, response.headers, response.statusCode, response.body);
};

/* Make the request to the Web API */
export const httpManagerMakeRequest = (method: any, options: any, uri: any, callback: any) => {

  const req = method.bind(superagent)(uri);

  if (options.query) {
    req.query(options.query);
  }

  if (options.headers) {
    req.set(options.headers);
  }

  if (options.data) {
    req.send(options.data);
  }

  req.end((err: any, response: any) => {
    if (err) {
      if (err.timeout) {
        return callback(new TimeoutError());
      } else if (err.response) {
        return callback(httpManagerToError(err.response));
      } else {
        return callback(err);
      }
    }

    return callback(null, {
      body: response.body,
      headers: response.headers,
      statusCode: response.statusCode
    });
  });
};

/**
 * Make a HTTP GET request.
 * @param {BaseRequest} The request.
 * @param {Function} The callback function.
 */
export const httpManagerGet = (request: SpotifyWebRequest, callback: any) => {
  const options = httpManagerGetParametersFromRequest(request);
  const method = superagent.get;

  httpManagerMakeRequest(method, options, swrGetURI(request), callback);
};

/**
 * Make a HTTP POST request.
 * @param {BaseRequest} The request.
 * @param {Function} The callback function.
 */
export const httpManagerPost = (request: SpotifyWebRequest, callback: any) => {
  const options = httpManagerGetParametersFromRequest(request);
  const method = superagent.post;

  httpManagerMakeRequest(method, options, swrGetURI(request), callback);
}

/*
  Make a HTTP DELETE request.
  @param {BaseRequest} The request.
  @param {Function} The callback function.
*/
export const httpManagerDelete = (request: SpotifyWebRequest, callback: any) => {
  const options = httpManagerGetParametersFromRequest(request);
  const method = superagent.del;

  httpManagerMakeRequest(method, options, swrGetURI(request), callback);
};

/**
 * Make a HTTP PUT request.
 * @param {BaseRequest} The request.
 * @param {Function} The callback function.
 */
export const httpManagerPut = (request: SpotifyWebRequest, callback: any) => {
  const options = httpManagerGetParametersFromRequest(request);
  const method = superagent.put;

  httpManagerMakeRequest(method, options, swrGetURI(request), callback);
};
