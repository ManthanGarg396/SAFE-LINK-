import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DemoCenterPage } from '../pages/DemoCenterPage';

describe('DemoCenterPage Component', () => {
  it('should render the Simulation Center header and subtitle correctly', () => {
    const handleSelect = vi.fn();
    render(<DemoCenterPage onSelectScenario={handleSelect} />);

    expect(screen.getByText('Scenario Simulation Playground')).toBeTruthy();
    expect(
      screen.getByText(/Select any preset safety event to test Safe-Link AI/i)
    ).toBeTruthy();
  });

  it('should render all 6 required demo scenarios', () => {
    const handleSelect = vi.fn();
    render(<DemoCenterPage onSelectScenario={handleSelect} />);

    // Verify presence of all 6 interactive scenario titles
    expect(screen.getAllByText(/Possible Fall-like Motion/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Earthquake Alert Banner/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Campus Flood Warning/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Critical Medical Emergency/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Image-to-Hazard Recognition/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Doctor Summary & Translator/i).length).toBeGreaterThan(0);
  });

  it('should fire onSelectScenario callback when a simulation is triggered', () => {
    const handleSelect = vi.fn();
    render(<DemoCenterPage onSelectScenario={handleSelect} />);

    // Query all "Simulate Scenario" buttons
    const simulateButtons = screen.getAllByRole('button', { name: /Simulate Scenario/i });
    expect(simulateButtons.length).toBe(6);

    // Fire simulation click on Scenario 1
    fireEvent.click(simulateButtons[0]);
    expect(handleSelect).toHaveBeenCalledWith(11); // ID 11 corresponds to DEMO 1 - Possible Fall
  });
});
