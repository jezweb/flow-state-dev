/**
 * Before install hook for React module
 * Validates environment and prepares for installation
 */
export default async function beforeInstall(context) {
  console.log('🚀 Preparing React 18 installation...')
  
  // Check Node.js version
  const nodeVersion = process.version
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1))
  
  if (majorVersion < 14) {
    throw new Error('React 18 requires Node.js 14 or higher. Current version: ' + nodeVersion)
  }
  
  // Prepare TypeScript files if enabled
  if (context.options?.typescript !== false) {
    console.log('📘 TypeScript support will be included')
  }
  
  // Check for router configuration
  if (context.options?.router !== false) {
    console.log('🧭 React Router will be configured')
  }
  
  // State management selection
  const stateManagement = context.options?.stateManagement || 'context'
  console.log(`📦 State management: ${stateManagement}`)
  
  return {
    ...context,
    reactConfig: {
      typescript: context.options?.typescript !== false,
      router: context.options?.router !== false,
      stateManagement,
      testing: context.options?.testing !== false
    }
  }
}