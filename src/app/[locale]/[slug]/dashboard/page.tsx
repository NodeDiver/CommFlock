"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  members: Array<{
    user: { username: string };
    role: string;
    points: number;
    joinedAt: string;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    body: string;
    createdAt: string;
    createdBy: { username: string };
  }>;
  events: Array<{
    id: string;
    title: string;
    startsAt: string;
    capacity: number;
    _count: { registrations: number };
  }>;
  polls: Array<{
    id: string;
    question: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();

  const slug = params.slug as string;

  useEffect(() => {
    if (!session) {
      router.push("/sign-in");
      return;
    }
    fetchCommunity();
  }, [session, slug]);

  const fetchCommunity = async () => {
    try {
      const response = await fetch(`/api/communities/${slug}`);
      if (!response.ok) {
        toast.error("Community not found");
        router.push("/discover");
        return;
      }
      setCommunity(await response.json());
    } catch (error) {
      console.error("Error fetching community:", error);
      toast.error("Failed to load community");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading dashboard...</div>
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
                {community.description || "No description provided"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => router.push(`/${slug}/admin`)}>
                {t("nav.admin")}
              </Button>
              <Button variant="outline" onClick={() => router.push(`/${slug}`)}>
                Public View
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="announcements" className="space-y-6">
          <TabsList>
            <TabsTrigger value="announcements">
              {t("community.announcements")}
            </TabsTrigger>
            <TabsTrigger value="events">{t("community.events")}</TabsTrigger>
            <TabsTrigger value="polls">{t("community.polls")}</TabsTrigger>
            <TabsTrigger value="leaderboard">
              {t("community.leaderboard")}
            </TabsTrigger>
            <TabsTrigger value="badges">{t("community.badges")}</TabsTrigger>
          </TabsList>

          <TabsContent value="announcements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("community.announcements")}</CardTitle>
              </CardHeader>
              <CardContent>
                {community.announcements.length === 0 ? (
                  <p className="text-gray-500">No announcements yet.</p>
                ) : (
                  <div className="space-y-4">
                    {community.announcements.map((announcement) => (
                      <div
                        key={announcement.id}
                        className="border rounded-lg p-4"
                      >
                        <h3 className="font-semibold">{announcement.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {announcement.body}
                        </p>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>by {announcement.createdBy.username}</span>
                          <span>
                            {new Date(
                              announcement.createdAt,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("community.events")}</CardTitle>
              </CardHeader>
              <CardContent>
                {community.events.length === 0 ? (
                  <p className="text-gray-500">No events scheduled.</p>
                ) : (
                  <div className="space-y-4">
                    {community.events.map((event) => (
                      <div key={event.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(event.startsAt).toLocaleString()}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-500">
                            {event._count.registrations}/{event.capacity}{" "}
                            attending
                          </span>
                          <Button
                            size="sm"
                            onClick={() =>
                              router.push(`/${slug}/events/${event.id}`)
                            }
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="polls" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("community.polls")}</CardTitle>
              </CardHeader>
              <CardContent>
                {community.polls.length === 0 ? (
                  <p className="text-gray-500">No polls available.</p>
                ) : (
                  <div className="space-y-4">
                    {community.polls.map((poll) => (
                      <div key={poll.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold">{poll.question}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-500">
                            {new Date(poll.createdAt).toLocaleDateString()}
                          </span>
                          <Button
                            size="sm"
                            onClick={() =>
                              router.push(`/${slug}/polls/${poll.id}`)
                            }
                          >
                            {t("actions.vote")}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("community.leaderboard")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {community.members
                      .sort((a, b) => b.points - a.points)
                      .map((member, index) => (
                        <TableRow key={member.user.username}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {member.user.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {member.user.username}
                              </span>
                              {index === 0 && (
                                <Badge variant="default">👑</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                member.role === "OWNER"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {member.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{member.points}</TableCell>
                          <TableCell>
                            {new Date(member.joinedAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("community.badges")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Badge system coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
