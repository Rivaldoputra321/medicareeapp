import * as midtransClient from 'midtrans-client';

export const midtrans = new midtransClient.Snap({
  isProduction: false, // Set to `true` for production environment
  serverKey: process.env.MIDTRANS_SERVER_KEY, // Server Key from Midtrans Dashboard
  clientKey: process.env.MIDTRANS_CLIENT_KEY, // Client Key from Midtrans Dashboard
});
