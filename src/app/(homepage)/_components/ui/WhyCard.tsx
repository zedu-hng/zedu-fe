import { PurpleVerifiedBadge } from "../svgs";
import { ArrowRight } from "lucide-react";
import { cn } from "~/lib/utils";

type WhyCardProps = {
  title: string;
  titleLevel?: "h2" | "h3";
  desc: string;
  showBadge?: boolean;
  showArrow?: boolean;
  className?: string;
};

export const WhyCard = ({
  title,
  titleLevel = "h2",
  desc,
  showBadge = true,
  showArrow = false,
  className = "",
}: WhyCardProps) => {
  const Title = titleLevel;
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-between gap-5 rounded-xl bg-neutral-100 p-6",
        className
      )}
    >
      <Title className="text-xl font-bold text-neutral-900 text-left flex w-full gap-2 items-center justify-between">
        {title}
        {showBadge ? <PurpleVerifiedBadge /> : <div className="size-10" />}
      </Title>
      <p className="text-left   text-neutral-600">{desc}</p>

      {showArrow && (
        <div className="py-2">
          <ArrowRight strokeWidth={2} height={20} width={24} />
        </div>
      )}
    </div>
  );
};
