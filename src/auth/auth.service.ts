import { Injectable } from '@nestjs/common';
import * as OktaJwtVerifier from '@okta/jwt-verifier';

import { ConfigService } from '../config/config.service';

@Injectable()
export class AuthService {
  private oktaVerifier: any;
  private audience: string;

  constructor(private readonly config: ConfigService) {
    this.oktaVerifier = new OktaJwtVerifier({
        issuer: config.get('OKTA_ISSUER'),
        clientId: config.get('OKTA_CLIENT_ID'),
    });

    this.audience = config.get('OKTA_AUDIENCE');
  } 

  // what is okta audience
  async validateToken(token: string): Promise<any> {
    const jwt = await this.oktaVerifier.verifyAccessToken(token, this.audience);
    return jwt;
  }

}