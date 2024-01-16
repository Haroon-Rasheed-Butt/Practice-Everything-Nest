import { Injectable } from '@nestjs/common';
import * as OktaJwtVerifier from '@okta/jwt-verifier';

import { ConfigService } from '../config/config.service';
import axios from 'axios';

@Injectable()
export class AuthService {
  private oktaVerifier: OktaJwtVerifier;
  private audience: string;
  private readonly oktaBaseUrl: string; // Replace with your Okta base URL
  private readonly clientId: string; // Replace with your Okta client ID
  private readonly clientSecret: string; // Replace with your Okta client secret

 
  constructor(private readonly config: ConfigService) {
    
    this.oktaBaseUrl = config.get('OKTA_BASE_URL');
    this.clientId = config.get('OKTA_CLIENT_ID');
    this.clientSecret = config.get('OKTA_CLIENT_SECRET');

    this.oktaVerifier = new OktaJwtVerifier({
        issuer: config.get('OKTA_ISSUER'),
        clientId: config.get('OKTA_CLIENT_ID'),
    });

    this.audience = config.get('OKTA_AUDIENCE');
  } 

  // what is okta audience
  async validateToken(accessToken: string): Promise<any> {

    const introspectUrl = `${this.oktaBaseUrl}/oauth2/default/v1/introspect`;

    // Combine client ID and secret and encode in Base64
    const clientCredentials = `${this.clientId}:${this.clientSecret}`;
    const base64ClientCredentials = Buffer.from(clientCredentials).toString('base64');

    // Add headers and any additional configuration as needed
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${base64ClientCredentials}`,
      },
    };

    // Add the token to the request body in URL-encoded form
    const data = new URLSearchParams();
    data.append('token', accessToken);

    try {
      const response = await axios.post(introspectUrl, data.toString(), config);
      return response.data;
    } catch (error) {
      // Handle errors
      throw error;
    }

    // const jwt = await this.oktaVerifier.verifyAccessToken(accessToken, this.audience);
    // return jwt;
  }

}