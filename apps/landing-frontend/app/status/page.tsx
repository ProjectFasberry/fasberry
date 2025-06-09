import { MainLayoutPage } from "#components/layout/default/main-layout";
import { PageServerStatus } from '#components/status/page-server-status';

export const metadata = {
  title: 'Статус',
};

export default async function StatusPage() {
  return (
    <MainLayoutPage variant="with_section">
      <div className="full-screen-section min-h-screen flex items-center justify-center">
        <div className="flex h-full lg:max-h-[500px] flex-col lg:flex-row justify-start overflow-hidden items-start gap-6 responsive">
          <iframe
            src="https://discord.com/widget?id=958086036393689098&theme=dark"
            width="350"
            height="500"
            // @ts-ignore
            allowtransparency={true.toString()}
            className="!rounded-[12px] w-full lg:w-1/4"
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          />
          <div
            className="flex flex-col max-h-[496px] overflow-y-scroll gap-6 rounded-xl py-4 border-2 
            border-neutral-600 bg-background-light dark:bg-background-dark w-full lg:w-3/4 h-full"
          >
            <PageServerStatus />
          </div>
        </div>
      </div>
    </MainLayoutPage>
  );
}