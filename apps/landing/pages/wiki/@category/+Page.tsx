import { WikiContentItem } from "@/shared/components/landing/wiki/components/wiki-content";
import { useUpdate } from "@reatom/npm-react";
import { useData } from "vike-react/useData";
import { Data } from "./+data";
import { wikiParamAtom } from "@/shared/components/landing/wiki/models/wiki.model";

export default function Page() {
  const { param } = useData<Data>();

  useUpdate((ctx) => wikiParamAtom(ctx, param), [param])

  return (
    <div className="flex flex-col xl:w-[75%] w-full overflow-hidden lg:w-auto">
      <WikiContentItem />
    </div>
  )
}