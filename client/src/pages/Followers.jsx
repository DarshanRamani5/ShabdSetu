import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import BackButton from "@/components/BackButton";
import { useFetch } from "@/hooks/useFetch";
import { getEnv } from "@/helpers/getEnv";
import Loading from "@/components/Loading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RouteProfileView } from "@/helpers/RouteName";
import { Button } from "@/components/ui/button";
import { Sparkles, UserPlus } from "lucide-react";
import FollowButton from "@/components/FollowButton";
import { getDisplayName } from "@/utils/functions";

const Followers = () => {
  const currentUser = useSelector((state) => state.user?.user);
  const navigate = useNavigate();

  const [followersList, setFollowersList] = useState([]);

  const requestUrl = currentUser?._id
    ? `${getEnv("VITE_API_BASE_URL")}/follow/followers/${currentUser._id}`
    : null;

  const { data, loading, error } = useFetch(
    requestUrl,
    { method: "get", credentials: "include" },
    [requestUrl]
  );

  React.useEffect(() => {
    if (!requestUrl) {
      setFollowersList([]);
      return;
    }

    if (Array.isArray(data?.followers)) {
      setFollowersList(data.followers.filter(Boolean));
    } else {
      setFollowersList([]);
    }
  }, [data, requestUrl]);

  if (!currentUser?._id) {
    return (
      <div className="py-10 text-center text-gray-500">
        Please sign in to see who's following you.
      </div>
    );
  }

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="py-10 text-center text-red-500">
        Unable to load followers right now.
      </div>
    );
  }

  const totalFollowers = followersList.length;

  return (
    <div className="mx-auto max-w-8xl space-y-10 px-4 py-8 sm:px-8 lg:px-12">
      <BackButton />
      <section className="relative overflow-hidden rounded-[40px] bg-[#6C5CE7] px-6 py-10 text-white shadow-[0_35px_80px_-45px_rgba(15,23,42,0.9)] sm:px-10">
        <div className="absolute top-0 right-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-16 h-64 w-64 translate-y-1/2 rounded-full bg-purple-300/40 blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-3xl font-black leading-tight sm:text-4xl">
              Followers
            </h1>
            <p className="text-sm text-white/85 sm:text-base">
              Celebrate the readers who keep coming back. Peek at their profiles or follow them to stay connected.
            </p>
          </div>
          <div className="rounded-4xl border border-white/25 bg-white/10 px-8 py-6 text-center shadow-[0_20px_60px_-35px_rgba(15,23,42,0.8)]">
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/70">
              Followers
            </p>
            <p className="text-4xl font-black text-white">
              {totalFollowers}
            </p>
            <p className="text-xs text-white/70">people tuning in</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Your community</h2>
          <p className="text-sm text-slate-500">
            Tap a reader to view their public profile or follow them back in one click.
          </p>
        </div>

        {followersList.length === 0 ? (
          <div className="rounded-4xl border border-dashed border-slate-200 bg-white/80 p-12 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7]">
              <UserPlus className="h-12 w-12" />
            </div>
            <p className="text-lg font-semibold text-slate-800">No followers yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Share your work to invite readers to follow your journey.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {followersList.map((follower, idx) => {
              const displayName = getDisplayName(follower);
              const usernameHandle = follower?.username ? `@${follower.username}` : "";
              const initialsSource = (follower?.name?.trim() || follower?.username || "F").toString();
              const initials = initialsSource.charAt(0).toUpperCase();
              const profileId = follower?._id;

              return (
                <div
                  key={profileId || `follower-${idx}`}
                  className="rounded-4xl border border-slate-100 bg-white/95 p-6 shadow-[0_25px_70px_-55px_rgba(15,23,42,0.7)] transition-colors hover:border-[#6C5CE7]/40"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div
                      className="flex flex-1 cursor-pointer items-start gap-4"
                      onClick={() => profileId && navigate(RouteProfileView(profileId))}
                    >
                      <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                        <AvatarImage src={follower?.avatar ?? undefined} alt={displayName} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="truncate text-lg font-semibold text-slate-900">
                            {displayName || "Unknown"}
                          </h3>
                        </div>

                        {(follower?.username || follower?.email) && (
                          <p className="truncate text-sm text-slate-500">
                            {usernameHandle || follower.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        variant="ghost"
                        onClick={() => profileId && navigate(RouteProfileView(profileId))}
                        className="rounded-full px-6 text-sm text-[#6C5CE7] hover:bg-[#6C5CE7]/10"
                      >
                        View profile
                      </Button>
                      <FollowButton
                        userId={profileId}
                        className="rounded-full bg-[#6C5CE7] px-6 text-sm font-semibold text-white hover:bg-[#5b4dd4]"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Followers;
