import { createHash, randomBytes } from 'crypto'
const algorithm = 'aes-256-ctr';
const password = '8342h9hq3odmh47ho438';
const iv = randomBytes(12);
const authTagLength = 16;

const key = createHash('sha256').update(password).digest('base64').substr(0, 32);

export {key, algorithm, iv, authTagLength}