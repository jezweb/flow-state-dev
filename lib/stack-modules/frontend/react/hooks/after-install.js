/**
 * After install hook for React module
 * Performs post-installation setup
 */
export default async function afterInstall(context) {
  console.log('✅ React project structure created successfully!')
  
  // Provide next steps based on configuration
  console.log('\n📋 Next steps:')
  console.log('1. Install dependencies: npm install')
  console.log('2. Start development server: npm run dev')
  
  if (context.reactConfig?.typescript) {
    console.log('3. TypeScript is configured and ready to use')
  }
  
  if (context.reactConfig?.router) {
    console.log('4. React Router is set up with example routes')
  }
  
  if (context.reactConfig?.stateManagement !== 'context') {
    console.log(`5. ${context.reactConfig.stateManagement} is configured for state management`)
  }
  
  // UI library specific instructions
  const uiModule = context.modules?.find(m => m.category === 'ui-library')
  if (uiModule) {
    console.log(`\n🎨 ${uiModule.displayName} will be configured after installation`)
  }
  
  return context
}