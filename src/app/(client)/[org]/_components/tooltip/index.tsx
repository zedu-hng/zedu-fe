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

/**
 * Wraps a single child element with a hover tooltip.
 *
 * The ref and any extra trigger props are forwarded to the underlying
 * `TooltipTrigger`, so this component can be nested inside another `asChild`
 * trigger (for example `PopoverTrigger`) without breaking it.
 *
 * @param text - Text shown inside the tooltip.
 * @param children - The element that shows the tooltip on hover or focus.
 * @param side - Side of the trigger where the tooltip appears. Defaults to "top".
 */
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
