import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { AuthService } from './auth.service';


@Injectable()
export class HttpStrategy extends PassportStrategy(Strategy){
    constructor(private readonly authService: AuthService){
        super();
    }

    async validate(
        token: string,
        done: (error: HttpException, value: boolean|string) => any
    ){
        try{
            const data:any = await this.authService.validateToken(token);
            if(!data?.active){
                throw new HttpException('Unable to authenticate', HttpStatus.UNAUTHORIZED);
            }
            return data;
        }catch(error){
            done(error, 'The token is not valid');
        }
    }
}
