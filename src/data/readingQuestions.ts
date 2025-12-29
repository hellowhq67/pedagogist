export type ReadingTestType = 
  | "mc-single"
  | "mc-multiple"
  | "reorder-paragraphs"
  | "fill-blanks-drag"
  | "fill-blanks-dropdown";

export interface ReadingQuestion {
  id: string;
  type: ReadingTestType;
  title: string;
  instruction: string;
  difficulty: "easy" | "medium" | "hard";
  content: {
    passage?: string;
    question?: string;
    options?: { id: string; text: string }[];
    correctAnswers?: string[]; // For MC
    paragraphs?: { id: string; text: string }[]; // For reorder
    correctOrder?: string[]; // For reorder
    blanks?: { id: string; position: number; correctAnswer: string; options?: string[] }[]; // For fill in blanks
  };
  timeLimit: number; // in seconds
}

export const readingQuestions: ReadingQuestion[] = [
  // MC Single Answer
  {
    id: "mc-single-1",
    type: "mc-single",
    title: "Climate Change Impact",
    instruction: "Read the passage and answer the multiple-choice question below by selecting the best answer.",
    difficulty: "medium",
    content: {
      passage: `Climate change is one of the most pressing challenges facing our planet today. The Earth's average temperature has risen significantly over the past century, primarily due to the burning of fossil fuels and deforestation. This warming has led to a cascade of effects including melting ice caps, rising sea levels, and increasingly severe weather events.

Scientists have observed that the Arctic is warming at twice the rate of the global average. This rapid change is affecting wildlife, particularly polar bears who rely on sea ice for hunting. As ice melts earlier each year, these animals face longer fasting periods, leading to declining populations in some regions.

The impacts of climate change extend beyond environmental concerns. Agricultural patterns are shifting, threatening food security in many regions. Coastal communities face existential threats from rising seas, and extreme weather events are becoming more frequent and destructive. Addressing these challenges requires coordinated global action and a transition to sustainable energy sources.`,
      question: "According to the passage, what is the primary cause of the Earth's rising temperature?",
      options: [
        { id: "a", text: "Natural climate cycles" },
        { id: "b", text: "Burning of fossil fuels and deforestation" },
        { id: "c", text: "Solar activity increases" },
        { id: "d", text: "Ocean current changes" }
      ],
      correctAnswers: ["b"]
    },
    timeLimit: 120
  },
  {
    id: "mc-single-2",
    type: "mc-single",
    title: "Digital Revolution",
    instruction: "Read the passage and answer the multiple-choice question below by selecting the best answer.",
    difficulty: "easy",
    content: {
      passage: `The digital revolution has transformed nearly every aspect of modern life. From the way we communicate to how we work and entertain ourselves, digital technology has become ubiquitous. Smartphones, which were once considered luxury items, are now essential tools for billions of people worldwide.

This transformation has brought numerous benefits, including instant access to information, the ability to connect with people across the globe, and new forms of entertainment and education. Online learning platforms have democratized education, making knowledge accessible to anyone with an internet connection.

However, the digital age also presents challenges. Privacy concerns have grown as personal data becomes increasingly valuable. Digital addiction, particularly among young people, has emerged as a significant social issue. Additionally, the rapid pace of technological change has created a digital divide between those who can adapt and those who are left behind.`,
      question: "What does the passage identify as a key benefit of the digital revolution?",
      options: [
        { id: "a", text: "Increased privacy protection" },
        { id: "b", text: "Reduced screen time for young people" },
        { id: "c", text: "Democratized access to education" },
        { id: "d", text: "Slower pace of technological change" }
      ],
      correctAnswers: ["c"]
    },
    timeLimit: 120
  },
  {
    id: "mc-single-3",
    type: "mc-single",
    title: "Ancient Civilizations",
    instruction: "Read the passage and answer the multiple-choice question below by selecting the best answer.",
    difficulty: "hard",
    content: {
      passage: `The ancient Maya civilization, which flourished in Mesoamerica from approximately 2000 BCE to 1500 CE, developed one of the most sophisticated writing systems in the pre-Columbian Americas. Their hieroglyphic script consisted of over 800 distinct signs, combining logograms (word signs) with syllabic elements to create a flexible and expressive writing system.

Maya scribes, who held elite status in their society, recorded historical events, astronomical observations, and religious texts on stone monuments, pottery, and bark paper books known as codices. Unfortunately, most of these codices were destroyed during the Spanish conquest, leaving only four surviving examples that provide invaluable insights into Maya thought and culture.

Recent advances in the decipherment of Maya script have revealed the complexity of their political history, including detailed records of warfare, alliances, and royal dynasties. These discoveries have transformed our understanding of Maya civilization, showing it to be far more politically complex and historically aware than previously believed.`,
      question: "What was the primary contribution of Maya scribes to their civilization?",
      options: [
        { id: "a", text: "They developed agricultural techniques" },
        { id: "b", text: "They recorded historical events and astronomical observations" },
        { id: "c", text: "They led military campaigns" },
        { id: "d", text: "They governed city-states" }
      ],
      correctAnswers: ["b"]
    },
    timeLimit: 150
  },

  // MC Multiple Answers
  {
    id: "mc-multiple-1",
    type: "mc-multiple",
    title: "Renewable Energy Sources",
    instruction: "Read the passage and select ALL the correct answers. More than one response is correct.",
    difficulty: "medium",
    content: {
      passage: `Renewable energy sources are becoming increasingly important as the world seeks to reduce its dependence on fossil fuels. Solar power has seen dramatic cost reductions over the past decade, making it competitive with traditional energy sources in many markets. Wind energy, both onshore and offshore, has also grown significantly, with turbines becoming larger and more efficient.

Hydroelectric power remains the largest source of renewable electricity globally, though its growth is limited by the availability of suitable sites. Geothermal energy, which harnesses heat from the Earth's interior, provides reliable baseload power in regions with favorable geological conditions. Biomass and biofuels offer renewable alternatives for heating and transportation, though they raise questions about land use and food security.

The transition to renewable energy faces several challenges including intermittency, storage limitations, and the need for grid modernization. However, advances in battery technology and smart grid systems are helping to address these issues, making a fully renewable energy future increasingly feasible.`,
      question: "According to the passage, which of the following are challenges facing renewable energy transition?",
      options: [
        { id: "a", text: "Intermittency of power generation" },
        { id: "b", text: "High cost of solar panels" },
        { id: "c", text: "Storage limitations" },
        { id: "d", text: "Need for grid modernization" },
        { id: "e", text: "Lack of public interest" }
      ],
      correctAnswers: ["a", "c", "d"]
    },
    timeLimit: 150
  },
  {
    id: "mc-multiple-2",
    type: "mc-multiple",
    title: "Urban Development",
    instruction: "Read the passage and select ALL the correct answers. More than one response is correct.",
    difficulty: "easy",
    content: {
      passage: `Urban planning has evolved significantly over the past century, moving from a focus on automobile-centric development to more sustainable, human-centered approaches. Modern urban planners increasingly prioritize walkability, public transit, and mixed-use development to create vibrant, livable communities.

Green spaces play a crucial role in contemporary urban design. Parks, urban forests, and green corridors provide recreational opportunities, improve air quality, reduce urban heat islands, and support biodiversity. Many cities are now incorporating green infrastructure into their planning, including green roofs, rain gardens, and permeable pavements.

Affordable housing remains a persistent challenge in growing cities worldwide. Rising property values often displace long-term residents, threatening community cohesion and cultural diversity. Planners are exploring various solutions including inclusionary zoning, community land trusts, and public-private partnerships to ensure that cities remain accessible to people of all income levels.`,
      question: "According to the passage, what benefits do green spaces provide in urban areas?",
      options: [
        { id: "a", text: "Recreational opportunities" },
        { id: "b", text: "Improved air quality" },
        { id: "c", text: "Lower property values" },
        { id: "d", text: "Reduced urban heat islands" },
        { id: "e", text: "Support for biodiversity" }
      ],
      correctAnswers: ["a", "b", "d", "e"]
    },
    timeLimit: 150
  },

  // Reorder Paragraphs
  {
    id: "reorder-1",
    type: "reorder-paragraphs",
    title: "Scientific Method",
    instruction: "The text boxes below have been placed in random order. Restore the original order by dragging the text boxes to their correct positions.",
    difficulty: "medium",
    content: {
      paragraphs: [
        { id: "p1", text: "The scientific method begins with observation of natural phenomena that spark curiosity and questions about how the world works." },
        { id: "p2", text: "Based on these observations, scientists formulate hypotheses—testable explanations for what they have observed." },
        { id: "p3", text: "Experiments are then designed to test these hypotheses under controlled conditions, allowing researchers to isolate specific variables." },
        { id: "p4", text: "The results of these experiments are carefully analyzed to determine whether they support or refute the original hypothesis." },
        { id: "p5", text: "Finally, conclusions are drawn and shared with the scientific community, where they are subjected to peer review and further testing." }
      ],
      correctOrder: ["p1", "p2", "p3", "p4", "p5"]
    },
    timeLimit: 180
  },
  {
    id: "reorder-2",
    type: "reorder-paragraphs",
    title: "Coffee Production",
    instruction: "The text boxes below have been placed in random order. Restore the original order by dragging the text boxes to their correct positions.",
    difficulty: "hard",
    content: {
      paragraphs: [
        { id: "p1", text: "Coffee cultivation begins in nurseries where seeds are planted in shaded beds and carefully tended for several months." },
        { id: "p2", text: "Once seedlings are strong enough, they are transplanted to the field where they will grow for three to four years before producing their first harvest." },
        { id: "p3", text: "Coffee cherries are typically harvested by hand, with pickers selecting only the ripest red cherries to ensure quality." },
        { id: "p4", text: "After harvesting, the cherries undergo processing to remove the fruit and extract the green coffee beans inside." },
        { id: "p5", text: "The green beans are then roasted at high temperatures, a process that develops the complex flavors and aromas we associate with coffee." }
      ],
      correctOrder: ["p1", "p2", "p3", "p4", "p5"]
    },
    timeLimit: 180
  },

  // Fill in the Blanks (Drag & Drop)
  {
    id: "fill-drag-1",
    type: "fill-blanks-drag",
    title: "Ocean Ecosystems",
    instruction: "Below is a text with blanks. Drag words from the box below to fill in the blanks.",
    difficulty: "medium",
    content: {
      passage: `The ocean covers more than 70% of Earth's surface and contains a vast array of [BLANK1]. From the sunlit surface waters to the dark abyssal depths, marine environments support life forms ranging from microscopic [BLANK2] to the largest animals ever to exist on Earth.

Coral reefs, often called the rainforests of the sea, are among the most [BLANK3] ecosystems on the planet. Despite covering less than 1% of the ocean floor, they support approximately 25% of all marine species. These delicate ecosystems face numerous [BLANK4] including ocean acidification, rising temperatures, and pollution.

The health of ocean ecosystems is crucial for human [BLANK5]. Oceans regulate climate, produce oxygen, and provide food and livelihoods for billions of people. Protecting marine environments requires international cooperation and sustainable management practices.`,
      blanks: [
        { id: "b1", position: 1, correctAnswer: "ecosystems", options: ["ecosystems", "buildings", "vehicles", "computers"] },
        { id: "b2", position: 2, correctAnswer: "plankton", options: ["plankton", "mammals", "birds", "insects"] },
        { id: "b3", position: 3, correctAnswer: "biodiverse", options: ["biodiverse", "simple", "empty", "artificial"] },
        { id: "b4", position: 4, correctAnswer: "threats", options: ["threats", "benefits", "supporters", "admirers"] },
        { id: "b5", position: 5, correctAnswer: "survival", options: ["survival", "entertainment", "decoration", "confusion"] }
      ]
    },
    timeLimit: 180
  },
  {
    id: "fill-drag-2",
    type: "fill-blanks-drag",
    title: "Space Exploration",
    instruction: "Below is a text with blanks. Drag words from the box below to fill in the blanks.",
    difficulty: "easy",
    content: {
      passage: `Space exploration has captured human [BLANK1] for centuries. From ancient astronomers who mapped the stars to modern missions that have landed rovers on Mars, our quest to understand the cosmos continues to [BLANK2].

The International Space Station represents one of humanity's greatest [BLANK3] achievements. Orbiting Earth at approximately 400 kilometers altitude, it serves as a laboratory for scientific research in microgravity conditions. Astronauts from multiple [BLANK4] work together on experiments that could not be conducted on Earth.

Looking to the future, space agencies and private companies are developing plans for human missions to Mars and beyond. These ambitious [BLANK5] will require new technologies and international cooperation on an unprecedented scale.`,
      blanks: [
        { id: "b1", position: 1, correctAnswer: "imagination", options: ["imagination", "confusion", "boredom", "anger"] },
        { id: "b2", position: 2, correctAnswer: "expand", options: ["expand", "shrink", "disappear", "freeze"] },
        { id: "b3", position: 3, correctAnswer: "collaborative", options: ["collaborative", "individual", "competitive", "isolated"] },
        { id: "b4", position: 4, correctAnswer: "countries", options: ["countries", "planets", "galaxies", "species"] },
        { id: "b5", position: 5, correctAnswer: "endeavors", options: ["endeavors", "failures", "retreats", "conflicts"] }
      ]
    },
    timeLimit: 180
  },

  // Fill in the Blanks (Dropdown)
  {
    id: "fill-dropdown-1",
    type: "fill-blanks-dropdown",
    title: "Artificial Intelligence",
    instruction: "Read the text and select the appropriate word from each dropdown to complete the passage.",
    difficulty: "hard",
    content: {
      passage: `Artificial intelligence (AI) has made remarkable [BLANK1] in recent years, transforming industries from healthcare to transportation. Machine learning algorithms can now [BLANK2] patterns in data that would be impossible for humans to detect, leading to breakthroughs in medical diagnosis and drug discovery.

However, the rapid advancement of AI also raises important [BLANK3] questions. As AI systems become more autonomous, questions of accountability and transparency become increasingly [BLANK4]. Who is responsible when an AI makes a harmful decision? How can we ensure that AI systems are fair and unbiased?

Researchers and policymakers are working to develop frameworks that promote [BLANK5] AI development while still allowing for innovation. The goal is to harness the benefits of AI while minimizing potential risks to society.`,
      blanks: [
        { id: "b1", position: 1, correctAnswer: "progress", options: ["progress", "regression", "stagnation", "confusion"] },
        { id: "b2", position: 2, correctAnswer: "identify", options: ["identify", "ignore", "hide", "destroy"] },
        { id: "b3", position: 3, correctAnswer: "ethical", options: ["ethical", "mathematical", "physical", "musical"] },
        { id: "b4", position: 4, correctAnswer: "pressing", options: ["pressing", "trivial", "irrelevant", "amusing"] },
        { id: "b5", position: 5, correctAnswer: "responsible", options: ["responsible", "reckless", "harmful", "chaotic"] }
      ]
    },
    timeLimit: 180
  },
  {
    id: "fill-dropdown-2",
    type: "fill-blanks-dropdown",
    title: "Human Memory",
    instruction: "Read the text and select the appropriate word from each dropdown to complete the passage.",
    difficulty: "medium",
    content: {
      passage: `Human memory is a complex cognitive [BLANK1] that allows us to encode, store, and retrieve information. Scientists distinguish between several types of memory, including short-term memory, which holds information for brief periods, and long-term memory, which can [BLANK2] information for a lifetime.

The process of forming long-term memories involves a brain structure called the hippocampus. During sleep, the brain [BLANK3] memories, transferring important information from short-term to long-term storage. This is why adequate sleep is [BLANK4] for learning and memory.

Memory is not a perfect recording of past events. Each time we recall a memory, we [BLANK5] it slightly, which is why eyewitness testimony can be unreliable. Understanding how memory works has important implications for education, law, and mental health.`,
      blanks: [
        { id: "b1", position: 1, correctAnswer: "process", options: ["process", "disease", "muscle", "organ"] },
        { id: "b2", position: 2, correctAnswer: "retain", options: ["retain", "forget", "reject", "destroy"] },
        { id: "b3", position: 3, correctAnswer: "consolidates", options: ["consolidates", "erases", "confuses", "ignores"] },
        { id: "b4", position: 4, correctAnswer: "essential", options: ["essential", "harmful", "irrelevant", "dangerous"] },
        { id: "b5", position: 5, correctAnswer: "reconstruct", options: ["reconstruct", "perfect", "freeze", "delete"] }
      ]
    },
    timeLimit: 180
  }
];

export function getReadingQuestionsByType(type: ReadingTestType): ReadingQuestion[] {
  return readingQuestions.filter(q => q.type === type);
}

export function getReadingTestTypeInfo(type: ReadingTestType): { name: string; description: string; icon: string } {
  const info: Record<ReadingTestType, { name: string; description: string; icon: string }> = {
    "mc-single": {
      name: "MC Single Answer",
      description: "Select the single best answer from multiple options",
      icon: "🔘"
    },
    "mc-multiple": {
      name: "MC Multiple Answers",
      description: "Select all correct answers from multiple options",
      icon: "☑️"
    },
    "reorder-paragraphs": {
      name: "Re-order Paragraphs",
      description: "Arrange paragraphs in the correct order",
      icon: "📝"
    },
    "fill-blanks-drag": {
      name: "Fill in Blanks (Drag & Drop)",
      description: "Drag words to complete the passage",
      icon: "🎯"
    },
    "fill-blanks-dropdown": {
      name: "Fill in Blanks (Dropdown)",
      description: "Select words from dropdowns to complete the passage",
      icon: "📋"
    }
  };
  return info[type];
}
