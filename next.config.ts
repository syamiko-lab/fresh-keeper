import type { NextConfig } from "next";

// ローカル開発環境でのSSL証明書検証エラー回避
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
