import { MINECRAFT_SITE_DOMAIN } from "@repo/shared/constants/origin-list";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: MINECRAFT_SITE_DOMAIN,
			lastModified: new Date(),
			changeFrequency: 'always',
			priority: 1,
		},
		{
			url: `${MINECRAFT_SITE_DOMAIN}/start`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.8,
		},
		{
			url: `${MINECRAFT_SITE_DOMAIN}/shop`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.5,
		},
		{
			url: `${MINECRAFT_SITE_DOMAIN}/rules`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.3,
		},
	]
}