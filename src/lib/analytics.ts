export type AnalyticsEvent =
  | "homepage_viewed"
  | "journey_started"
  | "name_completed"
  | "sport_selected"
  | "level_selected"
  | "goal_selected"
  | "snapshot_viewed"
  | "next_level_viewed"
  | "feature_viewed"
  | "dashboard_entered"
  | "career_analysis_started"
  | "career_analysis_completed"
  | "join_clicked"
  | "demo_mode_started"
  // Global athlete network experience
  | "search_opened"
  | "search_result_selected"
  | "athlete_marker_selected"
  | "athlete_card_opened"
  | "sport_filter_changed"
  | "ranking_tier_selected"
  | "opportunity_viewed"
  | "explore_athletes_clicked"
  | "globe_dragged"
  | "sport_explored"
  // Interactive athlete journey (homepage)
  | "journey_question_answered"
  | "journey_questions_completed"
  | "journey_position_viewed"
  | "journey_gap_viewed"
  | "journey_focus_selected"
  | "journey_opportunity_viewed"
  | "journey_signup_submitted"
  | "journey_saved"
  | "journey_reset"
  | "demo_persona_loaded"
  // About page
  | "about_viewed"
  | "about_cta_clicked"
  // Coming-soon pages
  | "coming_soon_viewed"
  | "coming_soon_cta_clicked"
  // Products page
  | "products_viewed"
  | "pricing_cta_clicked"
  // Contact page
  | "contact_viewed"
  | "contact_email_copied"
  | "contact_message_composed"
  | "contact_cta_clicked"
  // FAQ page
  | "faq_viewed"
  | "faq_question_opened"
  | "faq_cta_clicked"
  | "faq_searched"
  | "faq_topic_selected"
  | "faq_link_copied";

/**
 * Dev-mode logging today; swap the body for a PostHog/Segment call later
 * without touching call sites.
 */
export function trackEvent(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[analytics] ${event}`, properties ?? {});
  }
}
