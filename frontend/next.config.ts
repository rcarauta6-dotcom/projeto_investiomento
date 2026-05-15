import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    // No Kubernetes, o gateway é acessível pelo nome do serviço + namespace
    const gatewayUrl = process.env.GATEWAY_URL || 'http://gateway.gateway-ns:8080';
    
    return [
      {
        source: '/gateway/:path*',
        destination: gatewayUrl + '/gateway/:path*',
      },
      {
        source: '/api/:path*',
        destination: gatewayUrl + '/api/:path*',
      },
    ];
  },
};

export default nextConfig;
