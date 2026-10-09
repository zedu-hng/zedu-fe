"use client";

import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { DataContext } from "~/store/GlobalState";
import { DmPopout, PeoplePopout } from "./dm-popout";
import type { SidebarPopoutKey } from "./types";

type PreviewTriggerHandlers = {
  onMouseEnter: React.MouseEventHandler<HTMLAnchorElement>;
  onFocus: React.FocusEventHandler<HTMLAnchorElement>;
};

type SidebarPopoutProviderProps = {
  children: (controls: {
    getPreviewHandlers: (preview: SidebarPopoutKey) => PreviewTriggerHandlers;
    schedulePreviewClose: () => void;
  }) => ReactNode;
};

export const SidebarPopoutProvider = ({
  children,
}: SidebarPopoutProviderProps) => {
  const { state } = useContext(DataContext);
  const [activePreview, setActivePreview] = useState<SidebarPopoutKey | null>(
    null
  );
  const [previewTop, setPreviewTop] = useState<number | null>(null);
  const [previewPositionTop, setPreviewPositionTop] = useState<number | null>(
    null
  );
  const previewCardRef = useRef<HTMLDivElement | null>(null);
  const previewCloseTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const cancelPreviewClose = useCallback(() => {
    if (previewCloseTimeout.current !== null) {
      clearTimeout(previewCloseTimeout.current);
      previewCloseTimeout.current = null;
    }
  }, []);

  const schedulePreviewClose = useCallback(() => {
    cancelPreviewClose();
    previewCloseTimeout.current = setTimeout(() => {
      setActivePreview(null);
      previewCloseTimeout.current = null;
    }, 150);
  }, [cancelPreviewClose]);

  const showPreview = useCallback(
    (preview: SidebarPopoutKey, element: HTMLElement) => {
      cancelPreviewClose();
      setActivePreview(preview);
      setPreviewTop(
        element.getBoundingClientRect().top +
          element.getBoundingClientRect().height / 2
      );
    },
    [cancelPreviewClose]
  );

  const getPreviewHandlers = useCallback(
    (preview: SidebarPopoutKey): PreviewTriggerHandlers => ({
      onMouseEnter: (event) => showPreview(preview, event.currentTarget),
      onFocus: (event) => showPreview(preview, event.currentTarget),
    }),
    [showPreview]
  );

  useEffect(
    () => () => {
      if (previewCloseTimeout.current !== null) {
        clearTimeout(previewCloseTimeout.current);
      }
    },
    []
  );

  useLayoutEffect(() => {
    if (previewTop === null || !activePreview || !previewCardRef.current) {
      return;
    }

    const updatePosition = () => {
      const cardHeight = previewCardRef.current?.getBoundingClientRect().height;
      if (cardHeight === undefined) return;

      const minTop = 16;
      const maxTop = Math.max(minTop, window.innerHeight - cardHeight - minTop);
      setPreviewPositionTop(
        Math.min(Math.max(previewTop - cardHeight / 2, minTop), maxTop)
      );
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);

    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(previewCardRef.current);

    return () => {
      window.removeEventListener("resize", updatePosition);
      resizeObserver.disconnect();
    };
  }, [activePreview, previewTop]);

  const popout =
    activePreview === "dms"
      ? {
          title: "Direct messages",
          action: "Unreads",
          content: (
            <DmPopout dms={Array.isArray(state?.dms) ? state.dms : []} />
          ),
        }
      : activePreview === "people"
        ? {
            title: "People",
            action: "Online",
            content: (
              <PeoplePopout
                people={
                  Array.isArray(state?.orgMembers) ? state.orgMembers : []
                }
              />
            ),
          }
        : null;
  return (
    <>
      {children({ getPreviewHandlers, schedulePreviewClose })}
      {popout &&
        activePreview &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={previewCardRef}
            className="fixed left-[110px] z-[60] w-[358px] max-w-[calc(100vw-120px)] overflow-y-auto rounded-xl bg-white p-5 text-[#182230] shadow-[0_12px_32px_rgba(0,0,0,0.22)]"
            style={{
              top: previewPositionTop ?? 16,
              maxHeight: "calc(100dvh - 32px)",
            }}
            onMouseEnter={cancelPreviewClose}
            onMouseLeave={schedulePreviewClose}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">{popout.title}</h2>
              <span className="text-xs text-[#5959A8]">{popout.action}</span>
            </div>
            {popout.content}
          </div>,
          document.body
        )}
    </>
  );
};
