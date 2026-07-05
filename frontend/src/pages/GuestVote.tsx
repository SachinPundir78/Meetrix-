import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import AvailabilityGrid, {
  type AvailabilitySlot,
} from "@/components/AvailabilityGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getMeeting, submitVote, type MeetingForGuest } from "@/lib/api";
import { AppNavbar } from "@/components/AppNavbar";
import { useAuthStore } from "@/store/useAuthStore";
import { SignInButton } from "@clerk/clerk-react";

const START_HOUR = 0;
const SLOT_MINUTES = 30;

/** Build a Set<"dayIdx-slotIdx"> from ISO availability records + proposedDates */
function availabilitiesToCellKeys(
  avails: { startTime: string; endTime: string }[],
  proposedDates: string[]
): Set<string> {
  const keys = new Set<string>();
  for (const a of avails) {
    const start = new Date(a.startTime);
    const end = new Date(a.endTime);
    // Find which day column this belongs to
    const dateStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
    const dayIdx = proposedDates.indexOf(dateStr);
    if (dayIdx === -1) continue;
    // Walk through the 30-min slots covered by this availability
    let cursor = new Date(start);
    while (cursor < end) {
      const minutesSinceMidnight = cursor.getHours() * 60 + cursor.getMinutes();
      const slotIdx = Math.floor((minutesSinceMidnight - START_HOUR * 60) / SLOT_MINUTES);
      keys.add(`${dayIdx}-${slotIdx}`);
      cursor = new Date(cursor.getTime() + SLOT_MINUTES * 60 * 1000);
    }
  }
  return keys;
}

function localStorageKey(guestSlug: string) {
  return `gropumeeting_guest_${guestSlug}`;
}

