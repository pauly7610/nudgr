const usesPostgres = (): boolean => {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  return databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://");
};

export const prismaJsonPath = (field: string): never => {
  return (usesPostgres() ? [field] : `$.${field}`) as never;
};
