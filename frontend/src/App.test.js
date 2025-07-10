import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders dashboard text", () => {
  render(<App />);
  const dashboardText = screen.getByText(/welcome back/i);
  expect(dashboardText).toBeInTheDocument();
});
