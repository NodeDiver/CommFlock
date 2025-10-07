"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logger } from "@/lib/logger";

/**
 * Community type returned from API
 */
type Community = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isPublic: boolean;
  _count: {
    members: number;
  };
  owner: {
    username: string;
  };
};

/**
 * Props for the CommunitiesGrid component
 *
 * @property initialCommunities - Initial list of communities to display
 * @property totalCount - Total number of communities available (for pagination)
 * @property showSearch - Whether to display search input (default: true)
 * @property showLoadMore - Whether to display "Load More" button (default: true)
 * @property loadMoreIncrement - Number of communities to load per click (default: 6)
 */
type CommunitiesGridProps = {
  initialCommunities: Community[];
  totalCount: number;
  showSearch?: boolean;
  showLoadMore?: boolean;
  loadMoreIncrement?: number;
};

/**
 * CommunitiesGrid - Displays a grid of communities with search and pagination
 *
 * Features:
 * - Search communities by name or slug
 * - Client-side "Load More" pagination
 * - Responsive grid layout (1 col mobile, 2 tablet, 3 desktop)
 * - Click to navigate to community page
 */
export function CommunitiesGrid({
  initialCommunities,
  totalCount,
  showSearch = true,
  showLoadMore = true,
  loadMoreIncrement = 6,
}: CommunitiesGridProps) {
  const [communities, setCommunities] =
    useState<Community[]>(initialCommunities);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("discover");
  const router = useRouter();
  const locale = useLocale();

  const hasMore = communities.length < totalCount;

  /**
   * Loads more communities using skip/take pagination
   * Appends new communities to the existing list
   */
  const handleLoadMore = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/communities?skip=${communities.length}&take=${loadMoreIncrement}`,
      );
      const data = await response.json();

      // API returns array when using skip/take parameters
      if (Array.isArray(data)) {
        setCommunities([...communities, ...data]);
      } else {
        logger.error("Unexpected response format:", data);
      }
    } catch (error) {
      logger.error("Error loading more communities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Searches communities by name or slug
   * Replaces the current communities list with search results
   *
   * @param query - Search string from input field
   */
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setCommunities(initialCommunities);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/communities?search=${encodeURIComponent(query)}&skip=0&take=20`,
      );
      const data = await response.json();

      // API returns array when using skip/take parameters
      if (Array.isArray(data)) {
        setCommunities(data);
      } else {
        logger.error("Unexpected response format:", data);
      }
    } catch (error) {
      logger.error("Error searching communities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCommunity = (slug: string) => {
    router.push(`/${locale}/${slug}`);
  };

  return (
    <div className="space-y-6">
      {showSearch && (
        <div className="max-w-md mx-auto">
          <Input
            type="search"
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full"
          />
        </div>
      )}

      {communities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {t("noCommunities")}
          </p>
          <Button onClick={() => router.push(`/${locale}/create`)}>
            {t("createFirst")}
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => (
              <Card
                key={community.id}
                data-testid="community-card"
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewCommunity(community.slug)}
              >
                <CardHeader>
                  <CardTitle className="text-xl">{community.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {community.description || "No description"}
                  </p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{community._count.members} members</span>
                    <span>@{community.owner.username}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {showLoadMore && (
            <div className="text-center pt-8">
              {hasMore ? (
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  variant="outline"
                  size="lg"
                >
                  {isLoading ? "Loading..." : t("loadMore")}
                </Button>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  {t("allLoaded")}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
