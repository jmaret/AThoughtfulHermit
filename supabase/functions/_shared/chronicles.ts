/** Server-side catalog — never trust client chronicle body for email content. */
export type Chronicle = {
  id: string;
  title: string;
  series: string;
  excerpts: string[];
};

export const CHRONICLES: Chronicle[] = [
  {
    id: 'geography-distance',
    title: 'The Geography of Distance: On Growing Apart Without Letting Go',
    series: 'Relationship Chronicles 9',
    excerpts: [
      'Relationships are often measured in miles, but they are sustained by something far less visible: shared moments, repeated encounters, and the small accumulations of everyday life.',
      'When distance grows, conversations become less frequent and lives unfold in parallel rather than together. The friendship, once nourished by presence, begins surviving on memory. New habits form. New people arrive. New versions of ourselves emerge.',
      'Is this a failure of connection or simply the natural evolution of human relationships? And when someone who once occupied a central place in our life gradually drifts toward the horizon, are we losing them, or are we discovering that all relationships have seasons?',
    ],
  },
  {
    id: 'peaks-valleys',
    title: 'The Peaks and the Valleys: What the Summit Cannot See',
    series: 'Relationship Chronicles 8',
    excerpts: [
      "When we stand on life's peaks, we often mistake them for the edge of the world.",
      'From the summit, we see the cliffs below and imagine only decline ahead. Success, youth, health, love, accomplishment, certainty; whatever form the peak takes, we become convinced that everything beyond it is loss.',
      'Yet the mountain tells only part of the story.',
      "The descent reveals valleys hidden from the summit's view: streams, forests, wildflowers, unexpected companions, and quieter forms of beauty. What once appeared to be falling becomes wandering. What felt like loss becomes discovery.",
    ],
  },
  {
    id: 'tomorrow-tax',
    title: 'The Tomorrow Tax: Holding the Present Hostage to the Future',
    series: 'Relationship Chronicles 7',
    excerpts: [
      'There is a peculiar bargain many of us make with life.',
      'We postpone joy until the promotion arrives. We delay rest until the crisis passes. We defer contentment until the savings account grows, the relationship stabilizes, the diagnosis clears, or the plan finally works.',
      'The future becomes a creditor, demanding payment from the present.',
      'Yet tomorrow never arrives in the form we imagined. When one uncertainty disappears, another takes its place. The life we were waiting to begin quietly becomes the life we are already living.',
    ],
  },
  {
    id: 'mountain-pebbles',
    title: 'The Mountain and the Pebbles: Solving Life One Piece at a Time',
    series: 'Relationship Chronicles 6',
    excerpts: [
      'Most complex problems are frightening from a distance.',
      'A career crisis. A failing relationship. A business transformation. A health challenge. A life that feels too heavy to carry.',
      'From afar, they appear as mountains. We stare at their size and become overwhelmed before taking a single step.',
      'Yet every mountain is traversed one foothold at a time.',
    ],
  },
  {
    id: 'elastic-hour',
    title: 'The Elastic Hour: On the Illusion of Having Time',
    series: 'Relationship Chronicles 5',
    excerpts: [
      'One person wakes to an empty calendar and feels crushed by an abundance of hours. Another wakes to a schedule so crowded that every minute has a price. Both secretly believe the other possesses what they lack.',
      'Yet time is rarely what it appears to be.',
      'The unemployed worker fills endless days with learning, creating, searching, and striving to make time feel valuable. The overworked professional spends money to reclaim fragments of freedom from a calendar that never stops advancing. Between them lies a shared misunderstanding: time is not simply something we have or lack. Its value shifts with uncertainty, meaning, purpose, and attention.',
    ],
  },
  {
    id: 'borrowed-constellations',
    title: 'Borrowed Constellations: Finding Home Among Fellow Strangers',
    series: 'Relationship Chronicles 4',
    excerpts: [
      'You leave home and discover that belonging does not travel with you.',
      'In a city full of millions, you begin assembling a life from fragments: friends who become siblings, mentors who become parents, strangers who become witnesses. Yet every connection is complicated by uncertainty. You are still becoming yourself. They are becoming themselves. Everyone is carrying unfinished versions of who they are.',
    ],
  },
  {
    id: 'unsent-draft',
    title: 'The Unsent Draft & The Courage of the Unspoken',
    series: 'Relationship Chronicles 3',
    excerpts: [
      'You wrote the perfect message three times, then deleted it because the silence felt more honest than another performance of clarity. Sometimes love is not the paragraph—it is the decision not to audition.',
    ],
  },
  {
    id: 'two-clocks',
    title: 'Two Clocks: The Friction of Urgency and Patience',
    series: 'Relationship Chronicles 2',
    excerpts: [
      'One of you lives in now; the other lives in soon. You keep trying to meet in the hallway between urgency and patience, learning that timing is its own tenderness—and its own friction.',
    ],
  },
  {
    id: 'soft-inventory',
    title: 'The Soft Inventory & The Physics of the Spark',
    series: 'Relationship Chronicles 1',
    excerpts: [
      'We curate quiet mercies for those we love—softening their edges, anticipating their shadows, keeping a tender ledger of their needs. Yet when we look inward, the pen drops. We become the only soul in the room we forget to care for.',
    ],
  },
];

export function findChronicle(id: string): Chronicle | undefined {
  return CHRONICLES.find((item) => item.id === id);
}
