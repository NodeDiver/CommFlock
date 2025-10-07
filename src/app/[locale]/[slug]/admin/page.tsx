"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  isPublic: boolean;
  joinPolicy: string;
  members: Array<{
    userId: string;
    user: { username: string };
    role: string;
    status: string;
    points: number;
  }>;
}

export default function AdminPage() {
  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();

  const slug = params.slug as string;

  const fetchCommunity = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/communities/${slug}`);
      if (!response.ok) {
        toast.error("Community not found");
        router.push("/discover");
        return;
      }

      // Fetch members data
      const membersResponse = await fetch(`/api/communities/${slug}/members`);
      const communityData = await response.json();

      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setCommunity({ ...communityData, members: membersData });
      } else {
        setCommunity(communityData);
      }
    } catch (error) {
      console.error("Error fetching community:", error);
      toast.error("Failed to load community");
    } finally {
      setIsLoading(false);
    }
  }, [slug, router]);

  useEffect(() => {
    if (!session) {
      router.push("/sign-in");
      return;
    }
    fetchCommunity();
  }, [session, fetchCommunity, router]);

  const handleMemberStatusUpdate = async (
    userId: string,
    status: "APPROVED" | "REJECTED",
  ) => {
    try {
      const response = await fetch(`/api/communities/${slug}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status }),
      });

      if (response.ok) {
        toast.success(`Member ${status.toLowerCase()} successfully`);
        fetchCommunity(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update member status");
      }
    } catch (error) {
      console.error("Error updating member status:", error);
      toast.error("Failed to update member status");
    }
  };

  const handlePointsUpdate = async (userId: string, points: number) => {
    try {
      const response = await fetch(`/api/communities/${slug}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, points }),
      });

      if (response.ok) {
        toast.success("Points updated successfully");
        fetchCommunity(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update points");
      }
    } catch (error) {
      console.error("Error updating points:", error);
      toast.error("Failed to update points");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading admin panel...</div>
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

  // Check if user is admin/owner
  const userMembership = community.members.find(
    (m) => m.userId === session?.user?.id,
  );
  if (!userMembership || !["OWNER", "ADMIN"].includes(userMembership.role)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the admin panel.
          </p>
          <Button onClick={() => router.push(`/${slug}/dashboard`)}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const pendingMembers = community.members.filter(
    (m) => m.status === "PENDING",
  );
  const approvedMembers = community.members.filter(
    (m) => m.status === "APPROVED",
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {community.name} - Admin
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your community settings and members
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => router.push(`/${slug}/dashboard`)}>
                Dashboard
              </Button>
              <Button variant="outline" onClick={() => router.push(`/${slug}`)}>
                Public View
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="requests">
              Join Requests{" "}
              {pendingMembers.length > 0 && `(${pendingMembers.length})`}
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Community Members</CardTitle>
                <CardDescription>
                  Manage member roles, points, and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedMembers.map((member) => (
                      <TableRow key={member.userId}>
                        <TableCell className="font-medium">
                          {member.user.username}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              member.role === "OWNER" ? "default" : "secondary"
                            }
                          >
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <input
                            type="number"
                            defaultValue={member.points}
                            className="w-20 px-2 py-1 border rounded"
                            onBlur={(e) => {
                              const newPoints = parseInt(e.target.value);
                              if (newPoints !== member.points) {
                                handlePointsUpdate(member.userId, newPoints);
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">{member.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {member.role !== "OWNER" && (
                            <Button size="sm" variant="outline">
                              Edit Role
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Join Requests</CardTitle>
                <CardDescription>
                  Approve or reject membership requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingMembers.length === 0 ? (
                  <p className="text-gray-500">No pending join requests.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingMembers.map((member) => (
                        <TableRow key={member.userId}>
                          <TableCell className="font-medium">
                            {member.user.username}
                          </TableCell>
                          <TableCell>Pending</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleMemberStatusUpdate(
                                    member.userId,
                                    "APPROVED",
                                  )
                                }
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleMemberStatusUpdate(
                                    member.userId,
                                    "REJECTED",
                                  )
                                }
                              >
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Community Settings</CardTitle>
                <CardDescription>
                  Update community information and policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Community Name
                    </label>
                    <input
                      type="text"
                      defaultValue={community.name}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      defaultValue={community.description || ""}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked={community.isPublic}
                        className="mr-2"
                      />
                      Public Community
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Join Policy
                    </label>
                    <select
                      defaultValue={community.joinPolicy}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="AUTO_JOIN">Auto Join</option>
                      <option value="APPROVAL_REQUIRED">
                        Approval Required
                      </option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>
                  Create announcements, events, and polls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => router.push(`/${slug}/admin/announcements`)}
                  >
                    Manage Announcements
                  </Button>
                  <Button onClick={() => router.push(`/${slug}/admin/events`)}>
                    Manage Events
                  </Button>
                  <Button onClick={() => router.push(`/${slug}/admin/polls`)}>
                    Manage Polls
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
