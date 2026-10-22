export type PdfParagraph = { id: string; text: string }
export type PdfPage = { page: number; paragraphs: PdfParagraph[] }

export const PDF = {
  file: 'Bjork & Bjork 2011.pdf',
  title: 'Desirable Difficulties in Learning and Instruction',
  pages: [
    {
      page: 1,
      paragraphs: [
        {
          id: 'p1',
          text: 'Conditions of learning that make performance improve rapidly often fail to support long-term retention and transfer, whereas conditions that create challenges and slow the rate of apparent learning often optimize long-term retention.',
        },
        {
          id: 'p2',
          text: 'This paradox is not a curiosity of the laboratory. It reappears whenever instruction is designed around visible progress: massed practice, blocked sequences, and continuous reading all feel productive while producing relatively little durable learning.',
        },
        {
          id: 'p3',
          text: 'We use the term desirable difficulty for manipulations that increase the effort of retrieval or encoding and, by doing so, increase the durability of what is learned. The difficulty must be desirable: it must be resolvable by the learner with reasonable effort.',
        },
        {
          id: 'p4',
          text: 'The studies reviewed here vary spacing, interleaving, testing, and generation. In each case the pattern is the same: the condition that looks worse today produces better performance weeks or months later.',
        },
      ],
    },
    {
      page: 2,
      paragraphs: [
        {
          id: 'p1',
          text: 'Experiment 1 compared four study conditions. Participants read a passage once, read it four times, read it three times and were tested once, or were tested four times without additional reading.',
        },
        {
          id: 'p2',
          text: 'Immediately after study, repeated reading produced the highest recall. One week later the ordering reversed: repeated reading fell to roughly 40 per cent, one test reached 56 per cent, and four tests reached 61 per cent.',
        },
        {
          id: 'p3',
          text: 'The reversal is the finding. Judgements made during study track fluency, not retention, which is why learners systematically choose the condition that helps them least.',
        },
        {
          id: 'p4',
          text: 'Feedback did not remove the effect. When incorrect answers were corrected, the testing advantage persisted and grew for items that had been answered wrongly.',
        },
      ],
    },
    {
      page: 3,
      paragraphs: [
        {
          id: 'p1',
          text: 'If retrieval is itself a learning event, then the unit of instruction is not the exposure but the successful reconstruction of an answer from memory.',
        },
        {
          id: 'p2',
          text: 'This has a direct consequence for note-taking tools: a note that restates the source is an exposure, while a note phrased as a question is a retrieval opportunity. The same paragraph, captured two ways, will be remembered very differently.',
        },
        {
          id: 'p3',
          text: 'Spacing and retrieval interact. The optimal gap is not a fixed interval but a function of the retention interval one is targeting, and it shifts upward as the material becomes better learned.',
        },
        {
          id: 'p4',
          text: 'We therefore recommend that scheduling systems expose the target retention rate rather than hiding it, so that the cost of a higher target is visible to the learner.',
        },
      ],
    },
  ] as PdfPage[],
}
