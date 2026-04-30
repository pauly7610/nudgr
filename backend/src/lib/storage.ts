import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";

const LOCAL_STORAGE_ROOT = path.resolve(process.cwd(), "storage");
const useLocalObjectStorage =
  env.NODE_ENV === "development" &&
  env.DISABLE_AUTH &&
  (env.S3_ENDPOINT === "https://example.com" ||
    env.S3_ENDPOINT === "https://your-s3-endpoint" ||
    env.S3_ACCESS_KEY_ID === "local-dev-key");

const resolveLocalStoragePath = (key: string): string => {
  const target = path.resolve(LOCAL_STORAGE_ROOT, key);
  if (!target.startsWith(`${LOCAL_STORAGE_ROOT}${path.sep}`) && target !== LOCAL_STORAGE_ROOT) {
    throw new Error("Invalid storage key");
  }

  return target;
};

const s3 = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: env.S3_FORCE_PATH_STYLE,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY
  }
});

export const uploadObject = async (params: {
  key: string;
  body: Buffer;
  contentType?: string;
}): Promise<void> => {
  if (useLocalObjectStorage) {
    const target = resolveLocalStoragePath(params.key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, params.body);
    await writeFile(`${target}.meta.json`, JSON.stringify({ contentType: params.contentType ?? null }));
    return;
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType
    })
  );
};

export const downloadObject = async (
  key: string
): Promise<{ body: Buffer; contentType: string | null }> => {
  if (useLocalObjectStorage) {
    const target = resolveLocalStoragePath(key);
    const [body, metaRaw] = await Promise.all([
      readFile(target),
      readFile(`${target}.meta.json`, "utf8").catch(() => "{}")
    ]);
    const meta = JSON.parse(metaRaw) as { contentType?: unknown };

    return {
      body,
      contentType: typeof meta.contentType === "string" ? meta.contentType : null
    };
  }

  const response = await s3.send(
    new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key
    })
  );

  if (!response.Body) {
    throw new Error("Storage object body is empty");
  }

  const bytes = await response.Body.transformToByteArray();
  return {
    body: Buffer.from(bytes),
    contentType: response.ContentType ?? null
  };
};

export const deleteObject = async (key: string): Promise<void> => {
  if (useLocalObjectStorage) {
    const target = resolveLocalStoragePath(key);
    await Promise.all([
      rm(target, { force: true }),
      rm(`${target}.meta.json`, { force: true })
    ]);
    return;
  }

  await s3.send(
    new DeleteObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key
    })
  );
};
