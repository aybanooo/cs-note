export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "CS Note",
  description:
    "A note taking app designed for documenting support tickets.",
  mainNav: [
    {
      title: "Notes",
      href: "/",
    }, {
      title: "Templates",
      href: "/templates",
    },
    {
      title: "Setup",
      href: "/setup",
    },
  ],
  links: {
    github: "https://github.com/",
    docs: "https://github.com/",
  },
}
