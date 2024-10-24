import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { createReadStream, createWriteStream } from 'fs';
import { Transform } from 'stream';

@Injectable()
export class EncryptionService {
    private readonly algorithm = 'aes-256-gcm';
    
    private readonly iv = Buffer.from(process.env.IV,'hex');
    private readonly key = Buffer.from(process.env.KEY,'hex')
    // Função para encriptar dados
    encryptData(data: Buffer) {
        const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
        const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
        const authTag = cipher.getAuthTag();
        return { encrypted, authTag };
    }

    // Função para decriptar dados
    decryptData(encrypted: Buffer, authTag: Buffer) {
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return decrypted;
    }

    // Função para encriptar arquivo completo
    async encryptFile(inputPath: string, outputPath: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const input = createReadStream(inputPath);
            const output = createWriteStream(outputPath);
            const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);

            input.pipe(cipher).pipe(output);
            output.on('finish', () => {
                const authTag = cipher.getAuthTag();
                resolve(authTag);
            });

            output.on('error', (err) => reject(err));
        });
    }

    // Função para decriptar arquivo completo
    async decryptFile(inputPath: string, outputPath: string, authTag: Buffer): Promise<void> {
        return new Promise((resolve, reject) => {
            const input = createReadStream(inputPath);
            const output = createWriteStream(outputPath);
            const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
            decipher.setAuthTag(authTag);

            input.pipe(decipher).pipe(output);
            output.on('finish', () => resolve());
            output.on('error', (err) => reject(err));
        });
    }

    // Função para criar stream de encriptação
    createEncryptionStream():Transform {
        let transform =  crypto.createCipheriv(this.algorithm, this.key, this.iv);
    
        
        return transform
    }

    // Função para criar stream de decriptação
    createDecryptionStream(authTag: Buffer): Transform {
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
        decipher.setAuthTag(authTag);
        return decipher;
    }
}
