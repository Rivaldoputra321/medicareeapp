declare namespace NodeJS{
    export interface ProcessEnv{
        EMAIL_HOST: string;
        EMAIL_PORT: string;
        EMAIL_SECURE: string;
        EMAIL_USER : string;
        EMAIL_PASSWORD : string;
        EMAIL_FROM : string;


        MIDTRANS_SERVER_KEY : string;
        MIDTRANS_CLIENT_KEY : string;
        MIDTRANS_MERCHANT_ID : string;
        MIDTRANS_IS_PRODUCTION : string;
        DATABASE_URL : string;
        jwtSecretKey: string;
        jwtRefreshTokenKey: string;
    }
}