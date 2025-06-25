import { navigate } from "vike/client/router";
import { WikiNavigationBar } from "../sidebar/wiki-navigation-bar";
import { MDXProvider } from '@mdx-js/react'
import General from "./general.mdx"
import Armor from "./armor.mdx"
import Economic from "./economic.mdx"
import Boosts from "./boosts.mdx"
import Jobs from "./jobs.mdx"
import Mobs from "./mobs.mdx"
import Referals from "./ref.mdx"
import Reports from "./reports.mdx"
import Security from "./security.mdx"
import Safety from "./safety.mdx"
import Skills from "./skills.mdx"
import Quests from "./quests.mdx"
import Metro from "./metro.mdx"
import Reputation from "./reputation.mdx"
import Pets from "./pets.mdx"
import Lands from "./lands.mdx"
import Profile from "./profile.mdx"
import Skin from "./skin.mdx"
import { reatomComponent } from "@reatom/npm-react";
import { atom } from "@reatom/core";
import { pageSearchParams } from "@/shared/layouts/LayoutDefault";
import { Tabs, TabsContent, TabsContents } from "@/shared/ui/tabs";
import { clientOnly } from "vike-react/clientOnly";

const WikiNavigationMobile = clientOnly(() => import("../sidebar/wiki-navigation-mobile").then(m => m.WikiNavigationMobile))

export const wikiParamAtom = atom("general", "param")

pageSearchParams.onChange((ctx, target) => {
	const tab = target["tab"]

	if (tab) {
		wikiParamAtom(ctx, tab)
	}
})

wikiParamAtom.onChange((ctx, target) => {
	if (!target) return;
	navigate(`/wiki?tab=${target}`)
})

const CONTENT = [
	{
		val: "general",
		component: <General />
	},
	{
		val: "profile",
		component: <Profile />
	},
	{
		val: "economic",
		component: <Economic />
	},
	{
		val: "jobs",
		component: <Jobs />
	},
	{
		val: "reputation",
		component: <Reputation />
	},
	{
		val: "pets",
		component: <Pets />
	},
	{
		val: "metro",
		component: <Metro />
	},
	{
		val: "mobs",
		component: <Mobs />
	},
	{
		val: "safety",
		component: <Safety />
	},
	{
		val: "armor",
		component: <Armor />
	},
	{
		val: "boosts",
		component: <Boosts />
	},
	{
		val: "reports",
		component: <Reports />
	},
	{
		val: "quests",
		component: <Quests />
	},
	{
		val: "skills",
		component: <Skills />
	},
	{
		val: "regions",
		component: <Lands />
	},
	{
		val: "skin",
		component: <Skin />
	},
	{
		val: "referals",
		component: <Referals />
	},
	{
		val: "security",
		component: <Security />
	},
]

const components = {
	em(properties) {
		return <i {...properties} />
	}
}

const Content = () => {
	return (
		<div className="flex flex-col p-4 xl:w-[75%] w-full overflow-hidden lg:w-auto">
			<MDXProvider components={components}>
				<TabsContents>
					{CONTENT.map(con => (
						<TabsContent key={con.val} value={con.val}>
							{con.component}
						</TabsContent>
					))}
				</TabsContents>
			</MDXProvider>
		</div>
	)
}

export const WikiContent = reatomComponent(({ ctx }) => {
	return (
		<>
			<Tabs
				defaultValue="general"
				value={ctx.spy(wikiParamAtom)}
				onValueChange={v => wikiParamAtom(ctx, v)}
				className="flex flex-col lg:flex-row items-start justify-between bg-transparent w-full gap-x-4"
			>
				<WikiNavigationBar />
				<Content />
				<WikiNavigationMobile/>
			</Tabs>
		</>
	)
}, "WikiContent")