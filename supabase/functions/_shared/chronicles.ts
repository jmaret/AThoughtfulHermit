/** Server-side catalog — never trust client chronicle body for email content. */
export type Chronicle = {
  id: string;
  title: string;
  series: string;
  excerpts: string[];
  newsletterImage?: string;
};

export const CHRONICLES: Chronicle[] = [
  {
    id: 'friday-the-13th',
    title: 'Friday the 13th: The Shadow We Cast Before Ourselves',
    series: 'Relationship Chronicles 10',
    newsletterImage: 'images/newsletter_rc_10.jpg',
    // Newsletter body from sources/friday-the-13th.txt
    excerpts: [
      'Hello friends,',
      'Some fears arrive with obvious causes. A storm gathering on the horizon. A difficult conversation waiting to happen. A genuine uncertainty about the future.',
      'Other fears are more peculiar. They begin not with reality, but with possibility.',
      'A date on the calendar. An unanswered message. A postponed meeting. A quiet room. The mind notices a small uncertainty and begins filling the empty space with stories. Before long, we find ourselves responding not to what is happening, but to what might happen.',
      'Human imagination is one of our greatest gifts. It allows us to plan, prepare, and anticipate. Yet the same faculty that helps us navigate life can sometimes become a remarkably convincing storyteller.',
      'A shadow appears larger in the dark than it does in the light.',
      'Many of the worries that occupy our thoughts are not entirely invented. Loss is possible. Mistakes are possible. Rejection is possible. The future remains uncertain. But possibility is not certainty, and uncertainty is not evidence.',
      'Perhaps wisdom is not learning how to eliminate fear. Perhaps wisdom is learning how to examine it. To ask better questions. To distinguish between what we know and what we imagine. To bring curiosity where we once brought assumption.',
      'The future will always contain unknowns. The challenge is not to make the unknown disappear. The challenge is to meet it without allowing imagination to quietly rewrite reality.',
      'A question to sit with this week: What fear in your life becomes smaller when it is examined closely instead of observed from a distance?',
      'After all, not every shadow conceals a monster. Sometimes it is only a lantern waiting to be understood.',
      'Until next week, A Thoughtful Hermit',
    ],
  },
  {
    id: 'geography-distance',
    title: 'The Geography of Distance: On Growing Apart Without Letting Go',
    series: 'Relationship Chronicles 9',
    newsletterImage: 'images/newsletter_rc_09.jpg',
    // Newsletter body from sources/geography-distance.pdf
    excerpts: [
      'Hello friends,',
      'Most relationships do not end. They recede. Rarely through conflict. Rarely through a dramatic goodbye. More often through miles, obligations, new routines, and lives that gradually unfold in different directions. A friend moves away. A sibling becomes busy raising a family. A colleague changes jobs. The conversations that once happened daily become monthly, then occasional. Somewhere along the way, we begin to wonder: Are we losing each other?',
      'Distance creates a peculiar challenge. Relationships are built not only from affection, but from shared reality. The lunch breaks, the spontaneous phone calls, the small frustrations, and the ordinary moments we rarely think about. When those disappear, connection requires intention in place of proximity.',
      'Yet perhaps growing apart is not always a sign that something has gone wrong. The people we love continue becoming themselves. So do we. The college friend who knew our youthful ambitions carries a version of us that no longer entirely exists. We carry versions of them, too. Time changes us all. The remarkable thing is not that relationships transform, but that they remain meaningful despite the transformation.',
      "This week's reflection is simple: Not every relationship is meant to remain exactly as it was. Some become quieter. Some become less frequent. Some move from daily presence to cherished memory. That does not erase what was real. A friendship that carried you through an important chapter of life does not become less valuable because the chapter ended. Perhaps maturity is learning to hold relationships with open hands. To appreciate what they were, honor what they became, and make peace with what they can no longer be.",
      'A question to sit with this week: Are there relationships you have been grieving for what they no longer are, when perhaps they are simply becoming something different?',
      'After all, every person who truly mattered leaves something behind. And every person who truly mattered takes something with them. Just enough to remind us that, for a little while, our lives were wonderfully intertwined.',
      'Until next week, A Thoughtful Hermit',
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
    newsletterImage: 'images/newsletter_rc_03.jpg',
    // Newsletter body from sources/unsent-draft.txt
    excerpts: [
      'Hello friends,',
      'We live in an age of constant expression. Every thought can be posted, every disagreement can be answered, and every misunderstanding can be met with another carefully crafted explanation. When we feel hurt, misunderstood, or unfairly judged, the impulse is often the same: write the message, make the case, and defend the truth as we see it.',
      'Yet some of the wisest words we ever write are the ones that never leave the page.',
      'Most of us have experienced it. A difficult conversation lingers in the mind long after it ends. We begin drafting the perfect response. We explain our intentions. We assemble evidence. We sharpen our arguments. We search for just the right combination of words that will finally make the other person understand.',
      'Sometimes that effort is necessary.',
      'But sometimes, if we are honest, the draft is not serving understanding. It is serving pride. It is less a bridge to another person and more a monument to our desire to be right.',
      'There is a quiet form of courage in recognizing the difference.',
      'Restraint is often misunderstood as weakness. In reality, it can be one of the strongest choices available to us. To pause before pressing send. To allow another person room to reach their own conclusions. To choose peace over vindication. To let a small error go uncorrected in service of a larger connection.',
      'This is not about silence in the face of injustice, nor about suppressing what genuinely needs to be said. Rather, it is about learning that not every truth requires immediate expression and not every feeling requires an audience.',
      'The unsent draft is not a surrender.',
      'It is a reminder that the health of a relationship is sometimes worth more than the satisfaction of winning a moment.',
      'Some conversations are improved by honesty. Others are improved by grace.',
      'Wisdom lies in knowing the difference.',
      'A question to sit with this week: Is there a message you are still carrying that would bring more peace if released than if delivered?',
      'After all, not every truth must be spoken to be understood. And sometimes the bravest act of communication is choosing not to send the message at all.',
      'Until next week, A Thoughtful Hermit',
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
