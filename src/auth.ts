type TokenOptions = {
  readonly token?: string | undefined
}

type EnvVars = Readonly<
  Record<string, string | undefined> & {
    readonly GITHUB_TOKEN?: string | undefined
  }
>

export function resolveGitHubToken(options: TokenOptions, env: EnvVars): string | undefined {
  if (options.token !== undefined) {
    return options.token
  }

  const envToken = env.GITHUB_TOKEN

  if (envToken === undefined || envToken.trim() === "") {
    return undefined
  }

  return envToken
}
