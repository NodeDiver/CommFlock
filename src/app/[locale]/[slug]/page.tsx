"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isPublic: boolean;
  joinPolicy: string;
  requiresLightningAddress: boolean;
  requiresNostrPubkey: boolean;
  createdAt: string;
  owner: {
    username: string;
  };
  _count: {
    members: number;
  };
}

export default function CommunityPage() {
  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();

  const slug = params.slug as string;

  const fetchCommunity = useCallback(async () => {
    try {
      const response = await fetch(`/api/communities/${slug}`);
      const data = await response.json();

      if (response.ok) {
        setCommunity(data);
      } else {
        toast.error(data.error || "Community not found");
        router.push("/discover");
      }
    } catch (error) {
      logger.error("Error fetching community:", error);
      toast.error("Failed to load community");
    } finally {
      setIsLoading(false);
    }
  }, [slug, router]);

  useEffect(() => {
    fetchCommunity();
  }, [fetchCommunity]);

  const handleJoin = async () => {
    if (!session) {
      toast.error("Please sign in to join this community");
      return;
    }

    setIsJoining(true);
    try {
      const response = await fetch(`/api/communities/${slug}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Successfully joined community!");
        router.push(`/${slug}/dashboard`);
      } else {
        toast.error(data.error || "Failed to join community");
      }
    } catch (error) {
      logger.error("Error joining community:", error);
      toast.error("Failed to join community");
    } finally {
      setIsJoining(false);
    }
  };

  const joinPolicyLabels = {
    AUTO_JOIN: t("community.join.auto"),
    APPROVAL_REQUIRED: t("community.join.approval"),
    CLOSED: t("community.join.closed"),
  };

  const getJoinButtonText = () => {
    if (!session) return t("nav.signIn");

    switch (community?.joinPolicy) {
      case "AUTO_JOIN":
        return t("actions.join");
      case "APPROVAL_REQUIRED":
        return t("actions.requestJoin");
      case "CLOSED":
        return "Closed";
      default:
        return t("actions.join");
    }
  };

  const canJoin = () => {
    if (!session) return true;
    return community?.joinPolicy !== "CLOSED";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading community...</div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Community Not Found
          </h1>
          <Button onClick={() => router.push("/discover")}>
            Back to Discover
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {community.name}
              </h1>
              <p className="text-gray-600 mt-1">
                by {community.owner.username} • {community._count.members}{" "}
                members
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={community.isPublic ? "default" : "secondary"}>
                {community.isPublic
                  ? t("community.public")
                  : t("community.private")}
              </Badge>
              <Badge variant="outline">
                {
                  joinPolicyLabels[
                    community.joinPolicy as keyof typeof joinPolicyLabels
                  ]
                }
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("community.description")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    {community.description || "No description provided."}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Community Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Created:</span>
                    <span>
                      {new Date(community.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Members:</span>
                    <span>{community._count.members}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Join Policy:</span>
                    <span>
                      {
                        joinPolicyLabels[
                          community.joinPolicy as keyof typeof joinPolicyLabels
                        ]
                      }
                    </span>
                  </div>
                  {community.requiresLightningAddress && (
                    <div className="flex justify-between">
                      <span className="font-medium">Requirements:</span>
                      <span>Lightning Address Required</span>
                    </div>
                  )}
                  {community.requiresNostrPubkey && (
                    <div className="flex justify-between">
                      <span className="font-medium">Requirements:</span>
                      <span>Nostr Pubkey Required</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Join Community</CardTitle>
                  <CardDescription>
                    {community.joinPolicy === "CLOSED"
                      ? "This community is closed to new members."
                      : "Join this community to participate in discussions and events."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={handleJoin}
                    disabled={isJoining || !canJoin()}
                  >
                    {isJoining ? "Joining..." : getJoinButtonText()}
                  </Button>
                </CardContent>
              </Card>

              {session && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/${slug}/dashboard`)}
                    >
                      View Dashboard
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
