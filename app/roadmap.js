// The platinum roadmap for Leonida Legend (this guide's app): six stages, in the order a first
// playthrough should meet them, derived from the official trophy descriptions and the counts
// PlayStation tracks. Each stage lists the trophies it covers by id (see data/trophies.json),
// why it sits where it does, and the warnings that belong to it. The two rules that shape the
// whole route: nothing in the list is online, and only one trophy is reported missable, the
// Chapter 1 meditation inside Positive Mental Attitude, so the story can be played in order
// without a guide open, as long as that one moment is caught.

export const ROADMAP = [
  {
    stage: 1,
    title: 'The story, first pass: Chapters 1 to 4',
    hours: 'Story arc, part one',
    summary:
      'Play the campaign in order and let the story trophies fall. Two habits start here and pay for the whole run: scan every new vehicle and meditate at every new spot as you travel, and keep a manual save before each chapter ends, because early guides report no mission replay.',
    warnings: [
      'MISSABLE: in Chapter 1, after Down to Earth, take the optional meditation at Jason\u2019s house when Lucia offers it. It is gone after Chapter 1 (Positive Mental Attitude).',
      'Leave cheats off: launch-week guides report they disable trophies and saving.',
    ],
    trophyIds: [2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 28],
  },
  {
    stage: 2,
    title: 'The finale and the stranger strands',
    hours: 'Story arc, part two',
    summary:
      'Finish the final mission for the hidden gold, then work the stranger strands: the five named chains (Andy, Kenton, Billy, Randy, Tyrone) each hide a trophy, eight strands in total earn Strangers & Freaks, and Bret\u2019s hunt belongs with them. The chains are reported to run on story-progress windows, so they are placed before deep cleanup rather than after it.',
    warnings: [
      'The five strand chains are flagged time-sensitive: advance them alongside the story, not after everything else.',
    ],
    trophyIds: [7, 22, 23, 24, 25, 26, 27, 29],
  },
  {
    stage: 3,
    title: 'Collectibles and the map',
    hours: 'The sweep',
    summary:
      'The counters that reward coverage: three card sets, 100 WAiNK locations, 100 discovered vehicles and all 52 areas of Leonida. Whatever the story habits already banked counts, so this stage is a region-by-region sweep for what is left, not a fresh grind.',
    warnings: ['You WAiNKer! and Whip It Good are far cheaper when scanned as you travel; the tracker counters show what the habit already earned.'],
    trophyIds: [30, 31, 35, 42],
  },
  {
    stage: 4,
    title: 'Activities and medals',
    hours: 'The scoreboard',
    summary:
      'The skill counters: gold in all 42 shooting-range challenges, 250 stunts, a drone-race win at all 14 locations, 20 different race wins, 50 challenges, plus the one-offs (Cal at fishing, one arcade game, the bowling alley). Several of these feed the 100% checklist at higher thresholds, so this stage is shared work, not extra work.',
    warnings: ['Cunning Stunts pops at 250, but 100% counts 300: do not stop at the trophy.'],
    trophyIds: [15, 16, 17, 18, 19, 20, 21, 32, 46],
  },
  {
    stage: 5,
    title: 'Free-roam feats and the economy',
    hours: 'Cleanup, part one',
    summary:
      'Everything that free roam can arrange on demand: the partner escapes, the robbery set (jewelry store, five bank vaults, an armored truck, one operation per gang), the two hidden set pieces at VCIA and the air station, the Ocean Beach cocktail, the showroom exit, the UFO encounter, and the money counters (laundering, spending, garages, Scooter Bros). None of it needs the story, so all of it can wait until here.',
    warnings: ['The Truth Is Out There is not in the in-game 100% checklist: the game will never remind you. It is in this roadmap so it is not forgotten.'],
    trophyIds: [33, 34, 36, 37, 38, 39, 40, 41, 43, 44, 45, 47, 48, 49, 50, 51, 52, 53, 54, 55],
  },
  {
    stage: 6,
    title: '100% and the platinum',
    hours: 'The last two trophies',
    summary:
      'Close out A Long Road against the in-game checklist (Progress, then Stats, then 100% Completion): 200 vehicles scanned, 100 animals studied, 70 challenges, 300 stunts, 42 range golds, 30 unique race wins, 10 race-challenge golds, 15 meditations. The moment the other 54 are earned, Vice Got a Price! completes the list. Launch-week estimates put the full platinum near 200 hours, most of it here and in stage 3.',
    warnings: ['100% is not the platinum: the stranger strands and the UFO sit outside the checklist and must be checked off separately, as this tracker does.'],
    trophyIds: [14, 1],
  },
];

export function stageOf(trophy) {
  return ROADMAP.find((s) => s.stage === trophy.stage) ?? ROADMAP[0];
}
