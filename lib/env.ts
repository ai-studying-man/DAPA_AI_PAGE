export type DeploymentProfile = "local" | "public-cloud" | "institution" | "closed";

export type RuntimeEnv = {
  deploymentProfile: DeploymentProfile;
  closedNetwork: boolean;
  lawOpenApiOc?: string;
  publicDataApiKey?: string;
  ollama: {
    baseUrl: string;
    model: string;
    timeoutMs: number;
    enabled: boolean;
    noCloud: boolean;
  };
};

type EnvInput = Record<string, string | undefined>;

const DEPLOYMENT_PROFILES: DeploymentProfile[] = ["local", "public-cloud", "institution", "closed"];

function parseDeploymentProfile(value: string | undefined): DeploymentProfile {
  if (!value) return "local";
  if (DEPLOYMENT_PROFILES.includes(value as DeploymentProfile)) return value as DeploymentProfile;
  throw new Error("DEPLOYMENT_PROFILE must be one of local, public-cloud, institution, closed");
}

function parseBoolean(value: string | undefined, defaultValue: boolean) {
  if (value === undefined || value === "") return defaultValue;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error("Boolean env values must be true or false");
}

function parsePositiveInteger(name: string, value: string | undefined, defaultValue: number) {
  if (value === undefined || value === "") return defaultValue;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`${name} must be a positive integer`);
  return parsed;
}

function trimOptional(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function parseRuntimeEnv(env: EnvInput = process.env): RuntimeEnv {
  const deploymentProfile = parseDeploymentProfile(env.DEPLOYMENT_PROFILE);
  const closedNetwork = deploymentProfile === "closed";

  return {
    deploymentProfile,
    closedNetwork,
    lawOpenApiOc: trimOptional(env.LAW_OPEN_API_OC),
    publicDataApiKey: trimOptional(env.PUBLIC_DATA_API_KEY),
    ollama: {
      baseUrl: trimOptional(env.OLLAMA_BASE_URL) || "http://127.0.0.1:11434",
      model: trimOptional(env.OLLAMA_MODEL) || "qwen3.5:4b",
      timeoutMs: parsePositiveInteger("OLLAMA_TIMEOUT_MS", env.OLLAMA_TIMEOUT_MS, 30_000),
      enabled: parseBoolean(env.OLLAMA_ENABLED, true),
      noCloud: parseBoolean(env.OLLAMA_NO_CLOUD, closedNetwork)
    }
  };
}

export const runtimeEnv = parseRuntimeEnv();
