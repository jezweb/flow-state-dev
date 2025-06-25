/**
 * After install hook for Tailwind CSS module
 * Provides post-installation guidance
 */
export default async function afterInstall(context) {
  console.log('✅ Tailwind CSS has been configured successfully!')
  
  console.log('\n📋 What was added:')
  console.log('  - tailwind.config.js - Your Tailwind configuration')
  console.log('  - postcss.config.js - PostCSS configuration')
  console.log('  - CSS with Tailwind directives in src/index.css')
  
  if (context.tailwindConfig?.componentExamples) {
    console.log('  - Example UI components in src/components/ui/')
  }
  
  console.log('\n💡 Tailwind Tips:')
  console.log('  - Install VS Code Tailwind CSS IntelliSense extension')
  console.log('  - Use cn() utility for conditional classes')
  console.log('  - Customize your theme in tailwind.config.js')
  
  if (context.tailwindConfig?.darkMode === 'class') {
    console.log('  - Toggle dark mode by adding "dark" class to <html>')
  }
  
  console.log('\n🎨 Resources:')
  console.log('  - Tailwind Docs: https://tailwindcss.com/docs')
  console.log('  - Tailwind UI: https://tailwindui.com (Premium components)')
  console.log('  - Headless UI: https://headlessui.com (Unstyled accessible components)')
  
  return context
}