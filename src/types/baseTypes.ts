
export interface SpotifyApiConfiguration {
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  DEFAULT_REDIRECT_URI: string;
  DEFAULT_HOST: string;
  DEFAULT_PORT: number;
  DEFAULT_SCHEME: string;
}

export interface SpotifyCredentials {
  redirectUri: string;
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  refreshToken?: string;
} 

export interface SpotifyWebRequest {
  host: string;
  port: number;
  scheme: string;
  path: string;
  headers: any;
  queryParameters: any;
  bodyParameters: any;
}