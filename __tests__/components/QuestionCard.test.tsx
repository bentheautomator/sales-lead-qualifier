/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { QuestionCard } from '@/components/QuestionCard';
import type { Question } from '@/types';

describe('QuestionCard Component', () => {
  const mockQuestion: Question = {
    id: 'budget-range',
    text: "What's your annual budget for solutions in this area?",
    options: [
      {
        label: '$100K+',
        value: 'large',
        points: 100,
      },
      {
        label: '$25K - $100K',
        value: 'medium',
        points: 70,
      },
      {
        label: '$10K - $25K',
        value: 'small',
        points: 40,
      },
      {
        label: 'Under $10K or unsure',
        value: 'minimal',
        points: 0,
      },
    ],
  };

  describe('Rendering', () => {
    it('should render the question text', () => {
      render(
        <QuestionCard
          question={mockQuestion}
          selectedValue={undefined}
          onSelect={jest.fn()}
        />
      );

      expect(screen.getByText(mockQuestion.text)).toBeInTheDocument();
    });

    it('should render all option labels', () => {
      render(
        <QuestionCard
          question={mockQuestion}
          selectedValue={undefined}
          onSelect={jest.fn()}
        />
      );

      mockQuestion.options.forEach((option) => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });

    it('should render all options as buttons', () => {
      render(
        <QuestionCard
          question={mockQuestion}
          selectedValue={undefined}
          onSelect={jest.fn()}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(mockQuestion.options.length);
    });

    it('should render options in grid layout', () => {
      const { container } = render(
        <QuestionCard
          question={mockQuestion}
          selectedValue={undefined}
          onSelect={jest.fn()}
        />
      );

      const gridContainer = container.querySelector('div.grid');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass('grid-cols-1');
      expect(gridContainer).toHaveClass('sm:grid-cols-2');
    });
  });

  describe('Selection Handling', () => {
    it('should call onSelect with correct question ID and value when option is clicked', () => {
      const mockOnSelect = jest.fn();

      render(
        <QuestionCard
          question={mockQuestion}
          selectedValue={undefined}
          onSelect={mockOnSelect}
        />
      );

      const largeButton = screen.getByText('$100K+');
      fireEvent.click(largeButton);

      expect(mockOnSelect).toHaveBeenCalledWith('budget-range', 'large');
    });

    it('should call onSelect with correct arguments for multiple clicks', () => {
      const mockOnSelect = jest.fn();

      render(
        <QuestionCard
          question={mockQuestion}
          selectedValue={undefined}
          onSelect={mockOnSelect}
        />
      );

      fireEvent.click(screen.getByText('$100K+'));
      expect(mockOnSelect).toHaveBeenCalledWith('budget-range', 'large');

      fireEvent.click(screen.getByText('$25K - $100K'));
      expect(mockOnSelect).toHaveBeenCalledWith('budget-range', 'medium');
    });

    it('should trigger callback on button press with user-event', async () => {
      const mockOnSelect = jest.fn();
      const user = userEvent.setup();

      render(
        <QuestionCard
          question={mockQuestion}
          selectedValue={undefined}
          onSelect={mockOnSelect}
        />
      );

      await user.click(screen.getByText('$10K - $25K'));

      expect(mockOnSelect).toHaveBeenCalledWith('budget-range', 'small');
    });
  });

  describe('Selected Option Highlighting', () => {
    it('should highlight the selected option with blue border and background', () => {
      const { container } = render(
        <QuestionCard
          question={mockQuestion}
          selectedValue="medium"
          onSelect={jest.fn()}
        />
      );

      const buttons = container.querySelectorAll('button');
      const selectedButton = Array.from(buttons).find((btn) =>
        btn.textContent?.includes('$25K - $100K')
      );

      expect(selectedButton).toHaveClass('border-blue-500');
      expect(selectedButton).toHaveClass('bg-blue-50');
      expect(selectedButton).toHaveClass('ring-2');
      expect(selectedButton).toHaveClass('ring-blue-400');
    });

    it('should not highlight unselected options', () => {
      const { container } = render(
        <QuestionCard
          question={mockQuestion}
          selectedValue="large"
          onSelect={jest.fn()}
        />
      );

      const buttons = container.querySelectorAll('button');
      const unselectedButton = Array.from(buttons).find((btn) =>
        btn.textContent?.includes('$10K - $25K')
      );

      expect(unselectedButton).toHaveClass('border-gray-200');
      expect(unselectedButton).not.toHaveClass('border-blue-500');
    });

    it('should show radio button indicator when option is selected', () => {
      const { container } = render(
        <QuestionCard
          question={mockQuestion}
          selectedValue="large"
          onSelect={jest.fn()}
        />
      );

      // Find the selected button's radio button
      const buttons = container.querySelectorAll('button');
      const selectedButton = Array.from(buttons).find((btn) =>
        btn.textContent?.includes('$100K+')
      );

      const radioButtons = selectedButton?.querySelectorAll('div[class*="rounded-full border-2"]');
      const selectedRadio = radioButtons?.[0];

      expect(selectedRadio).toHaveClass('border-blue-500');
      expect(selectedRadio).toHaveClass('bg-blue-500');
    });

    it('should show empty radio button for unselected options', () => {
      const { container } = render(
        <QuestionCard
          question={mockQuestion}
          selectedValue="large"
          onSelect={jest.fn()}
        />
      );

      const buttons = container.querySelectorAll('button');
      const unselectedButton = Array.from(buttons).find((btn) =>
        btn.textContent?.includes('$25K - $100K')
      );

      const radioButtons = unselectedButton?.querySelectorAll('div[class*="rounded-full border-2"]');
      const unselectedRadio = radioButtons?.[0];

      expect(unselectedRadio).toHaveClass('border-gray-300');
      expect(unselectedRadio).not.toHaveClass('bg-blue-500');
    });

    it('should show checkmark SVG only in selected option', () => {
      const { container } = render(
        <QuestionCard
          question={mockQuestion}
          selectedValue="medium"
          onSelect={jest.fn()}
        />
      );

      const svgs = container.querySelectorAll('svg');

      // Should have exactly one SVG (in the selected option)
      expect(svgs.length).toBe(1);
      expect(svgs[0]).toHaveClass('text-white');
    });
  });

  describe('Option Text Display', () => {
    it('should display option label and description', () => {
      render(
        <QuestionCard
          question={mockQuestion}
          selectedValue={undefined}
          onSelect={jest.fn()}
        />
      );

      expect(screen.getByText('$100K+')).toBeInTheDocument();
      expect(screen.getByText('$25K - $100K')).toBeInTheDocument();
      expect(screen.getByText('$10K - $25K')).toBeInTheDocument();
      expect(screen.getByText('Under $10K or unsure')).toBeInTheDocument();
    });

    it('should render all option labels with font-medium styling', () => {
      const { container } = render(
        <QuestionCard
          question={mockQuestion}
          selectedValue={undefined}
          onSelect={jest.fn()}
        />
      );

      const optionTexts = container.querySelectorAll('p[class*="font-medium"]');
      expect(optionTexts.length).toBe(mockQuestion.options.length);

      optionTexts.forEach((text, index) => {
        expect(text.textContent).toBe(mockQuestion.options[index].label);
      });
    });
  });

  describe('Hover States', () => {
    it('should apply hover styles to unselected options', () => {
      const { container } = render(
        <QuestionCard
          question={mockQuestion}
          selectedValue={undefined}
          onSelect={jest.fn()}
        />
      );

      const buttons = container.querySelectorAll('button');
      const unselectedButton = Array.from(buttons).find((btn) =>
        btn.textContent?.includes('$10K - $25K')
      );

      expect(unselectedButton).toHaveClass('hover:border-blue-300');
      expect(unselectedButton).toHaveClass('hover:bg-blue-50');
    });
  });

  describe('Edge Cases', () => {
    it('should handle question with two options (minimum)', () => {
      const minimalQuestion: Question = {
        id: 'test-q',
        text: 'Yes or No?',
        options: [
          { label: 'Yes', value: 'yes', points: 100 },
          { label: 'No', value: 'no', points: 0 },
        ],
      };

      render(
        <QuestionCard
          question={minimalQuestion}
          selectedValue={undefined}
          onSelect={jest.fn()}
        />
      );

      expect(screen.getByText('Yes')).toBeInTheDocument();
      expect(screen.getByText('No')).toBeInTheDocument();
    });

    it('should handle question with many options', () => {
      const manyOptionsQuestion: Question = {
        id: 'complex-q',
        text: 'Pick one:',
        options: Array.from({ length: 8 }, (_, i) => ({
          label: `Option ${i + 1}`,
          value: `opt-${i}`,
          points: i * 10,
        })),
      };

      render(
        <QuestionCard
          question={manyOptionsQuestion}
          selectedValue={undefined}
          onSelect={jest.fn()}
        />
      );

      expect(screen.getAllByRole('button')).toHaveLength(8);
      expect(screen.getByText('Option 8')).toBeInTheDocument();
    });

    it('should handle undefined selectedValue', () => {
      render(
        <QuestionCard
          question={mockQuestion}
          selectedValue={undefined}
          onSelect={jest.fn()}
        />
      );

      // No option should show the checkmark
      const { container } = render(
        <QuestionCard
          question={mockQuestion}
          selectedValue={undefined}
          onSelect={jest.fn()}
        />
      );

      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(0);
    });

    it('should handle questions with long text', () => {
      const longTextQuestion: Question = {
        id: 'long-q',
        text: 'This is a very long question text that spans multiple words and contains detailed information about the decision being made?',
        options: [
          { label: 'Option 1', value: 'opt1', points: 50 },
          { label: 'Option 2', value: 'opt2', points: 50 },
        ],
      };

      render(
        <QuestionCard
          question={longTextQuestion}
          selectedValue={undefined}
          onSelect={jest.fn()}
        />
      );

      expect(
        screen.getByText(
          'This is a very long question text that spans multiple words and contains detailed information about the decision being made?'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have clickable buttons for each option', () => {
      render(
        <QuestionCard
          question={mockQuestion}
          selectedValue={undefined}
          onSelect={jest.fn()}
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeEnabled();
      });
    });

    it('should update selection on button click', () => {
      const mockOnSelect = jest.fn();

      const { rerender } = render(
        <QuestionCard
          question={mockQuestion}
          selectedValue={undefined}
          onSelect={mockOnSelect}
        />
      );

      fireEvent.click(screen.getByText('$100K+'));

      rerender(
        <QuestionCard
          question={mockQuestion}
          selectedValue="large"
          onSelect={mockOnSelect}
        />
      );

      // Verify the selection changed visually
      const { container } = render(
        <QuestionCard
          question={mockQuestion}
          selectedValue="large"
          onSelect={jest.fn()}
        />
      );

      const buttons = container.querySelectorAll('button');
      const selectedButton = Array.from(buttons).find((btn) =>
        btn.textContent?.includes('$100K+')
      );

      expect(selectedButton).toHaveClass('border-blue-500');
    });
  });
});
