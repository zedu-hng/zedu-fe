import { useContext, useEffect, useRef, useState } from "react";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { GetRequest } from "~/utils/new-request";
import { prefetchAvatars } from "~/utils/prefetch-avatars";

const UseThreadReply = (onRead?: () => void) => {
  const { state, dispatch } = useContext(DataContext);
  const channelId = state?.thread?.channels_id;
  const threadId = state?.thread?.thread_id;
  const token = localStorage.getItem("token") || "";
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const orgId = state?.orgId || localStorage.getItem("orgId") || "";
  const scope = `${orgId}:${channelId}:${threadId}`;
  const scopeRef = useRef(scope);
  scopeRef.current = scope;
  const threadActivity = state?.threadActivity ?? 0;
  const firstActivity = useRef(threadActivity);

  const fetchReplies = async (
    newPage = 1,
    refresh = false,
    isCancelled = () => false
  ) => {
    if (!channelId || !threadId) return;

    try {
      const res = await GetRequest(
        `/threads/${threadId}/channels/${channelId}?page=${newPage}&limit=30`
      );
      if (
        scopeRef.current !== scope ||
        isCancelled() ||
        localStorage.getItem("orgId") !== orgId
      )
        return;

      if (res?.status === 200 || res?.status === 201) {
        const newThreads = Array.isArray(res.data?.data) ? res.data.data : [];

        dispatch({
          type: ACTIONS.REPLIES,
          payload: {
            newThreads,
            newPage,
            refresh,
            parentReactions: state?.thread?.reactions,
          },
        });

        if (!refresh && newPage === 1 && state?.reply) {
          onRead?.();
        }

        prefetchAvatars(newThreads);

        if (!refresh) setHasMore(newThreads.length >= 30);
      } else {
        if (!refresh) setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching thread replies:", error);
      if (!refresh) setHasMore(false);
    } finally {
      if (!refresh && scopeRef.current === scope) {
        setLoading(false);
        setPage(newPage);
      }
    }
  };

  useEffect(() => {
    if (threadId && channelId && token) {
      setLoading(true);
      fetchReplies(1).finally(() =>
        dispatch({ type: ACTIONS.MESSAGE_LOADING, payload: false })
      );
    }
  }, [state?.reply, orgId, threadId, channelId, token, dispatch, onRead]);

  const fetchRepliesRef = useRef(fetchReplies);
  fetchRepliesRef.current = fetchReplies;
  useEffect(() => {
    if (
      threadActivity === firstActivity.current ||
      !state?.reply ||
      !threadId ||
      !channelId ||
      !token
    )
      return;
    let cancelled = false;
    const timer = setTimeout(() => {
      void fetchRepliesRef.current(1, true, () => cancelled);
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [threadActivity, state?.reply, orgId, threadId, channelId, token]);

  const fetchMoreData = () => {
    if (hasMore && !loading) {
      fetchReplies(page + 1);
    }
  };

  return {
    fetchMoreData,
    hasMore,
    loading,
  };
};

export default UseThreadReply;
