import { ChessKnight, Handshake, LifeBuoy, MessageCircle, Newspaper, type LucideIcon } from "lucide-react";

/**
 * How to reach YouInSports. Every "write to us" on the site points here, so
 * changing the address is a one-line edit.
 */
export const SUPPORT_EMAIL = "support@youinsports.ai";

/**
 * The longest message the form takes. The form hands the message to the
 * visitor's mail app in a `mailto:` link, and a few older mail apps cut those
 * off at around 2,000 characters, so this leaves room for the encoding.
 */
export const MESSAGE_LIMIT = 1500;

export type ContactTopic = {
  id: string;
  label: string;
  /** Opens the email's subject line, so the inbox can be sorted at a glance. */
  subject: string;
  /** The message box's prompt while this topic is picked. */
  prompt: string;
  icon: LucideIcon;
};

export const CONTACT_TOPICS = [
  {
    id: "support",
    label: "Support",
    subject: "Support request",
    prompt: "What's happening, and what were you trying to do when it did?",
    icon: LifeBuoy,
  },
  {
    id: "chessboard",
    label: "Chessboard",
    subject: "Chessboard enquiry",
    prompt: "How many boards, and are you looking to buy them or rent them for an event?",
    icon: ChessKnight,
  },
  {
    id: "partnerships",
    label: "Partnerships",
    subject: "Partnership enquiry",
    prompt: "Tell us about your club, event or organisation, and what you have in mind.",
    icon: Handshake,
  },
  {
    id: "press",
    label: "Press",
    subject: "Press enquiry",
    prompt: "Who you write for, what the story is, and when you need to hear back.",
    icon: Newspaper,
  },
  {
    id: "other",
    label: "Something else",
    subject: "Hello",
    prompt: "Whatever's on your mind, we'd like to hear it.",
    icon: MessageCircle,
  },
] as const satisfies readonly ContactTopic[];

export type ContactTopicId = (typeof CONTACT_TOPICS)[number]["id"];

export const CONTACT_TOPIC_IDS = CONTACT_TOPICS.map((topic) => topic.id) as [
  ContactTopicId,
  ...ContactTopicId[],
];

export function topicById(id: ContactTopicId): ContactTopic {
  return CONTACT_TOPICS.find((topic) => topic.id === id) ?? CONTACT_TOPICS[0];
}

export type ComposedEmail = { to: string; subject: string; body: string };

/** The email the form writes: the topic and name in the subject, the message signed with the name. */
export function composeEmail({
  topic,
  name,
  message,
}: {
  topic: ContactTopicId;
  name: string;
  message: string;
}): ComposedEmail {
  return {
    to: SUPPORT_EMAIL,
    subject: `${topicById(topic).subject} from ${name}`,
    body: `${message}\n\n— ${name}`,
  };
}

/** Opens the visitor's own mail app. Line breaks in a mailto body are CRLF (RFC 6068). */
export function mailtoHref({ to, subject, body }: ComposedEmail) {
  const crlf = body.replace(/\r?\n/g, "\r\n");
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(crlf)}`;
}

/** The same email, opened in Gmail on the web, for visitors with no mail app set up. */
export function gmailHref({ to, subject, body }: ComposedEmail) {
  return `https://mail.google.com/mail/?${new URLSearchParams({ view: "cm", fs: "1", to, su: subject, body })}`;
}

/** The same email as plain text, to paste into any mail app. */
export function emailAsText({ to, subject, body }: ComposedEmail) {
  return `To: ${to}\nSubject: ${subject}\n\n${body}`;
}
