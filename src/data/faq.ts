import { SUPPORT_EMAIL } from "@/data/contact";

/**
 * The FAQ page: its questions and answers, and the few brand values it needs.
 *
 * The entries are transcribed verbatim from the YouInSports app's FAQ
 * (`u-in-sports-client/src/pages/FAQ.js`) with the same ids, so deep links
 * such as `/faq#aichess-3` keep working. The one change is the brand name,
 * which the original spells two ways ("YouInSports" and "UinSports"); here
 * every mention reads {@link BRAND_NAME}.
 */

/** The name the copy uses. */
export const BRAND_NAME = "YouInSports";

/**
 * Where "Contact our support team" and "Send Email" lead: straight to the
 * support inbox while the contact page is switched off.
 */
// export const CONTACT_PATH = "/contact";
export const CONTACT_PATH = `mailto:${SUPPORT_EMAIL}`;

/** The canonical origin, as in the root layout's `metadataBase`. */
export const SITE_URL = "https://www.youinsports.ai";

/*
 * The original's two colours are theme tokens here rather than values, so
 * each has a shade for the light theme as well as the dark one (`globals.css`):
 * its blue (#418BCA) is `accent`, the logo's blue, and its orange (#F26A27)
 * is `orange`.
 */

export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  hasVideo?: boolean;
  /** A YouTube video id, embedded under the answer while the entry is open. */
  videoId?: string;
};

