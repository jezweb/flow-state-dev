import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('App', () => {
  test('renders learn react link', () => {
    render(<App />, { wrapper: AppWrapper })
    const linkElement = screen.getByText(/vite \+ react/i)
    expect(linkElement).toBeInTheDocument()
  })

  test('navigation links are present', () => {
    render(<App />, { wrapper: AppWrapper })
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })
})