"use client";

import { BarChart3, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import Tooltips from "../tooltip";
import {
  MAX_POLL_OPTION_LENGTH,
  MAX_POLL_OPTIONS,
  MAX_POLL_QUESTION_LENGTH,
  MIN_POLL_OPTIONS,
  POLLS_FEATURE_ENABLED,
  type PollResult,
} from "./channel-polls-context";

interface CreatePollDialogProps {
  onSubmit: (question: string, options: string[]) => Promise<PollResult | null>;
}

const CreatePollDialog = ({ onSubmit }: CreatePollDialogProps) => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setQuestion("");
    setOptions(["", ""]);
    setSubmitting(false);
  }, [open]);

  const filledOptions = options
    .map((option) => option.trim())
    .filter((option) => option.length > 0);

  const canSubmit =
    !submitting &&
    question.trim().length > 0 &&
    filledOptions.length >= MIN_POLL_OPTIONS;

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  };

  const removeOption = (index: number) => {
    setOptions((prev) =>
      prev.length <= MIN_POLL_OPTIONS
        ? prev
        : prev.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    const poll = await onSubmit(question.trim(), filledOptions);
    setSubmitting(false);

    if (poll) setOpen(false);
  };

  if (!POLLS_FEATURE_ENABLED) return null;

  return (
    <>
      <Tooltips text="Create a poll">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="p-1.5 hover:bg-gray-100 rounded"
          aria-label="Create a poll"
        >
          <BarChart3 size={18} color="#606060" />
        </button>
      </Tooltips>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="font-semibold">Create a poll</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="poll-question">
              Question
            </label>
            <Input
              id="poll-question"
              value={question}
              maxLength={MAX_POLL_QUESTION_LENGTH}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question"
            />

            <label className="mt-2 text-sm font-medium">Options</label>
            <div className="flex flex-col gap-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    maxLength={MAX_POLL_OPTION_LENGTH}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    aria-label={`Option ${index + 1}`}
                  />

                  {options.length > MIN_POLL_OPTIONS && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="shrink-0 rounded p-1.5 text-[#606060] hover:bg-gray-100"
                      aria-label={`Remove option ${index + 1}`}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < MAX_POLL_OPTIONS && (
              <button
                type="button"
                onClick={() => setOptions((prev) => [...prev, ""])}
                className="mt-1 flex items-center gap-1 self-start text-sm font-medium text-[#0A5CFF] hover:underline"
              >
                <Plus size={16} />
                Add option
              </button>
            )}
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="bg-blue-500 px-10 text-white"
            >
              {submitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreatePollDialog;
