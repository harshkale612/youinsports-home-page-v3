"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Container, SectionLabel, DisplayText, BodyText, DemoBadge } from "@/components/ui/Primitives";
import { AthleteAvatar } from "@/components/athlete/AthleteAvatar";
import { ATHLETES } from "@/data/athletes";
import { SPORTS, getSportConfig } from "@/data/sports";
import { getCountry } from "@/data/countries";
import { getLevelConfig, LEVELS } from "@/data/levels";
import type { Level, Sport } from "@/types/network";

type SortKey = "rating" | "name" | "country";

export function AthleteDirectory() {
  const [sport, setSport] = useState<Sport | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [sort, setSort] = useState<SortKey>("rating");
  const [query, setQuery] = useState("");

  const athletes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ATHLETES.filter((athlete) => {
      if (sport && athlete.sport !== sport) return false;
      if (level && athlete.level !== level) return false;
      if (!needle) return true;
      return (
        athlete.name.toLowerCase().includes(needle) ||
        athlete.city.toLowerCase().includes(needle) ||
        athlete.discipline.toLowerCase().includes(needle) ||
        getCountry(athlete.countryCode).name.toLowerCase().includes(needle)
      );
    }).sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "country") {
        return getCountry(a.countryCode).name.localeCompare(getCountry(b.countryCode).name);
      }
      return b.rating - a.rating;
    });
  }, [sport, level, sort, query]);

  return (
    <Container className="pb-24">
      <SectionLabel>Athlete directory</SectionLabel>
      <DisplayText as="h1" size="lg" className="mt-6">
        Explore athletes.
      </DisplayText>
      <BodyText className="mt-5 max-w-xl">
        Every athlete on the globe, as a searchable list. Filter by sport, level or
        location.
      </BodyText>
      <DemoBadge className="mt-5" />

      <div className="mt-12 flex flex-col gap-5 border-y border-white/[0.08] py-6">
        <label className="flex items-center gap-3">
          <span className="sr-only">Search athletes</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Search by name, city, country or discipline"
            className="w-full max-w-md rounded-full border border-white/12 bg-white/[0.03] px-5 py-2.5 text-sm text-fg outline-none transition-colors placeholder:text-faint focus:border-accent/70"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <FilterChip active={sport === null} onClick={() => setSport(null)}>
            All sports
          </FilterChip>
          {SPORTS.map((item) => (
            <FilterChip
              key={item.id}
              active={sport === item.id}
              onClick={() => setSport(sport === item.id ? null : item.id)}
            >
              {item.label}
            </FilterChip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterChip active={level === null} onClick={() => setLevel(null)}>
            All levels
          </FilterChip>
          {LEVELS.map((item) => (
            <FilterChip
              key={item.id}
              active={level === item.id}
              onClick={() => setLevel(level === item.id ? null : item.id)}
            >
              {item.label}
            </FilterChip>
          ))}

          <label className="ml-auto flex items-center gap-2">
            <span className="font-display text-[0.58rem] font-semibold tracking-[0.18em] text-faint uppercase">
              Sort
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-full border border-white/12 bg-surface px-3 py-1.5 text-[0.78rem] text-fg outline-none focus:border-accent/70"
            >
              <option value="rating">Rating</option>
              <option value="name">Name</option>
              <option value="country">Country</option>
            </select>
          </label>
        </div>
      </div>

      <p aria-live="polite" className="mt-6 text-[0.82rem] text-faint">
        {athletes.length} {athletes.length === 1 ? "athlete" : "athletes"}
      </p>

      {athletes.length === 0 ? (
        <p className="mt-16 text-center text-sm text-muted">
          No athletes match those filters.
        </p>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {athletes.map((athlete) => {
            const country = getCountry(athlete.countryCode);
            return (
              <li key={athlete.id}>
                <article className="flex h-full gap-4 rounded-2xl border border-white/10 bg-[rgba(6,22,34,0.6)] p-5 transition-colors hover:border-white/25">
                  <AthleteAvatar athlete={athlete} size={52} />
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-[0.98rem] leading-tight font-semibold tracking-tight text-fg">
                      {athlete.name}
                    </h2>
                    <p className="mt-0.5 text-[0.82rem] text-muted">{athlete.discipline}</p>
                    <p className="text-[0.8rem] text-faint">
                      <span aria-hidden>{country.flag}</span> {athlete.city}, {country.name}
                    </p>
                    <p className="mt-3 flex items-center gap-2 text-[0.72rem]">
                      <span className="rounded-full border border-white/10 px-2 py-0.5 font-display text-[0.55rem] font-semibold tracking-[0.14em] text-muted uppercase">
                        {getSportConfig(athlete.sport).label}
                      </span>
                      <span className="rounded-full border border-accent/30 bg-accent-soft px-2 py-0.5 font-display text-[0.55rem] font-semibold tracking-[0.14em] text-accent uppercase">
                        {getLevelConfig(athlete.level).label}
                      </span>
                      <span className="tabular ml-auto font-display text-sm font-semibold text-fg">
                        {athlete.rating}
                      </span>
                    </p>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-14 text-[0.85rem] text-muted">
        <Link href="/" className="text-accent underline-offset-4 hover:underline">
          Back to the globe
        </Link>{" "}
        to explore these athletes in place.
      </p>
    </Container>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3.5 py-1.5 font-display text-[0.62rem] font-semibold tracking-[0.14em] uppercase transition-colors",
        active
          ? "border-accent bg-accent text-white"
          : "border-white/12 text-muted hover:border-white/30 hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
