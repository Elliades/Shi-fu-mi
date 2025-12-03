import { fireEvent, render, screen } from '@testing-library/svelte'
import { describe, it, expect, vi } from 'vitest'
import InputPadHarness from './InputPad.harness.svelte'

describe('InputPad', () => {
  it('renders move buttons and emits move events', async () => {
    const onMove = vi.fn()
    render(InputPadHarness, { onMove })
    const rockButton = screen.getByRole('button', { name: /rock/i })
    await fireEvent.click(rockButton)

    expect(onMove).toHaveBeenCalledWith('rock')
  })

  it('respects disabled states for erase and submit controls', async () => {
    render(InputPadHarness, { canErase: false, canSubmit: false })

    const eraseButton = screen.getByRole('button', { name: /erase/i })
    const submitButton = screen.getByRole('button', { name: /submit attempt/i })

    expect(eraseButton).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })

  it('emits erase and submit events when enabled', async () => {
    const onErase = vi.fn()
    const onSubmit = vi.fn()
    render(InputPadHarness, {
      canErase: true,
      canSubmit: true,
      onErase,
      onSubmit,
    })

    await fireEvent.click(screen.getByRole('button', { name: /erase/i }))
    await fireEvent.click(screen.getByRole('button', { name: /submit attempt/i }))

    expect(onErase).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
