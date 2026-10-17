import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import {
  ComponentPropsWithoutRef,
  ElementRef,
  ForwardedRef,
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
 * @param props - `text` is the tooltip content, `children` is the element that
 * shows it on hover or focus, and `side` is where it appears (defaults to
 * "top"). Any other props are passed to the trigger.
 * @param ref - Ref forwarded to the trigger element.
 * @returns The child element wrapped with its tooltip.
 */
function TooltipsBase(
  { text, children, side = "top", ...triggerProps }: TooltipProps,
  ref: ForwardedRef<ElementRef<typeof TooltipTrigger>>
) {
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

const Tooltips = forwardRef<ElementRef<typeof TooltipTrigger>, TooltipProps>(
  TooltipsBase
);
Tooltips.displayName = "Tooltips";

export default Tooltips;
