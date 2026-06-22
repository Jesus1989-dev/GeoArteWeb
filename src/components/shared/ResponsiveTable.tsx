import type { ReactNode } from "react";

type ResponsiveTableProps = {
  mobile: ReactNode;
  children: ReactNode;
};

/** Tabla en desktop (md+); vista alternativa en móvil. */
export function ResponsiveTable({ mobile, children }: ResponsiveTableProps) {
  return (
    <>
      <div className="md:hidden">{mobile}</div>
      <div className="hidden overflow-x-auto md:block">{children}</div>
    </>
  );
}
