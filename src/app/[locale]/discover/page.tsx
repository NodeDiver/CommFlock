import { getTranslations } from "next-intl/server";
import { CommunitiesGrid } from "@/components/communities-grid";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

async function getInitialCommunities() {
  try {
    const [communities, total] = await Promise.all([
      db.community.findMany({
        where: { isPublic: true },
        include: {
          _count: {
            select: { members: true },
          },
          owner: {
            select: { username: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      db.community.count({ where: { isPublic: true } }),
    ]);

    return { communities, total };
  } catch (error) {
    logger.error("Error fetching communities:", error);
    return { communities: [], total: 0 };
  }
}

export default async function DiscoverPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { communities, total } = await getInitialCommunities();
  const t = await getTranslations({ locale });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t("discover.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t("discover.subtitle")}
          </p>
        </div>

        <CommunitiesGrid
          initialCommunities={communities}
          totalCount={total}
          showSearch={true}
          showLoadMore={true}
          loadMoreIncrement={10}
        />
      </div>
    </div>
  );
}
