import { clientOnly } from "vike-react/clientOnly";
import "./style.css";
import "./tailwind.css";
import { Header } from "./header";

export default function LayoutDefault({ children }: { children: React.ReactNode }) {
  return (
    <Content>{children}</Content>
  );
}

const ReatomProvider = clientOnly(() => import("./reatom-provider").then(m => m.ReatomProvider))

function Content({ children }: { children: React.ReactNode }) {
  return (
    <div id="page-container" className="bg-neutral-900">
      <div id="page-content" className="min-h-screen">
        <Header />
        <div className='flex flex-col items-center justify-center h-full pt-32 w-[calc(100%-16px)] sm:w-[calc(100%-32px)] xl:w-[60%] mx-auto'>
          <ReatomProvider>
            {children}
          </ReatomProvider>
        </div>
      </div>
    </div>
  );
}