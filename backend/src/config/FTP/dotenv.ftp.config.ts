import 'dotenv/config';
import { getEnvVar } from '../../utils/env';


const dotenvConfig = {
    host: getEnvVar('FTP_HOST'),
    user: getEnvVar('FTP_USER'),
    password: getEnvVar('FTP_PASS'),
    port: parseInt(getEnvVar('FTP_PORT'), 10)
};

export default dotenvConfig;