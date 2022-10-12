
export class AuthenticationRequest {

  private _host: string;
  private _port: number;
  private _scheme: string;

  private _path: string;
  private _queryParameters: any;
  private _bodyParameters: any;
  private _headers: any;

  constructor() {
    this.host = 'accounts.spotify.com';
    this.port = 443;
    this.scheme = 'https';
  }
  
  public get host(): string {
    return this._host;
  }

  public set host(theHost: string) {
    this._host = theHost;
  }

  public get port(): number {
    return this._port;
  }

  public set port(thePort: number) {
    this._port = thePort;
  }

  public get scheme(): string {
    return this._scheme;
  }

  public set scheme(theScheme: string) {
    this._scheme = theScheme;
  }

  public get path(): string {
    return this._path;
  }

  public set path(thePath: string) {
    this._path = thePath;
  }

  public get queryParameters(): any {
    return this._queryParameters;
  }

  public set queryParameters(theQueryParameters: any) {
    this._queryParameters = theQueryParameters;
  }

  public get headers(): any {
    return this._headers;
  }

  public set headers(theHeaders: any) {
    this._headers = theHeaders;
  }

  public get bodyParameters(): any {
    return this._bodyParameters;
  }

  public set bodyParameters(theBodyParameters: any) {
    this._bodyParameters = theBodyParameters;
  }
}
