/**
 * Before install hook for Tailwind CSS module
 * Detects framework and prepares configuration
 */
export default async function beforeInstall(context) {
  console.log('🎨 Preparing Tailwind CSS installation...')
  
  // Detect frontend framework
  const frontendModule = context.modules?.find(m => 
    m.category === 'frontend-framework'
  )
  
  const framework = frontendModule?.name || null
  
  if (!framework) {
    console.log('⚠️  No frontend framework detected. Tailwind will be configured for generic use.')
  } else {
    console.log(`✅ Detected framework: ${framework}`)
    console.log(`📦 Component examples will be created for ${framework}`)
  }
  
  // Configuration options
  const config = {
    framework,
    darkMode: context.options?.darkMode || 'class',
    plugins: context.options?.plugins || ['forms'],
    componentExamples: context.options?.componentExamples !== false,
    customColors: context.options?.customColors !== false
  }
  
  console.log('🔧 Configuration:')
  console.log(`  - Dark mode: ${config.darkMode}`)
  console.log(`  - Plugins: ${config.plugins.join(', ')}`)
  console.log(`  - Component examples: ${config.componentExamples}`)
  
  return {
    ...context,
    tailwindConfig: config
  }
}