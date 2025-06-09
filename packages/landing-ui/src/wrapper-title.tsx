import { ReactNode } from "react";

export const WrapperTitle = ({
  children 
}: { children: ReactNode }) => {
  return (
    <div className="responsive flex bg-cover bg-no-repeat relative mx-auto">
      {children}
    </div>
  );
}