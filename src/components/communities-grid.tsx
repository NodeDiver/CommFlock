"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

type CommunitiesGridProps = {
  initialCommunities: Community[];
  totalCount: number;
  showSearch?: boolean;
  showLoadMore?: boolean;
  loadMoreIncrement?: number;
};

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

  const handleLoadMore = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/communities?skip=${communities.length}&take=${loadMoreIncrement}`,
      );
      const newCommunities = await response.json();
      setCommunities([...communities, ...newCommunities]);
    } catch (error) {
      console.error("Error loading more communities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setCommunities(initialCommunities);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/communities?search=${encodeURIComponent(query)}`,
      );
      const searchResults = await response.json();
      setCommunities(searchResults);
    } catch (error) {
      console.error("Error searching communities:", error);
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
