export default function sitemap() {
  const baseUrl = "https://schedule.alexi.life";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
