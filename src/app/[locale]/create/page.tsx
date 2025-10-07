"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { generateSlug } from "@/lib/slug";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export default function CreateCommunityPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [joinPolicy, setJoinPolicy] = useState("AUTO_JOIN");
  const [requiresLightningAddress, setRequiresLightningAddress] =
    useState(false);
  const [requiresNostrPubkey, setRequiresNostrPubkey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations();

  // Auto-generate slug from name in real-time
  const handleNameChange = (value: string) => {
    setName(value);
    // Only auto-update slug if user hasn't manually edited it
    if (!isSlugManuallyEdited) {
      setSlug(generateSlug(value));
    }
  };

  // Handle manual slug changes
  const handleSlugChange = (value: string) => {
    setSlug(value);
    // Mark as manually edited to stop auto-updates
    setIsSlugManuallyEdited(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error("Please sign in to create a community");
      return;
    }

    setIsLoading(true);
    setIsProcessingPayment(true);

    try {
      // Simulate payment first
      const paymentResponse = await fetch("/api/payments/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountSats: 21, type: "community" }),
      });

      if (!paymentResponse.ok) {
        throw new Error("Payment simulation failed");
      }

      // Create community
      const communityResponse = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          isPublic,
          joinPolicy,
          requiresLightningAddress,
          requiresNostrPubkey,
        }),
      });

      if (!communityResponse.ok) {
        const error = await communityResponse.json();
        throw new Error(error.error || "Failed to create community");
      }

      const community = await communityResponse.json();
      toast.success(t("success.communityCreated"));
      router.push(`/${community.slug}`);
    } catch (error) {
      logger.error("Error creating community:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create community",
      );
    } finally {
      setIsLoading(false);
      setIsProcessingPayment(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to create a community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/sign-in")} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create New Community</CardTitle>
              <CardDescription>
                Build a community and start connecting with others. Creating a
                community costs 21 sats.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">{t("forms.communityName")}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    placeholder="Enter community name"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">{t("forms.slug")}</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    required
                    placeholder="community-slug"
                  />
                  <div className="mt-1 space-y-1">
                    <p className="text-sm text-gray-500">
                      This will be your community URL: commflock.com/{slug}
                    </p>
                    {!isSlugManuallyEdited && name && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        ✨ Auto-generated from community name
                      </p>
                    )}
                    {isSlugManuallyEdited && (
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        ✏️ Manually edited - will not auto-update
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">
                    {t("forms.communityDescription")}
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your community..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="joinPolicy">{t("forms.joinPolicy")}</Label>
                  <Select value={joinPolicy} onValueChange={setJoinPolicy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AUTO_JOIN">Auto Join</SelectItem>
                      <SelectItem value="APPROVAL_REQUIRED">
                        Approval Required
                      </SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPublic"
                      checked={isPublic}
                      onCheckedChange={(checked) =>
                        setIsPublic(checked as boolean)
                      }
                    />
                    <Label htmlFor="isPublic">{t("forms.isPublic")}</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiresLightningAddress"
                      checked={requiresLightningAddress}
                      onCheckedChange={(checked) =>
                        setRequiresLightningAddress(checked as boolean)
                      }
                    />
                    <Label htmlFor="requiresLightningAddress">
                      {t("forms.requiresLightningAddress")}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiresNostrPubkey"
                      checked={requiresNostrPubkey}
                      onCheckedChange={(checked) =>
                        setRequiresNostrPubkey(checked as boolean)
                      }
                    />
                    <Label htmlFor="requiresNostrPubkey">
                      {t("forms.requiresNostrPubkey")}
                    </Label>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isProcessingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    `${t("actions.create")} & ${t("actions.pay21sats")}`
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
