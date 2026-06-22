interface CloudflareEnv {
  lg_product_db: D1Database;
  lg_product_images: R2Bucket;
  [key: string]: unknown;
}

declare global {
  interface Request {
    json(): Promise<any>;
  }
}
