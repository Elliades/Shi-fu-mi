import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import Game from './Game.svelte'

describe('Game route – functional', () => {
  it('shows target score and empty row on load', () => {
    render(Game)

    expect(screen.getByRole('region', { name: /target score/i })).toBeInTheDocument()
    const emptySlots = screen.getAllByTestId('slot')
    expect(emptySlots).toHaveLength(3)
    emptySlots.forEach((slot) => {
      expect(slot).toHaveTextContent('·')
    })
  })

  it('lets the player enter moves, erase, and submit an attempt', async () => {
    const user = userEvent.setup()
    render(Game)

    const buttons = {
      rock: screen.getByRole('button', { name: /rock/i }),
      paper: screen.getByRole('button', { name: /paper/i }),
      scissor: screen.getByRole('button', { name: /scissor/i }),
      erase: screen.getByRole('button', { name: /erase/i }),
      submit: screen.getByRole('button', { name: /submit attempt/i }),
    }

    expect(buttons.submit).toBeDisabled()

    await user.click(buttons.paper)
    await user.click(buttons.rock)
    await user.click(buttons.paper)

    let filledSlots = screen.getAllByTestId('slot')
    expect(filledSlots.map((slot) => slot.textContent)).toEqual(['P', 'R', 'P'])
    expect(buttons.submit).toBeEnabled()

    await user.click(buttons.erase)
    filledSlots = screen.getAllByTestId('slot')
    expect(filledSlots.map((slot) => slot.textContent)).toEqual(['P', 'R', '·'])
    expect(buttons.submit).toBeDisabled()

    await user.click(buttons.paper)
    await user.click(buttons.submit)

    const attemptSummary = await screen.findByRole('region', { name: /attempts/i })
    expect(attemptSummary).toHaveTextContent(/attempts: 1/i)
    expect(attemptSummary).toHaveTextContent(/wins: \d/i)
    expect(attemptSummary).toHaveTextContent(/ties: \d/i)
    expect(attemptSummary).toHaveTextContent(/losses: \d/i)

    // Active row resets after submission
    filledSlots = screen.getAllByTestId('slot')
    expect(filledSlots.map((slot) => slot.textContent)).toEqual(['·', '·', '·'])
  })
})
