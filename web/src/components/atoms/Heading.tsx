import type { ReactNode } from "react";

export function Heading({ children }: { children: ReactNode }) {
  return <h1 style={{ margin: "0 0 16px" }}>{children}</h1>;
}
