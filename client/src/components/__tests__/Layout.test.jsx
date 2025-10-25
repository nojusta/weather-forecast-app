import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Layout from "../Layout";

describe("Layout Component", () => {
  it("renders child content inside the main element", () => {
    render(
      <Layout>
        <div data-testid="custom-child">Custom Content</div>
      </Layout>
    );

    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(screen.getByTestId("custom-child")).toBeInTheDocument();
  });

  it("shows attribution footer", () => {
    render(<Layout>Test Content</Layout>);

    const footer = screen.getByText(
      /Data provided by LHMT \(Lietuvos hidrometeorologijos tarnyba\)/i
    );
    expect(footer).toBeInTheDocument();
    expect(footer.closest("footer")).toBeInTheDocument();
  });

  it("applies background gradient wrapper", () => {
    const { container } = render(<Layout>Test Content</Layout>);
    expect(container.firstChild).toHaveClass(
      "min-h-screen",
      "bg-gradient-to-b"
    );
  });
});
