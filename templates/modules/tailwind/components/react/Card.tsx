import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
}

const Card = ({ 
  children, 
  className,
  padding = 'md',
  shadow = 'md',
  hover = false
}: CardProps) => {
  const baseClasses = 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg'
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }
  
  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200' : ''
  
  return (
    <div
      className={clsx(
        baseClasses,
        paddingClasses[padding],
        shadowClasses[shadow],
        hoverClasses,
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

const CardHeader = ({ children, className }: CardHeaderProps) => (
  <div className={clsx('border-b border-gray-200 dark:border-gray-700 pb-3 mb-4', className)}>
    {children}
  </div>
)

interface CardTitleProps {
  children: ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const CardTitle = ({ children, className, as: Component = 'h3' }: CardTitleProps) => (
  <Component className={clsx('text-lg font-semibold text-gray-900 dark:text-gray-100', className)}>
    {children}
  </Component>
)

interface CardContentProps {
  children: ReactNode
  className?: string
}

const CardContent = ({ children, className }: CardContentProps) => (
  <div className={clsx('text-gray-600 dark:text-gray-300', className)}>
    {children}
  </div>
)

interface CardFooterProps {
  children: ReactNode
  className?: string
}

const CardFooter = ({ children, className }: CardFooterProps) => (
  <div className={clsx('border-t border-gray-200 dark:border-gray-700 pt-3 mt-4', className)}>
    {children}
  </div>
)

// Export compound component
Card.Header = CardHeader
Card.Title = CardTitle
Card.Content = CardContent
Card.Footer = CardFooter

export default Card