const GuestVote = () => {
  const { guestSlug } = useParams<{ guestSlug: string }>();
  const [loadingMeeting, setLoadingMeeting] = useState(true);
  const [meeting, setMeeting] = useState<MeetingForGuest | null>(null);
  const [fetchFailed, setFetchFailed] = useState(false);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentUser = useAuthStore((s) => s.user);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [availabilities, setAvailabilities] = useState<AvailabilitySlot[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [existingGuestId, setExistingGuestId] = useState<string | null>(null);
  const [initialSelected, setInitialSelected] = useState<Set<string> | undefined>(undefined);

  const isEditing = !!existingGuestId;

  const onAvailabilitiesChange = useCallback((slots: AvailabilitySlot[]) => {
    setAvailabilities(slots);
  }, []);

  useEffect(() => {
    if (!guestSlug) {
      setLoadingMeeting(false);
      setFetchFailed(true);
      return;
    }
    let cancelled = false;
    setLoadingMeeting(true);
    setFetchFailed(false);

    // Check localStorage for an existing guestId
    const storedGuestId = localStorage.getItem(localStorageKey(guestSlug)) ?? undefined;

    (async () => {
      try {
        const m = await getMeeting(guestSlug, storedGuestId);
        if (!cancelled) {
          setMeeting(m);
          // If server returned guest data, pre-populate
          if (m.guest) {
            setExistingGuestId(m.guest.id);
            setName(m.guest.name);
            setEmail(m.guest.email ?? "");
            if (m.proposedDates?.length && m.guest.availabilities?.length) {
              setInitialSelected(
                availabilitiesToCellKeys(m.guest.availabilities, m.proposedDates)
              );
            }
          } else if (currentUser) {
            // Pre-populate with currently signed-in user
            setName(currentUser.name ?? "");
            setEmail(currentUser.email ?? "");
          }
        }
      } catch {
        if (!cancelled) {
          setMeeting(null);
          setFetchFailed(true);
        }
      } finally {
        if (!cancelled) setLoadingMeeting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [guestSlug, isAuthenticated, currentUser?.email, currentUser?.name]);

  const handleSubmit = async () => {
    if (!guestSlug) return;
    setSubmitting(true);
    try {
      const result = await submitVote(guestSlug, {
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        availabilities,
      });
      // Persist guestId for future edits
      if (result.guestId) {
        localStorage.setItem(localStorageKey(guestSlug), result.guestId);
        setExistingGuestId(result.guestId);
      }
      setSubmitted(true);
      toast.success("Availability saved!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit availability");
    } finally {
      setSubmitting(false);
    }
  };

  // Unique key to force AvailabilityGrid remount when initialSelected changes
  const gridKey = useMemo(
    () => (initialSelected ? `edit-${initialSelected.size}` : "new"),
    [initialSelected]
  );

  if (loadingMeeting) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <div className="flex min-h-screen items-center justify-center p-4 pt-24">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm">Loading meeting…</p>
          </div>
        </div>
      </div>
    );
  }

  if (fetchFailed || !meeting) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <div className="flex min-h-screen items-center justify-center p-4 pt-24">
        <Card className="w-full max-w-md border-border/50 shadow-lg rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Meeting Not Found or Link Expired</CardTitle>
            <CardDescription>
              This link may be invalid or the meeting may no longer be available. Ask the host for a new link.
            </CardDescription>
          </CardHeader>
        </Card>
        </div>
      </div>
    );
  }

  /* success view removed — we now show a toast and keep the user on the grid */

  const hasDates = meeting.proposedDates.length > 0;
  const canSubmit =
    isAuthenticated && name.trim().length >= 2 && availabilities.length > 0 && !submitting;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 p-4 pb-16 pt-24">
          <header className="space-y-2 text-center sm:text-left">
            <p className="text-sm font-semibold text-primary">You&apos;re invited</p>
            <h1 className="text-balance text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">
              {meeting.title}
            </h1>
            {meeting.description ? (
              <p className="text-pretty max-w-2xl text-muted-foreground">
                {meeting.description}
              </p>
            ) : null}
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Duration:</span>{" "}
              {meeting.durationMinutes} minutes
            </p>
          </header>

          <Card className="border-border/50 shadow-xl rounded-3xl bg-card/65 backdrop-blur-md overflow-hidden relative border">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-purple-500 to-indigo-600"></div>
            <CardHeader className="text-center pt-8 pb-4">
              <CardTitle className="text-2xl font-display font-extrabold tracking-tight">Sign in to Participate</CardTitle>
              <CardDescription className="max-w-md mx-auto text-muted-foreground mt-2">
                Please sign in to select and submit your availability. This ensures you receive calendar invites and meeting updates directly to your Gmail.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-8 pt-0 gap-6">
              <div className="w-full max-w-sm">
                <SignInButton mode="modal" forceRedirectUrl={window.location.href}>
                  <Button type="button" className="w-full btn-gradient-primary rounded-xl py-6 font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 text-base">
                    Sign in to Vote
                  </Button>
                </SignInButton>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Fast, secure sign-in via Clerk. No password required.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-4 pb-16 pt-24">
        <header className="space-y-2 text-center sm:text-left">
          <p className="text-sm font-semibold text-primary">You&apos;re invited</p>
          <h1 className="text-balance text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">
            {meeting.title}
          </h1>
          {meeting.description ? (
            <p className="text-pretty max-w-2xl text-muted-foreground">
              {meeting.description}
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Duration:</span>{" "}
            {meeting.durationMinutes} minutes
          </p>
        </header>

        {meeting.status === "CONFIRMED" ? (
          <Card className="border-border/50 shadow-xl rounded-3xl bg-card/65 backdrop-blur-md overflow-hidden relative border">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600"></div>
            <CardHeader className="text-center pt-8 pb-4">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-2xl font-display font-extrabold tracking-tight text-foreground">
                This Meeting is Confirmed!
              </CardTitle>
              <CardDescription className="max-w-md mx-auto text-muted-foreground mt-2">
                The host has finalized the meeting time. You can no longer edit your availability.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-8 pt-0 gap-6">
              <div className="w-full max-w-md bg-muted/40 border border-border/80 rounded-2xl p-6 space-y-4">
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Scheduled Date & Time</span>
                  {meeting.finalStartTime ? (
                    <>
                      <span className="text-lg font-bold text-foreground mt-2">
                        {format(new Date(meeting.finalStartTime), "eeee, MMMM d, yyyy")}
                      </span>
                      <span className="text-sm text-primary font-medium mt-1">
                        {format(new Date(meeting.finalStartTime), "h:mm a")} - {meeting.finalEndTime ? format(new Date(meeting.finalEndTime), "h:mm a") : ""} ({meeting.durationMinutes} min)
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground mt-1">Time not specified</span>
                  )}
                </div>

                {meeting.meetLink && (
                  <div className="pt-2">
                    <a
                      href={meeting.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button className="w-full btn-gradient-primary rounded-xl py-6 font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 text-sm">
                        Join Google Meet
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : !hasDates ? (
          <Card className="border-border/50 shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-display">No dates to vote on</CardTitle>
              <CardDescription>
                The host has not proposed any days yet. Check back later.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <Card className="border-border/50 shadow-md rounded-2xl bg-muted/30">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
                <div>
                  <CardTitle className="text-base font-display font-semibold">Voting Details</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Your availability will be submitted under your signed-in profile.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3 bg-card border border-border/80 px-4 py-2 rounded-xl">
                  {currentUser?.picture ? (
                    <img src={currentUser.picture as string} alt="Avatar" className="w-7 h-7 rounded-full object-cover" />
                  ) : null}
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground leading-none">{name}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{email}</span>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <AvailabilityGrid
              key={gridKey}
              proposedDates={meeting.proposedDates}
              onAvailabilitiesChange={onAvailabilitiesChange}
              showFooterSubmit={false}
              initialSelected={initialSelected}
              hostBusyTimes={meeting.hostBusyTimes ?? []}
            />

            <div className="flex justify-center sm:justify-end">
              <Button
                size="lg"
                className="min-w-[200px]"
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating…" : "Submitting…"}
                  </>
                ) : submitted ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {isEditing ? "Update Again" : "Saved ✓"}
                  </>
                ) : isEditing ? (
                  "Update Availability"
                ) : (
                  "Submit Availability"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GuestVote;
