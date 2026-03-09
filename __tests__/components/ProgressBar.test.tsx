/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProgressBar } from "@/components/ProgressBar";

describe("ProgressBar Component", () => {
  const mockLabels = ["Budget", "Authority", "Need", "Timeline"];

  describe("Rendering", () => {
    it("should render all step labels", () => {
      render(
        <ProgressBar currentStep={0} totalSteps={4} stepLabels={mockLabels} />,
      );

      mockLabels.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it("should render correct step count", () => {
      render(
        <ProgressBar currentStep={0} totalSteps={4} stepLabels={mockLabels} />,
      );

      expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
    });

    it("should render all step numbers", () => {
      render(
        <ProgressBar currentStep={2} totalSteps={4} stepLabels={mockLabels} />,
      );

      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
    });
  });

  describe("Current Step Highlighting", () => {
    it("should highlight the current step indicator", () => {
      const { container } = render(
        <ProgressBar currentStep={1} totalSteps={4} stepLabels={mockLabels} />,
      );

      const stepIndicators = container.querySelectorAll(
        'div.rounded-full[class*="flex items-center justify-center"]',
      );

      // Step 0 and 1 should be highlighted (currentStep + 1)
      expect(stepIndicators[0]).toHaveClass("bg-blue-600");
      expect(stepIndicators[1]).toHaveClass("bg-blue-600");
      // Step 2 and 3 should not be highlighted
      expect(stepIndicators[2]).toHaveClass("bg-gray-200");
      expect(stepIndicators[3]).toHaveClass("bg-gray-200");
    });

    it("should highlight the current step label", () => {
      const { container } = render(
        <ProgressBar currentStep={2} totalSteps={4} stepLabels={mockLabels} />,
      );

      const labels = container.querySelectorAll('p[class*="text-xs mt-2"]');

      // Only the current step (index 2) should have font-semibold
      expect(labels[0]).not.toHaveClass("font-semibold");
      expect(labels[1]).not.toHaveClass("font-semibold");
      expect(labels[2]).toHaveClass("font-semibold");
      expect(labels[3]).not.toHaveClass("font-semibold");
    });

    it("should show correct step counter at different steps", () => {
      const { rerender } = render(
        <ProgressBar currentStep={0} totalSteps={4} stepLabels={mockLabels} />,
      );

      expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();

      rerender(
        <ProgressBar currentStep={2} totalSteps={4} stepLabels={mockLabels} />,
      );

      expect(screen.getByText("Step 3 of 4")).toBeInTheDocument();

      rerender(
        <ProgressBar currentStep={3} totalSteps={4} stepLabels={mockLabels} />,
      );

      expect(screen.getByText("Step 4 of 4")).toBeInTheDocument();
    });
  });

  describe("Dimension Names Display", () => {
    it("should display all dimension names from labels", () => {
      const dimensionLabels = [
        "Budget Fit",
        "Decision Authority",
        "Business Need",
        "Timeline",
      ];

      render(
        <ProgressBar
          currentStep={0}
          totalSteps={4}
          stepLabels={dimensionLabels}
        />,
      );

      dimensionLabels.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });

  describe("Progress Bar Visual State", () => {
    it("should update progress bar width based on current step", () => {
      const { container, rerender } = render(
        <ProgressBar currentStep={0} totalSteps={4} stepLabels={mockLabels} />,
      );

      let progressBar = container.querySelector('div[style*="width"]');
      // Step 0: (0+1)/4 * 100 = 25%
      expect(progressBar).toHaveStyle("width: 25%");

      rerender(
        <ProgressBar currentStep={1} totalSteps={4} stepLabels={mockLabels} />,
      );

      progressBar = container.querySelector('div[style*="width"]');
      // Step 1: (1+1)/4 * 100 = 50%
      expect(progressBar).toHaveStyle("width: 50%");

      rerender(
        <ProgressBar currentStep={3} totalSteps={4} stepLabels={mockLabels} />,
      );

      progressBar = container.querySelector('div[style*="width"]');
      // Step 3: (3+1)/4 * 100 = 100%
      expect(progressBar).toHaveStyle("width: 100%");
    });
  });

  describe("Edge Cases", () => {
    it("should handle single step", () => {
      render(
        <ProgressBar
          currentStep={0}
          totalSteps={1}
          stepLabels={["Complete"]}
        />,
      );

      expect(screen.getByText("Step 1 of 1")).toBeInTheDocument();
      expect(screen.getByText("Complete")).toBeInTheDocument();
    });

    it("should handle many steps", () => {
      const manyLabels = Array.from({ length: 10 }, (_, i) => `Step ${i + 1}`);

      render(
        <ProgressBar currentStep={5} totalSteps={10} stepLabels={manyLabels} />,
      );

      expect(screen.getByText("Step 6 of 10")).toBeInTheDocument();
      manyLabels.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });
});
