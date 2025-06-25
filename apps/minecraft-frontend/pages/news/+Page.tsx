import { MainWrapperPage } from "@/shared/ui/main-wrapper";
import { NewsPageSearch } from "@/shared/components/landing/news/news-page-search";
import { useUpdate } from "@reatom/npm-react";
import { clientOnly } from "vike-react/clientOnly";
import { newsAction } from "@/shared/components/landing/news/news.model";
import { NewsPageList } from "@/shared/components/landing/news/news-page-list";

const NewsPageListInView = clientOnly(() => import("@/shared/components/landing/news/news-page-list-scroller").then(m => m.NewsPageListInView))

const Update = () => {
  useUpdate((ctx) => newsAction(ctx, {}), [])
  return null;
}

export default function NewsPage() {
  return (
    <MainWrapperPage variant="with_section">
      <div className="full-screen-section h-[80vh] lg:min-h-screen flex flex-col gap-10 items-center justify-start">
        <div className="flex flex-col responsive items-center h-full justify-center gap-10 relative top-32 pb-48">
          <p className="text-4xl font-semibold text-white">
            Новости
          </p>
          <NewsPageSearch />
          <div
            id="list"
            className="grid gris-cols-1 
        			sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 auto-rows-auto gap-4 w-full h-full"
          >
            <Update />
            <NewsPageList />
          </div>
          <NewsPageListInView />
        </div>
      </div>
    </MainWrapperPage>
  )
}