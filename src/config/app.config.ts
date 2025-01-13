export const appConfig = {
    // Email Configuration
    email: {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT, 10) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
      from: process.env.EMAIL_FROM || 'your-app@example.com',
    },
    
    // Midtrans Configuration
    midtrans: {
        redirectUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
      isProduction: process.env.MIDTRANS_IS_PRODUCTION,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
      merchantId: process.env.MIDTRANS_MERCHANT_ID,

    },
    
    // Application Settings
    app: {
      paymentExpiryHours: parseInt(process.env.PAYMENT_EXPIRY_HOURS, 10) || 2,
      meetingLinkExpiryHours: parseInt(process.env.MEETING_LINK_EXPIRY_HOURS, 10) || 2,
      maxRescheduleAttempts: parseInt(process.env.MAX_RESCHEDULE_ATTEMPTS, 10) || 3,
      adminFeePercentage: parseInt(process.env.ADMIN_FEE_PERCENTAGE, 10) || 10,
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    }
  };
  
  