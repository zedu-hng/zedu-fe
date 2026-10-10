export function tokenizeMessageText(text: string) {
  const emailRegex =
    /[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}/g;
  const mentionRegex = /([@#][a-zA-Z0-9_.-]+(?:\s[a-zA-Z0-9_.-]+)*)/g;
  const spans: { text: string; isEmail: boolean }[] = [];
  let cursor = 0;

  for (const match of text.matchAll(emailRegex)) {
    const start = match.index!;
    spans.push({ text: text.slice(cursor, start), isEmail: false });
    spans.push({ text: match[0], isEmail: true });
    cursor = start + match[0].length;
  }
  spans.push({ text: text.slice(cursor), isEmail: false });

  return spans.flatMap(({ text, isEmail }) =>
    isEmail
      ? [{ text, isEmail: true, isMention: false }]
      : text.split(mentionRegex).map((part, index) => ({
          text: part,
          isEmail: false,
          isMention: index % 2 === 1,
        }))
  );
}
