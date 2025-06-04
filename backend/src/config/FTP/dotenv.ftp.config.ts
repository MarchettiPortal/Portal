import "dotenv/config";

const dotenvConfig = {
    host:process.env.FTP_HOST,
    user:process.env.FTP_USER,
    password:process.env.FTP_PASS,
};

export default dotenvConfig;