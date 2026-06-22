import { HomeController } from "@/components/features/home/HomeController";
import { getHomePageDataCached } from "@/lib/cache/server-page-cache";

export const revalidate = 60;

export default async function Home() {
  const initialData = await getHomePageDataCached();
  return <HomeController initialData={initialData} />;
}
