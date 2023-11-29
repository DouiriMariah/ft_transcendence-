import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { Injectable } from '@nestjs/common';
import { PrismaManagerService } from 'src/prisma_manager/prisma_manager.service';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { totp } from 'notp';

@Injectable()
export class TwoFactorAuthenticationService {
    constructor(private prisma: PrismaManagerService, private config: ConfigService){}
    private initVector = Buffer.from('c6e34a01c657b2b403a6878f5039578d', 'hex'); //A stocker dans l'env 
    private Securitykey = Buffer.from('ca48b36c800c7376d99f6080bbcc6fe28f2a2459886aa2041180abfc2d6d9ad4', 'hex'); //A stocker dans l'env
    private algorithm = 'aes-256-cbc';
    private key = 'YourSecretKey';
    
    async checkUser(user_mail: string){
      const user = await this.prisma.user.findUnique({
        where:{
            email: user_mail,
        },
        select:{ 
            password_A2f: true,
        }
    })
    if(user.password_A2f)
        return user.password_A2f;
    return false;
  }

  encrypt(text: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, this.Securitykey, this.initVector);
    let encryptedData = cipher.update(text, "utf-8", "hex");
    encryptedData += cipher.final("hex");
    return encryptedData;
  }

  decrypt(encryptedText: string): string {
    const decipher = crypto.createDecipheriv(this.algorithm, this.Securitykey, this.initVector);
    let decryptedData = decipher.update(encryptedText, "hex", "utf-8");
    decryptedData += decipher.final("utf8");
    return decryptedData;
  }

  async generateSecretKey(info: ft_User): Promise<string> {
    const secret = speakeasy.generateSecret(); //For Yangchi is already hashed so no need
    const hash = this.encrypt(secret.base32);
    const user = await this.prisma.user.update({
        where: {
            email: info.email,
        },
        data: {
            password_A2f: hash, 
        }
    })
    return secret.base32;
  }

  async generateQrCode(username: string, secretKey: string): Promise<string> {
    const otpAuthUrl = speakeasy.otpauthURL({
      secret: secretKey,
      label: username,
      issuer: 'Your App',
    });
    const qrCodeImageBuffer = await qrcode.toBuffer(otpAuthUrl);
    const qrCodeDataUrl = `data:image/png;base64,${qrCodeImageBuffer.toString('base64')}`;

    return qrCodeDataUrl;
  }

  async verifyOtp(secretKey: string, otp: string): Promise<boolean> {
    const key = this.decrypt(secretKey);
    const verified = totp.verify(otp, key);
    if(verified) {
      return true;
    } else
      return false;
  }

  async deleteA2f(username: string)
  {
    const user = await this.prisma.user.update({
      where: {
        nickname: username,
      },
      data: {
        password_A2f: null,
      },
    });
    if(user)
      return user;
    else 
      return false;
  }
}
