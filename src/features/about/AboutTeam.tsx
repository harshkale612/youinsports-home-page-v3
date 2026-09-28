"use client";

import { motion } from "motion/react";
import { Container, SectionLabel, DisplayText, BodyText } from "@/components/ui/Primitives";
import { TeamMemberCard } from "@/features/about/TeamMemberCard";
import { TEAM } from "@/data/team";

const ease = [0.16, 1, 0.3, 1] as const;

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-12% 0px" },
};

/**
 * The people behind it, as a roster.
 *
 * Cards rise in row by row as they reach the screen — staggered across the
 * row, not down the whole list, so the second row doesn't wait on the first.
 */
export function AboutTeam() {
  return (
    <section
      id="team"
      aria-labelledby="team-heading"
      className="relative scroll-mt-20 py-[var(--section-y)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-[55%] left-1/2 h-[70%] w-[110%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(240_107_40/0.08),transparent)]"
      />

      <Container className="relative">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
          <div className="max-w-2xl">
            <SectionLabel index="02">Our team</SectionLabel>
            <motion.div {...reveal} transition={{ duration: 0.8, ease }}>
              <DisplayText id="team-heading" as="h2" className="mt-7">
                The team making <span className="text-brand">dreams</span> happen
                <span className="text-accent">.</span>
              </DisplayText>
            </motion.div>
          </div>

          <motion.div {...reveal} transition={{ duration: 0.8, ease, delay: 0.1 }}>
            <BodyText className="max-w-md text-base lg:pb-2">
              Engineers, QA specialists and marketers — one team, building the network every
              amateur athlete deserves.
            </BodyText>
          </motion.div>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {TEAM.map((member, i) => (
            <motion.li
              key={member.id}
              initial={{ opacity: 0, y: 56, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.9, ease, delay: (i % 4) * 0.09 }}
            >
              <TeamMemberCard member={member} index={i} />
            </motion.li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
