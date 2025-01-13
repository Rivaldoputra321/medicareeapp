/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
              protocol: 'http',
              hostname: 'localhost',
              port: '8000',
              pathname: '/uploads/**',
            },
            // Add your production domain pattern here if needed
            // {
            //   protocol: 'https',
            //   hostname: 'your-production-domain.com',
            //   pathname: '/uploads/**',
            // }
          ],
      },
};

export default nextConfig;
