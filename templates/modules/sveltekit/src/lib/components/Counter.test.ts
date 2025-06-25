import { render, fireEvent, screen } from '@testing-library/svelte'
import { describe, it, expect } from 'vitest'
import Counter from './Counter.svelte'

describe('Counter', () => {
	it('increments count when clicked', async () => {
		render(Counter)
		const button = screen.getByRole('button')
		
		expect(button).toHaveTextContent('Clicks: 0')
		
		await fireEvent.click(button)
		expect(button).toHaveTextContent('Clicks: 1')
		
		await fireEvent.click(button)
		expect(button).toHaveTextContent('Clicks: 2')
	})
})