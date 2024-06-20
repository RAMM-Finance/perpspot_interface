export function isDevelopmentEnv(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function isTestEnv(): boolean {
  return process.env.NODE_ENV === 'test'
}

export function isStagingEnv(): boolean {
  // This is set in vercel builds.
  return Boolean(process.env.REACT_APP_STAGING)
}

export function isProductionEnv(): boolean {
  console.log("PROCESS NODE NEV", process.env.REACT_APP_NODE_ENV)
  console.log(process.env.REACT_APP_NODE_ENV === 'production')
  console.log("ISSTAGINGENV", isStagingEnv())
  return process.env.REACT_APP_NODE_ENV === 'production' && !isStagingEnv()
  // return process.env.NODE_ENV === 'production' && !isStagingEnv()
}

export function isAppUniswapOrg({ hostname }: { hostname: string }): boolean {
  return hostname === 'app.uniswap.org'
}

export function isLimitlessfiApp({ hostname }: { hostname: string }): boolean {
  return hostname === 'limitlessfi.app'
}


export function isSentryEnabled(): boolean {
  // Disable in e2e test environments
  if (isStagingEnv() || (isProductionEnv() && !isLimitlessfiApp(window.location))) return false
  return process.env.REACT_APP_SENTRY_ENABLED === 'true'
}

export function getEnvName(): 'production' | 'staging' | 'development' {
  if (isStagingEnv()) {
    return 'staging'
  }
  if (isProductionEnv()) {
    return 'production'
  }
  return 'development'
}
