import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  ReactNode,
} from "react";

type TooltipTriggerProps = Omit<
  ComponentPropsWithoutRef<typeof TooltipTrigger>,
  "children" | "asChild"
>;

interface TooltipProps extends TooltipTriggerProps {
  text: string;
  children: ReactNode;
  side?: "bottom" | "top" | "right" | "left";
}

// Props and ref are forwarded to the trigger so this wrapper can be used as the
// child of another `asChild` trigger (e.g. PopoverTrigger) without breaking it.
const Tooltips = forwardRef<ElementRef<typeof TooltipTrigger>, TooltipProps>(
  ({ text, children, side = "top", ...triggerProps }, ref) => {
    return (
      <Tooltip>
        <TooltipTrigger asChild ref={ref} {...triggerProps}>
          {children}
        </TooltipTrigger>

        <TooltipContent
          side={side}
          className="bg-black text-white p-2 rounded-md text-sm"
        >
          <TooltipArrow className="fill-black" />

          {text}
        </TooltipContent>
      </Tooltip>
    );
  }
);
Tooltips.displayName = "Tooltips";

export default Tooltips;
