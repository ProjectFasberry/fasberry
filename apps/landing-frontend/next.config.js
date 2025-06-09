/** @type {import('next').NextConfig} */
module.exports = {
	reactStrictMode: false,
	transpilePackages: ['@repo/landing-ui'],
	experimental: {
		optimizePackageImports: ['@repo/landing-ui']
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "mc-heads.net",
				port: "",
				pathname: "/**"
			},
			{
				protocol: "http",
				hostname: "127.0.0.1",
				port: "8000",
				pathname: "/storage/**"
			},
			{
				protocol: "https",
				hostname: "cdn.discordapp.com",
				port: "",
				pathname: "/**"
			},
			{
				protocol: "https",
				hostname: "media.discordapp.net",
				port: "",
				pathname: "/**"
			},
			{
				protocol: 'https',
				hostname: 'kong.fasberry.su/**',
				port: '',
				pathname: '/storage/**',
			}
		]
	},
};