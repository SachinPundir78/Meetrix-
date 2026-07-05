import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Clock, CalendarDays, ArrowLeft, ExternalLink, Video } from "lucide-react";
import { AppNavbar } from "@/components/AppNavbar";
import { getAttendingMeetings, type MyMeeting } from "@/lib/api";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { format, isSameDay, parseISO } from "date-fns";

const MyMeetings = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<MyMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAttendingMeetings();
        if (!cancelled) setMeetings(data);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load meetings.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const matchesDate = (meeting: MyMeeting, date: Date): boolean => {
    // If finalized, check if same day as finalStartTime
    if (meeting.finalStartTime) {
      try {
        return isSameDay(parseISO(meeting.finalStartTime), date);
      } catch {
        /* ignore */
      }
    }
    // Check proposedDates
    if (
      meeting.proposedDates?.some((d) => {
        try {
          return isSameDay(parseISO(d), date);
        } catch {
          return false;
        }
      })
    )
      return true;
    return false;
  };

  const filteredMeetings = selectedDate
    ? meetings.filter((m) => matchesDate(m, selectedDate))
    : meetings;

  // Dates that have meetings (for calendar dot indicators)
  const meetingDates = meetings.flatMap((m) => {
    const dates: Date[] = [];
    if (m.finalStartTime) {
      try {
        dates.push(parseISO(m.finalStartTime));
      } catch {
        /* ignore */
      }
    }
    m.proposedDates?.forEach((d) => {
      try {
        dates.push(parseISO(d));
      } catch {
        /* ignore */
      }
    });
    return dates;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <div className="flex min-h-screen items-center justify-center pt-24">
          <Loader2
            className="h-10 w-10 animate-spin text-primary"
            aria-label="Loading"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <div className="flex min-h-screen items-center justify-center p-6 pt-24">
          <div className="max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <p className="text-sm font-medium text-foreground">
              Could not load invited meetings
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="mx-auto max-w-6xl px-4 pt-24 pb-10">
        <div className="flex items-center gap-4 pb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="shrink-0 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
              Meetings to Attend
            </h1>
            <p className="text-sm text-muted-foreground">
              Meetings created by others where you are invited as a guest
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left: Calendar */}
          <div className="shrink-0">
            <Card className="border-border/50 shadow-sm rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Filter by Date
                </CardTitle>
                <CardDescription className="text-xs">
                  Select a date to filter meetings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => setSelectedDate(date)}
                  modifiers={{ hasMeeting: meetingDates }}
                  modifiersStyles={{
                    hasMeeting: {
                      fontWeight: 700,
                      textDecoration: "underline",
                      textDecorationColor: "hsl(var(--primary))",
                      textUnderlineOffset: "3px",
                    },
                  }}
                  className="rounded-lg border p-3"
                />
                {selectedDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full text-xs text-muted-foreground"
                    onClick={() => setSelectedDate(undefined)}
                  >
                    Clear filter
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Meeting List */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">
                {selectedDate
                  ? `Meetings on ${format(selectedDate, "MMM d, yyyy")}`
                  : "All Invited Meetings"}
              </h2>
              <Badge variant="outline" className="text-xs">
                {filteredMeetings.length} result
                {filteredMeetings.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            {filteredMeetings.length === 0 ? (
              <Card className="border-dashed border-border/50 rounded-2xl">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarDays className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No meetings found
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {selectedDate
                      ? "Try selecting a different date or clear the filter."
                      : "You have not been invited to any meetings yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredMeetings.map((meeting) => {
                  const isConfirmed = meeting.status === "CONFIRMED";
                  return (
                    <Card
                      key={meeting.id}
                      className={`group border-border/50 shadow-sm rounded-2xl transition-all relative overflow-hidden flex flex-col justify-between ${isConfirmed
                        ? "border-emerald-500/20 bg-emerald-500/[0.02] hover:shadow-md hover:border-emerald-500/40"
                        : "hover:shadow-md hover:border-primary/30"
                        }`}
                    >
                      <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2">
                              {meeting.title}
                            </h3>
                            <Badge
                              variant={isConfirmed ? "default" : "destructive"}
                              className={`shrink-0 text-[10px] tracking-wider ${isConfirmed ? "bg-emerald-600 hover:bg-emerald-600 text-white" : "bg-red-600 hover:bg-red-600 text-white border-transparent"
                                }`}
                            >
                              {isConfirmed ? "Confirmed" : "Pending"}
                            </Badge>
                          </div>

                          {meeting.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {meeting.description}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                              {meeting.durationMinutes} min
                            </span>
                            {!isConfirmed && (
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground/70" />
                                {meeting.proposedDates?.length || 0} proposed day{(meeting.proposedDates?.length || 0) !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Confirmed Details Block */}
                        {isConfirmed && meeting.finalStartTime && (
                          <div className="bg-emerald-500/[0.04] border border-emerald-500/10 rounded-xl p-3.5 space-y-1">
                            <p className="text-[13px] tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
                              Scheduled Time
                            </p>
                            <p className="text-xs font-bold text-foreground">
                              {format(parseISO(meeting.finalStartTime), "eee, MMM d, yyyy")}
                            </p>
                            <p className="text-xs font-semibold text-primary">
                              {format(parseISO(meeting.finalStartTime), "h:mm a")} - {meeting.finalEndTime ? format(parseISO(meeting.finalEndTime), "h:mm a") : ""}
                            </p>
                          </div>
                        )}

                        {/* Host Details */}
                        <div className="flex items-center gap-2.5 pt-2 border-t border-border/40">
                          {meeting.hostPicture ? (
                            <img
                              src={meeting.hostPicture}
                              alt={meeting.hostName}
                              className="w-7 h-7 rounded-full object-cover border border-border"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border">
                              {meeting.hostName?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-foreground leading-none">
                              {meeting.hostName}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate leading-none mt-1">
                              Host
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 flex gap-2">
                          {isConfirmed ? (
                            meeting.meetLink ? (
                              <a
                                href={meeting.meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full"
                              >
                                <Button
                                  size="sm"
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5"
                                >
                                  <Video className="h-4 w-4" />
                                  Join Meeting
                                </Button>
                              </a>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full rounded-xl font-bold text-xs"
                                disabled
                              >
                                Confirmed
                              </Button>
                            )
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => navigate(`/m/${meeting.guestSlug}`)}
                              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md shadow-red-600/10 transition-colors"
                            >
                              Vote / Edit Availability
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyMeetings;