export type FaqCategory = {
  category: string;
  questions: FaqEntry[];
};

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    category: "Getting Started",
    questions: [
      {
        id: "getting-started-1",
        question: `How do I create an account on ${BRAND_NAME}?`,
        answer:
          "Creating an account is simple! Click the 'Sign Up' button, choose your account type (Athlete, Coach, or Organizer), fill in your basic information, and verify your email. You'll be ready to start building your sports profile immediately.",
        tags: ["account", "signup", "registration"],
        hasVideo: true,
        videoId: "jlfB-UdrnHA",
      },
      {
        id: "getting-started-google",
        question: `How to Create Your ${BRAND_NAME} Profile Using Google – Step by Step Guide`,
        answer:
          "Creating an account using Google is quick and easy! Click the 'Sign Up with Google' button on the login page, select your Google account, and follow the prompts to complete your profile.",
        tags: ["account", "signup", "google", "registration"],
        hasVideo: true,
        videoId: "N2-xFQAncgo",
      },
      {
        id: "getting-started-booking",
        question: `How to Book Any Event on ${BRAND_NAME} – Step by Step Guide!`,
        answer:
          `Booking an event on ${BRAND_NAME} is simple. Navigate to the Events section, find the event you wish to attend, and click 'Book Now'. Follow the checkout instructions to secure your spot.`,
        tags: ["booking", "events", "guide"],
        hasVideo: true,
        videoId: "pcioHpEZSek",
      },
      {
        id: "getting-started-parent-child",
        question: `How to Create Parent Child Account on ${BRAND_NAME}`,
        answer:
          "Creating a parent-child account allows you to manage your child's sports journey. Watch our video guide to learn how to easily set up and link a parent and child account.",
        tags: ["account", "parent", "child", "guide"],
        hasVideo: true,
        videoId: "osBPhlL88yA",
      },
      {
        id: "getting-started-2",
        question: "What types of accounts are available?",
        answer:
          `${BRAND_NAME} offers three main account types: Athlete accounts for sports professionals seeking support and opportunities, Coach accounts for mentors and trainers, and Organizer accounts for event planners and sports organizations. Each account type has specialized features tailored to your needs.`,
        tags: ["account types", "features"],
      },
      {
        id: "getting-started-3",
        question: "How do I complete my profile?",
        answer:
          "After signing up, navigate to your profile settings. Add your sports background, achievements, photos, and goals. The more complete your profile, the better we can match you with opportunities and supporters. Our profile completion guide walks you through each step.",
        tags: ["profile", "setup", "completion"],
      },
    ],
  },
  {
    category: "For Athletes",
    questions: [
      {
        id: "athletes-1",
        question: "How can I get financial support for my sports career?",
        answer:
          `${BRAND_NAME} connects athletes with supporters through our funding platform. Create compelling content about your journey, set clear funding goals, and engage with your community. Supporters can contribute to specific needs like equipment, training, or competition travel.`,
        tags: ["funding", "support", "financial"],
      },
      {
        id: "athletes-2",
        question: "How do I track my performance and progress?",
        answer:
          "Our performance tracker allows you to log training sessions, competition results, and personal bests. You can visualize your progress over time, share achievements with supporters, and use data to improve your training strategy.",
        tags: ["performance", "tracking", "analytics"],
      },
      {
        id: "athletes-3",
        question: "Can I connect with coaches and mentors?",
        answer:
          "Yes! Browse our coach directory, read reviews, and connect with certified professionals in your sport. Many coaches offer both in-person and virtual training sessions. You can also join group training programs and workshops.",
        tags: ["coaches", "mentors", "training"],
      },
    ],
  },
  {
    category: "For Coaches",
    questions: [
      {
        id: "coaches-1",
        question: "How can I offer my coaching services?",
        answer:
          "Create a detailed coach profile showcasing your experience, certifications, and coaching philosophy. Set your availability, pricing, and preferred training methods. Athletes can then book sessions directly through the platform.",
        tags: ["coaching", "services", "booking"],
      },
      {
        id: "coaches-2",
        question: "What tools are available for managing athletes?",
        answer:
          "Our coach dashboard includes athlete progress tracking, session scheduling, performance analytics, and communication tools. You can create custom training plans, monitor athlete development, and provide feedback efficiently.",
        tags: ["management", "tools", "dashboard"],
      },
    ],
  },
  {
    category: "For Organizers",
    questions: [
      {
        id: "organizers-1",
        question: "How do I create and promote sports events?",
        answer:
          "Use our event creation tool to set up competitions, tournaments, or training camps. Add event details, registration requirements, and promotional materials. Our platform helps you reach the right audience and manage registrations seamlessly.",
        tags: ["events", "promotion", "organization"],
        hasVideo: true,
        videoId: "retizTbzGfg",
      },
      {
        id: "organizers-2",
        question: "How can I find sponsors for my events?",
        answer:
          "Our sponsor matching system connects event organizers with potential sponsors based on event type, audience, and sponsor preferences. Create compelling sponsorship packages and track sponsor engagement through our analytics dashboard.",
        tags: ["sponsors", "funding", "partnerships"],
      },
    ],
  },
  {
    category: "Technical Support",
    questions: [
      {
        id: "technical-1",
        question: "I'm having trouble uploading photos or videos",
        answer:
          "Ensure your files are in supported formats (JPG, PNG for photos; MP4, MOV for videos) and under our size limits (10MB for photos, 100MB for videos). Clear your browser cache and try again. If issues persist, contact our technical support team.",
        tags: ["upload", "technical", "media"],
      },
      {
        id: "technical-2",
        question: "How do I reset my password?",
        answer:
          "Click 'Forgot Password' on the login page, enter your email address, and check your inbox for reset instructions. If you don't receive the email within 10 minutes, check your spam folder or contact support.",
        tags: ["password", "reset", "login"],
        hasVideo: true,
        videoId: "E-YsF2A8Xu4",
      },
      {
        id: "technical-3",
        question: "Is my personal information secure?",
        answer:
          "We use industry-standard encryption and security measures to protect your data. Your personal information is never shared without your consent, and you have full control over your privacy settings.",
        tags: ["security", "privacy", "data"],
      },
    ],
  },
  {
    category: "AI Chess Premium",
    questions: [
      {
        id: "aichess-1",
        question: "AI Chess Premium FAQ – How to Analyze & Improve Your Games Instantly!",
        answer:
          "AI Chess Premium provides advanced game analysis, move suggestions, and strategy improvement tips. Watch our video to see how you can start analyzing and improving your games instantly.",
        tags: ["ai", "chess", "premium", "analysis", "improvement"],
        hasVideo: true,
        videoId: "LeUcdOWr3TU",
      },
      {
        id: "aichess-2",
        question: "Why Chess Players Need This URL Scraper",
        answer:
          "Discover how chess players can leverage our URL scraper to gather game data, analyze positions, and enhance their training. Watch the video to see it in action.",
        tags: ["chess", "url", "scraper", "tools", "data"],
        hasVideo: true,
        videoId: "Wj26bKGLMTc",
      },
      {
        id: "aichess-3",
        question: "Wrong PGN? Fix It Instantly with PGN Editor",
        answer:
          "Made a mistake in your PGN file? Our PGN Editor lets you fix errors instantly — edit moves, correct annotations, and clean up game data with ease. Watch the video to see how simple it is.",
        tags: ["chess", "pgn", "editor", "fix", "tools"],
        hasVideo: true,
        videoId: "eWwusKBwLqs",
      },
    ],
  },
  {
    category: "Pricing",
    questions: [
      {
        id: "pricing-1",
        question: "What is included in the Premium plan?",
        answer: "Premium includes everything in Basic (Tick For Verified Profile and Access to Sponsorship Program) plus: Generate PGN with Scoresheet/Game Video, Download PGN File, AI Based Game Analysis, and Stockfish Analysis.",
        tags: ["premium", "plan", "features"],
      },
      {
        id: "pricing-2",
        question: "Is the pricing monthly or yearly?",
        answer: "Basic is billed annually only, so you see the annual price directly. Premium can be billed monthly or yearly, and the yearly option saves 20% compared to paying month by month.",
        tags: ["pricing", "billing", "monthly", "yearly"],
      },
      {
        id: "pricing-3",
        question: "Can I cancel anytime?",
        answer: "Yes. You can cancel anytime. If you cancel before your trial ends, you won’t be charged. If you’re already on a paid plan, you keep access until the end of your current billing period.",
        tags: ["cancel", "subscription", "trial"],
      },
      {
        id: "pricing-4",
        question: "Is there a free trial or refund policy?",
        answer: "Yes—start with a 7-day free trial. No payment is due today. You can cancel anytime. If you have questions about refunds after a payment has been processed, contact support and we’ll help you.",
        tags: ["trial", "refund", "policy"],
      },
      {
        id: "pricing-5",
        question: "What happens if I upgrade or downgrade?",
        answer: "You can switch plans from your account settings. Upgrades take effect immediately (you get access to Premium features right away). Downgrades apply at the end of your current billing period so you don’t lose access early.",
        tags: ["upgrade", "downgrade", "plans"],
      },
      {
        id: "pricing-6",
        question: "Are there any hidden charges?",
        answer: "No. There are no setup fees or hidden charges. Taxes may apply depending on your country—if so, they’ll be clearly shown at checkout before you confirm payment.",
        tags: ["charges", "fees", "taxes"],
      },
      {
        id: "pricing-7",
        question: "Is support included in all plans?",
        answer: "Yes. Support is included in all plans. You can reach us through in-app or email support, and we’ll respond as quickly as possible.",
        tags: ["support", "plans", "help"],
      },
      {
        id: "pricing-8",
        question: "Is my payment secure?",
        answer: "Yes. Payments are handled through secure, PCI-compliant providers. We don’t store your full card details, and transactions are protected with industry-standard encryption.",
        tags: ["payment", "secure", "security"],
      },
    ],
  },
];

/** A category's anchor on the page: "AI Chess Premium" → "ai-chess-premium". */
export function categoryId(category: string) {
  return category.toLowerCase().replace(/\s+/g, "-");
}

/** Every entry's id, for telling a deep link to an entry from any other hash. */
export const FAQ_ENTRY_IDS: ReadonlySet<string> = new Set(
  FAQ_CATEGORIES.flatMap((category) => category.questions.map((entry) => entry.id)),
);
