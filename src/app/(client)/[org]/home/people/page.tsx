"use client";
import { useContext } from "react";
import AllPeopleHeader from "../../_components/people-nav/all-peoples";
import PeopleTab from "../../_components/channels/tabs/peoples-tab";
import HoverSidebar from "../../_components/profile-sidebar/hover-sidebar";
import { DataContext } from "~/store/GlobalState";
import { cn } from "~/lib/utils";
import { useIsSmUp } from "~/hooks/use-media-query";

export default function PeoplesPage() {
  const { state } = useContext(DataContext);
  const isSmUp = useIsSmUp();
  const profilePanelOpen = Boolean(state?.hoverProfile);

  return (
    <div className="flex h-[calc(100vh-70px)] relative w-full overflow-hidden">
      <div
        className="flex flex-col relative w-full overflow-hidden transition-[margin]"
        style={{ marginRight: profilePanelOpen && isSmUp ? "408px" : 0 }}
      >
        <AllPeopleHeader />

        <PeopleTab />
      </div>

      {profilePanelOpen && (
        <div
          className={cn(
            "fixed z-30 mt-[60px] right-0 top-0 h-full bg-white border-l border-[#E6EAEF] shadow-[-3px_0px_25px_0px_#DFDFDF]",
            isSmUp ? "w-[408px]" : "w-full"
          )}
        >
          <HoverSidebar />
        </div>
      )}
    </div>
  );
}
