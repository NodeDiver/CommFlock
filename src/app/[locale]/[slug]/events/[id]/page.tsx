"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  priceSats: number;
  minQuorum: number;
  status: string;
  createdAt: string;
  community: {
    slug: string;
    name: string;
  };
  createdBy: {
    username: string;
  };
  registrations: Array<{
    id: string;
    status: string;
    createdAt: string;
    user: {
      username: string;
    };
  }>;
}

export default function EventPage() {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();

  const slug = params.slug as string;
  const eventId = params.id as string;

  const fetchEvent = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/communities/${slug}/events/${eventId}`,
      );
      if (!response.ok) {
        toast.error("Event not found");
        router.push(`/${slug}/dashboard`);
        return;
      }
      setEvent(await response.json());
    } catch (error) {
      console.error("Error fetching event:", error);
      toast.error("Failed to load event");
    } finally {
      setIsLoading(false);
    }
  }, [slug, eventId, router]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleRegister = async () => {
    if (!session) {
      toast.error("Please sign in to register for this event");
      return;
    }

    setIsRegistering(true);
    try {
      const response = await fetch(
        `/api/communities/${slug}/events/${eventId}/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Successfully registered for the event!");
        fetchEvent(); // Refresh event data
      } else {
        toast.error(data.error || "Failed to register for event");
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      toast.error("Failed to register for event");
    } finally {
      setIsRegistering(false);
    }
  };

  const isRegistered = event?.registrations.some(
    (r) => r.user.username === session?.user?.username,
  );
  const isFull = event && event.registrations.length >= event.capacity;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading event...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Event Not Found
          </h1>
          <Button onClick={() => router.push(`/${slug}/dashboard`)}>
            Back to Dashboard
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
                {event.title}
              </h1>
              <p className="text-gray-600 mt-1">in {event.community.name}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant={event.status === "OPEN" ? "default" : "secondary"}
              >
                {event.status}
              </Badge>
              <Button onClick={() => router.push(`/${slug}/dashboard`)}>
                Back to Dashboard
              </Button>
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
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {t("events.startsAt")}
                      </h4>
                      <p className="text-gray-600">
                        {new Date(event.startsAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {t("events.endsAt")}
                      </h4>
                      <p className="text-gray-600">
                        {new Date(event.endsAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {t("events.capacity")}
                      </h4>
                      <p className="text-gray-600">
                        {event.registrations.length}/{event.capacity}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {t("events.priceSats")}
                      </h4>
                      <p className="text-gray-600">{event.priceSats} sats</p>
                    </div>
                  </div>
                  {event.minQuorum > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {t("events.minQuorum")}
                      </h4>
                      <p className="text-gray-600">
                        {event.minQuorum} attendees
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    Attendees ({event.registrations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {event.registrations.length === 0 ? (
                    <p className="text-gray-500">No attendees yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {event.registrations.map((registration) => (
                        <div
                          key={registration.id}
                          className="flex items-center space-x-3"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {registration.user.username
                                .charAt(0)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {registration.user.username}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(
                                registration.createdAt,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Registration</CardTitle>
                  <CardDescription>
                    {isRegistered
                      ? "You are registered for this event."
                      : isFull
                        ? "This event is full."
                        : "Register to attend this event."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isRegistered ? (
                    <Button className="w-full" disabled>
                      ✓ Registered
                    </Button>
                  ) : isFull ? (
                    <Button className="w-full" disabled>
                      Event Full
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={handleRegister}
                      disabled={isRegistering || event.status !== "OPEN"}
                    >
                      {isRegistering
                        ? "Registering..."
                        : `Register (${event.priceSats} sats)`}
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Event Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Created by:</span>
                    <span className="font-medium">
                      {event.createdBy.username}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Created:</span>
                    <span>
                      {new Date(event.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge
                      variant={
                        event.status === "OPEN" ? "default" : "secondary"
                      }
                    >
                      {event.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
