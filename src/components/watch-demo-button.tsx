"use client";

import { useState } from "react";
import { OutlineBtn } from "~/app/(homepage)/_components/ui/Button";
import { WatchDemoModal } from "~/components/watch-demo-modal";

interface WatchDemoButtonProps {
  text: string;
  title: string;
}

export function WatchDemoButton({ text, title }: WatchDemoButtonProps) {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <>
      <OutlineBtn text={text} onClick={() => setShowDemo(true)} />
      <WatchDemoModal
        open={showDemo}
        onClose={() => setShowDemo(false)}
        title={title}
      />
    </>
  );
}
