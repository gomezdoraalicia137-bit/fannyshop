let cachedEnv: Record<string, string | undefined> | null = null;

function readCloudflareEnv(): Record<string, string | undefined> | null {
  try {
    const req = eval("require") as NodeJS.Require;
    const mod = req("@opennextjs/cloudflare") as {
      getCloudflareContext?: () => { env?: Record<string, unknown> };
    };
    const env = mod.getCloudflareContext?.().env;
    return (env ?? null) as Record<string, string | undefined> | null;
  } catch {
    return null;
  }
}

export function getEnv(key: string): string | undefined {
  const fromProcess = process.env[key];
  if (fromProcess) return fromProcess;

  if (!cachedEnv) cachedEnv = readCloudflareEnv();
  const value = cachedEnv?.[key];
  return typeof value === "string" ? value : undefined;
}

export function requireEnv(key: string): string {
  const value = getEnv(key);
  if (!value) throw new Error(`${key} no está configurado.`);
  return value;
}
