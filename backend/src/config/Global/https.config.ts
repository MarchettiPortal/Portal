import fs from 'fs';

export const httpsConfig  = {
    key: fs.readFileSync('src\\cert\\key.key'),
    cert:fs.readFileSync('src\\cert\\cert.crt'),
    ca:fs.readFileSync('src\\cert\\ca.crt')
};
