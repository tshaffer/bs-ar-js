import { AuthenticationRequest } from './authenticationRequest';
import { httpManagerGet, httpManagerPost } from './httpManager';

import { SpotifyCredentials, SpotifyWebRequest } from '../types';
import {
  swrCreateSpotifyWebRequest,
  swrExecute,
  swrGetURL
} from './spotifyWebRequest';

export class SpotifyWebApi {

  credentials: SpotifyCredentials;

  constructor(credentials: SpotifyCredentials) {
    this.credentials = credentials;
  }

  setAccessToken(accessToken: string) {
    this.credentials.accessToken = accessToken;
  }

  getAccessToken(): string {
    return this.credentials.accessToken as string;
  }

  setRefreshToken(refreshToken: string) {
    this.credentials.refreshToken = refreshToken;
  };

  getRefreshToken(): string {
    return this.credentials.refreshToken as string;
  }

  //  * Retrieve a URL where the user can give the application permissions.
  //  * @param {string[]} scopes The scopes corresponding to the permissions the application needs.
  //  * @param {string} state A parameter that you can use to maintain a value between the request and the callback to redirect_uri.It is useful to prevent CSRF exploits.
  //  * @param {boolean} showDialog A parameter that you can use to force the user to approve the app on each login rather than being automatically redirected.
  //  * @param {string} responseType An optional parameter that you can use to specify the code response based on the authentication type - can be set to 'code' or 'token'. Default 'code' to ensure backwards compatability.
  //  * @returns {string} The URL where the user can give application permissions.
  createAuthorizeURL(scopes: any, state?: any, showDialog?: any, responseType = 'code'): string {

    const authenticationRequest: AuthenticationRequest = new AuthenticationRequest();
    authenticationRequest.path = '/authorize';
    authenticationRequest.queryParameters = {
      client_id: this.credentials.clientId,
      response_type: responseType,
      redirect_uri: 'http://localhost:8888/callback',
      scope: scopes.join('%20'),
      state,
      show_dialog: showDialog && !!showDialog
    }

    const spotifyWebRequest: SpotifyWebRequest = swrCreateSpotifyWebRequest(
      authenticationRequest.host,
      authenticationRequest.port,
      authenticationRequest.scheme,
      authenticationRequest.path,
      undefined,
      authenticationRequest.queryParameters,
      undefined,
    );

    const url: string = swrGetURL(spotifyWebRequest);
    return url;
  }

  /**
   * Request an access token using the Authorization Code flow.
   * Requires that client ID, client secret, and redirect URI has been set previous to the call.
   * @param {string} code The authorization code returned in the callback in the Authorization Code flow.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful, resolves into an object containing the access token,
   *          refresh token, token type and time to expiration. If rejected, it contains an error object.
   *          Not returned if a callback is given.
   */
  authorizationCodeGrant(code: string, callback?: any): any {
    const authenticationRequest: AuthenticationRequest = new AuthenticationRequest();
    authenticationRequest.path = '/api/token';
    authenticationRequest.bodyParameters = {
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:8888/callback',
      code,
      client_id: '039a29e66a4b49508dd6de7ae97a3435',
      client_secret: '7e624b296e7c4a4f8b52d6e6d4531029',
    };
    authenticationRequest.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

    const spotifyWebRequest: SpotifyWebRequest = swrCreateSpotifyWebRequest(
      authenticationRequest.host,
      authenticationRequest.port,
      authenticationRequest.scheme,
      authenticationRequest.path,
      authenticationRequest.headers,
      undefined,
      authenticationRequest.bodyParameters,
    );

    return swrExecute(spotifyWebRequest, httpManagerPost, callback);
  };

  /**
   * Refresh the access token given that it hasn't expired.
   * Requires that client ID, client secret and refresh token has been set previous to the call.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful, resolves to an object containing the
   *          access token, time to expiration and token type. If rejected, it contains an error object.
   *          Not returned if a callback is given.
   */
  refreshAccessToken(callback?: any): any {
    const authenticationRequest: AuthenticationRequest = new AuthenticationRequest();
    authenticationRequest.path = '/api/token';
    authenticationRequest.bodyParameters = {
      grant_type: 'refresh_token',
      refresh_token: this.getRefreshToken()
    };
    authenticationRequest.headers = {
      Authorization:
        'Basic ' +
        new Buffer(
          this.credentials.clientId + ':' + this.credentials.clientSecret
        ).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'

    };

    const spotifyWebRequest: SpotifyWebRequest = swrCreateSpotifyWebRequest(
      authenticationRequest.host,
      authenticationRequest.port,
      authenticationRequest.scheme,
      authenticationRequest.path,
      authenticationRequest.headers,
      undefined,
      authenticationRequest.bodyParameters,
    );

    return swrExecute(spotifyWebRequest, httpManagerPost, callback);
  }

  getMe(accessToken: string): any {

    const spotifyWebRequest: SpotifyWebRequest = swrCreateSpotifyWebRequest(
      'api.spotify.com',
      443,
      'https',
      '/v1/me',
      { Authorization: 'Bearer ' + accessToken },
      undefined,
      undefined,
    );

    return swrExecute(spotifyWebRequest, httpManagerGet, undefined);
  }
}