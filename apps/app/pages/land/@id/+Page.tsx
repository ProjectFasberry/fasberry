import { Land } from "@/shared/components/app/land/components/land"
import { landAtom } from "@/shared/components/app/land/models/land.model"
import { Data } from "./+data"
import { useUpdate } from "@reatom/npm-react";
import { useData } from "vike-react/useData";

export default function Page() {
  const { data } = useData<Data>();

  useUpdate((ctx) => landAtom(ctx, data), [data]);

  return <Land />
}