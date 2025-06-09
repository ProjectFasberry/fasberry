import "./style.css";
import "./tailwind.css";

export default function LayoutDefault({ children }: { children: React.ReactNode }) {
  return (
    <Content>{children}</Content>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  return (
    <div id="page-container">
      <div id="page-content" className={"p-5 pb-12 min-h-screen"}>
        {children}
      </div>
    </div>
  );
}