// Framework configuration for Flow State Dev
import chalk from 'chalk';

export const frameworks = [
  {
    value: 'minimal',
    name: `${chalk.blue('📦')} Minimal Setup ${chalk.gray('(No framework yet)')}`,
    short: 'Minimal Setup',
    description: 'Basic HTML/CSS/JS with Vite - choose a framework later',
    templateDir: 'minimal-base',
    available: true,
    features: [
      'Vite build tooling',
      'ESLint + Prettier',
      'Basic project structure',
      'Framework selection guide',
      'Easy upgrade path'
    ]
  },
  {
    value: 'vue-vuetify',
    name: `${chalk.green('✅')} Vue 3 + Vuetify ${chalk.gray('(recommended)')}`,
    short: 'Vue 3 + Vuetify',
    description: 'Vue 3 with Vuetify Material Design components',
    templateDir: 'vue-vuetify',
    available: true,
    features: [
      'Vue 3 Composition API',
      'Vuetify 3 Material Design',
      'Supabase authentication',
      'Pinia state management',
      'Vue Router',
      'TypeScript ready'
    ]
  },
  {
    value: 'react-mui',
    name: `${chalk.yellow('🔜')} React + Material UI ${chalk.gray('(coming soon)')}`,
    short: 'React + Material UI',
    description: 'React with Material UI components',
    templateDir: 'react-mui',
    available: false,
    comingSoon: true,
    features: [
      'React 18 with hooks',
      'Material UI v5',
      'Supabase integration',
      'React Router',
      'TypeScript support'
    ]
  },
  {
    value: 'vue-tailwind',
    name: `${chalk.yellow('🔜')} Vue 3 + Tailwind ${chalk.gray('(coming soon)')}`,
    short: 'Vue 3 + Tailwind',
    description: 'Vue 3 with Tailwind CSS utility-first styling',
    templateDir: 'vue-tailwind',
    available: false,
    comingSoon: true,
    features: [
      'Vue 3 Composition API',
      'Tailwind CSS 3',
      'Headless UI components',
      'Supabase integration',
      'TypeScript ready'
    ]
  },
  {
    value: 'sveltekit',
    name: `${chalk.yellow('🔜')} SvelteKit + Skeleton UI ${chalk.gray('(coming soon)')}`,
    short: 'SvelteKit + Skeleton UI',
    description: 'SvelteKit with Skeleton UI design system',
    templateDir: 'sveltekit',
    available: false,
    comingSoon: true,
    features: [
      'SvelteKit full-stack',
      'Skeleton UI design system',
      'Server-side rendering',
      'Supabase integration',
      'TypeScript first'
    ]
  }
];

export function getFramework(value) {
  return frameworks.find(f => f.value === value);
}

export function getAvailableFrameworks() {
  return frameworks.filter(f => f.available);
}

export function formatFrameworkInfo(framework) {
  let info = `\n${chalk.blue('Framework:')} ${framework.short}\n`;
  info += `${chalk.gray(framework.description)}\n\n`;
  
  if (framework.features && framework.features.length > 0) {
    info += `${chalk.blue('Features:')}\n`;
    framework.features.forEach(feature => {
      info += `  ${chalk.gray('•')} ${feature}\n`;
    });
  }
  
  return info;
}