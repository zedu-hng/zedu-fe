import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { loadOrganisationThreadsPage } from "~/utils/org-threads";

const UseThreads = () => {
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);
  const { state, dispatch } = useContext(DataContext);
  const { threadMentions } = state;
  const orgId =
    state?.orgId ||
    (typeof window !== "undefined" ? localStorage.getItem("orgId") : "") ||
    "";
  const threadActivity = state?.threadActivity ?? 0;
  const firstActivity = useRef(threadActivity);

  const initialLoading =
    threadMentions === null || threadMentions === undefined;
  const loading = initialLoading || loadingMore;

  hasMoreRef.current = hasMore;

  useEffect(() => {
    if (threadMentions !== null && threadMentions !== undefined) return;

    if (!orgId || !state?.token) return;
    let cancelled = false;

    const loadInitial = async () => {
      const {
        success,
        threads,
        hasMore: nextHasMore,
        unseenThreadCount,
      } = await loadOrganisationThreadsPage(orgId, 1);
      if (cancelled || localStorage.getItem("orgId") !== orgId) return;

      dispatch({
        type: ACTIONS.THREAD_MENTIONS,
        payload: {
          newThreads: success ? threads : [],
          newPage: 1,
          hasMore: nextHasMore,
          unseenThreadCount: success ? unseenThreadCount : 0,
        },
      });
      pageRef.current = 1;
      setHasMore(nextHasMore);
    };

    void loadInitial();
    return () => {
      cancelled = true;
    };
  }, [threadMentions, orgId, state?.token, dispatch]);

  useEffect(() => {
    setHasMore(Boolean(state.threadMentionsHasMore));
  }, [state.threadMentionsHasMore]);

  useEffect(() => {
    if (threadActivity === firstActivity.current || !orgId || !state?.token)
      return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const result = await loadOrganisationThreadsPage(orgId, 1);
      if (
        cancelled ||
        !result.success ||
        localStorage.getItem("orgId") !== orgId
      )
        return;
      // Refresh the top page without dropping older pages or changing the cursor.
      dispatch({
        type: ACTIONS.THREAD_MENTIONS,
        payload: {
          newThreads: result.threads,
          refresh: true,
          ...(pageRef.current === 1 ? { hasMore: result.hasMore } : {}),
        },
      });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [threadActivity, orgId, state?.token, dispatch]);

  const fetchThreads = useCallback(
    async (newPage: number) => {
      const orgId = localStorage.getItem("orgId") || "";

      if (!orgId) {
        setHasMore(false);
        return;
      }

      if (newPage <= pageRef.current || loadingMoreRef.current) {
        return;
      }

      const previousPage = pageRef.current;
      pageRef.current = newPage;
      loadingMoreRef.current = true;
      setLoadingMore(true);

      try {
        const {
          success,
          threads,
          hasMore: nextHasMore,
        } = await loadOrganisationThreadsPage(orgId, newPage);
        if (localStorage.getItem("orgId") !== orgId) return;

        if (!success) {
          pageRef.current = previousPage;
          setHasMore(false);
          return;
        }

        dispatch({
          type: ACTIONS.THREAD_MENTIONS,
          payload: {
            newThreads: threads,
            newPage,
            hasMore: nextHasMore,
          },
        });
        setHasMore(nextHasMore);
      } finally {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    },
    [dispatch]
  );

  const fetchMoreData = useCallback(() => {
    if (!hasMoreRef.current || loadingMoreRef.current) return;
    void fetchThreads(pageRef.current + 1);
  }, [fetchThreads]);

  return {
    fetchMoreData,
    hasMore,
    loading,
  };
};

export default UseThreads;
