"use client";

import { useState, useEffect, useContext, useRef } from "react";
import Image from "next/image";
import { DataContext } from "~/store/GlobalState";
import images from "~/assets/images";
import moment from "moment";
import { useRouter } from "next/navigation";
import { GetRequest, PostRequest } from "~/utils/new-request";
import { Button } from "~/components/ui/button";
import { isUserDeactivated } from "~/utils/user-deactivation";

type SuggestedTeammate = {
  id?: string;
  user_id?: string;
  name: string;
  avatar_url?: string;
  default_avatar_url?: string;
  is_online?: boolean;
  is_deactivated?: boolean | string;
};

const GetStarted = () => {
  const { state } = useContext(DataContext);
  const { user, orgData, orgSlug } = state;
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [openingTeammateId, setOpeningTeammateId] = useState<string | null>(
    null
  );
  const [conversationError, setConversationError] = useState("");
  const openingConversation = useRef(false);

  useEffect(() => {
    const orgId = localStorage.getItem("orgId") || "";
    const getData = async () => {
      const res = await GetRequest(`/organisations/${orgId}/get-started`);
      if (res?.status === 200 || res?.status === 201) {
        setData(res?.data?.data);
      }
    };
    getData();
  }, []);

  const teammates = (data?.org_users_profile ?? []).slice(0, 14);

  const canMessage = (teammate: SuggestedTeammate) => {
    const participantId = teammate.user_id ?? teammate.id;
    return (
      Boolean(participantId) &&
      participantId !== (user?.user_id ?? user?.id) &&
      !isUserDeactivated(teammate)
    );
  };

  const openConversation = async (teammate: SuggestedTeammate) => {
    const participantId = teammate.user_id ?? teammate.id;
    if (
      !participantId ||
      !canMessage(teammate) ||
      openingConversation.current
    ) {
      return;
    }

    openingConversation.current = true;
    setOpeningTeammateId(participantId);
    setConversationError("");

    try {
      const orgId = localStorage.getItem("orgId") || "";
      if (!orgId || !orgSlug) throw new Error("Missing organisation");

      const res = await PostRequest(`/organisations/${orgId}/dms`, {
        chat_type: "user",
        participant_id: participantId,
      });
      const conversation = res?.data?.data;

      if (
        (res?.status !== 200 && res?.status !== 201) ||
        !conversation?.channel_id ||
        !conversation?.participant_id
      ) {
        throw new Error("Could not open conversation");
      }

      localStorage.setItem("channelName", teammate.name);
      router.push(
        `/${orgSlug}/home/people/${conversation.channel_id}/${conversation.participant_id}/dm`
      );
    } catch {
      setConversationError(
        "Couldn't open the conversation. Please select the teammate again to retry."
      );
    } finally {
      openingConversation.current = false;
      setOpeningTeammateId(null);
    }
  };

  return (
    <div className="bg-[#f6f7f9] h-screen overflow-y-auto px-4 sm:px-6 lg:px-10 py-10 relative w-full scrollbar-hide scroll-smooth m-auto">
      <div className="mb-4">
        <h2 className="font-semibold text-sm mb-3">Get started</h2>
        <p className="text-lg font-extrabold">
          <span className="text-3xl">👋</span> Welcome,{" "}
          <span className="text-purple-800">{user?.username}</span>! Ready to
          dive in?
        </p>
      </div>

      <div>
        {teammates.length > 0 && (
          <>
            <h3 className="font-bold text-sm">Say hello to someone</h3>
            <p className="font-semibold text-sm text-gray-500 mb-2">
              Here are a few of your {orgData?.name} teammates. Send someone a
              message and introduce yourself.
            </p>
          </>
        )}

        <div className="py-2 max-w-6xl">
          {conversationError && (
            <p role="alert" className="mb-3 text-sm text-red-600">
              {conversationError}
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {teammates.map((teamMate: SuggestedTeammate, index: number) => (
              <Button
                key={teamMate.id ?? index}
                type="button"
                variant="ghost"
                className="block h-auto p-0 text-left font-normal whitespace-normal bg-white hover:bg-white border rounded-md shadow cursor-pointer overflow-hidden focus-visible:ring-purple-800"
                onClick={() => openConversation(teamMate)}
                disabled={!canMessage(teamMate) || openingTeammateId !== null}
                aria-label={`Message ${teamMate.name}`}
                aria-busy={
                  openingTeammateId !== null &&
                  openingTeammateId === (teamMate.user_id ?? teamMate.id)
                }
              >
                <span className="block overflow-hidden rounded-t-md">
                  <Image
                    src={
                      teamMate.avatar_url ||
                      teamMate.default_avatar_url ||
                      images?.user
                    }
                    alt={teamMate.name}
                    className="w-full h-32 object-cover object-top transition-transform duration-300 ease-out hover:scale-110"
                    height={100}
                    width={100}
                    unoptimized
                  />
                </span>
                <span className="block p-3">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate">
                      {teamMate.name.slice(0, 15)}
                    </span>
                    <span
                      className={`shrink-0 border rounded-full h-2.5 w-2.5 border-gray-600 ${teamMate.is_online && "bg-green-600"}`}
                    ></span>
                  </span>
                  <span className="block text-xs text-gray-500">
                    {teamMate.is_online ? "Active" : "Away"}
                  </span>
                </span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div>
          <h3 className="font-bold text-sm">Explore channels to join</h3>
          <p className="font-semibold text-sm text-gray-500 mb-2">
            Channels are organized spaces for conversations. Here are few
            suggestions.
          </p>
        </div>

        <div className="border rounded-md bg-white">
          {data?.org_channels?.map((channel: any, index: number) => (
            <div
              key={index}
              className="p-4 cursor-pointer flex items-center justify-between border-b"
              onClick={() =>
                router.push(`/${orgSlug}/home/channels/${channel?.channels_id}`)
              }
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-blue-500">
                    #{channel.name}
                  </p>
                  {channel.recentPosts !== "" && (
                    <span className="text-[10px] font-semibold p-0.5 bg-[#ade3ed] text-blue-900">
                      {channel.recentPosts} RECENT POSTS
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-gray-500 font-semibold text-sm">
                  {channel?.last_post_time === "No posts yet" ? (
                    <p>{channel?.last_post_time}</p>
                  ) : (
                    <p>
                      Last post{" "}
                      {moment(channel?.last_post_time)
                        .startOf("minute")
                        .fromNow()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-gray-500 font-semibold text-sm">
                  {channel.numberMembers}
                </p>

                <div className="flex items-center">
                  {channel?.member_avatars
                    ?.slice(0, 5)
                    ?.map((member: any, index: number) => (
                      <div
                        key={index}
                        className={`w-9 h-9 rounded-xl overflow-hidden border-2 border-white ${index !== 0 ? "-ml-3" : ""}`}
                      >
                        <Image
                          width={35}
                          height={35}
                          src={member || images?.user}
                          alt={member}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
