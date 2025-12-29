export interface WritingQuestion {
  id: string;
  type: WritingTestType;
  title: string;
  instruction: string;
  timeLimit: number; // seconds
  minWords: number;
  maxWords: number;
  content: WritingQuestionContent;
  difficulty: "easy" | "medium" | "hard";
}

export type WritingTestType =
  | "summarize-written-text"
  | "write-essay"
  | "summarize-written-text-core"
  | "write-email";

interface WritingQuestionContent {
  sourceText?: string;
  essayPrompt?: string;
  emailContext?: string;
  emailTasks?: string[];
}

export const writingQuestions: WritingQuestion[] = [
  // ================== SUMMARIZE WRITTEN TEXT - 9 Questions ==================
  // Easy
  {
    id: "swt-1",
    type: "summarize-written-text",
    title: "Summarize Written Text",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "easy",
    content: {
      sourceText: "Sleep is essential for good health and well-being. During sleep, the body repairs tissues and the brain consolidates memories. Adults need seven to nine hours of sleep per night. Lack of sleep can lead to problems with concentration, mood, and overall health."
    }
  },
  {
    id: "swt-2",
    type: "summarize-written-text",
    title: "Summarize Written Text",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "easy",
    content: {
      sourceText: "Regular exercise provides numerous benefits for physical and mental health. It strengthens the heart, improves circulation, and helps maintain a healthy weight. Exercise also releases endorphins, which can reduce stress and improve mood. Experts recommend at least 30 minutes of moderate activity most days."
    }
  },
  {
    id: "swt-3",
    type: "summarize-written-text",
    title: "Summarize Written Text",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "easy",
    content: {
      sourceText: "Reading offers many advantages beyond entertainment. It expands vocabulary, improves concentration, and enhances critical thinking skills. Regular readers often have better writing abilities and broader knowledge. Whether fiction or non-fiction, reading stimulates the mind and can reduce stress."
    }
  },
  // Medium
  {
    id: "swt-4",
    type: "summarize-written-text",
    title: "Summarize Written Text",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "medium",
    content: {
      sourceText: "The rise of remote work has transformed the modern workplace. While it offers flexibility and eliminates commuting, it also presents challenges for collaboration and work-life balance. Companies are experimenting with hybrid models that combine in-office and remote work. This shift has implications for urban planning, real estate markets, and employee well-being. The long-term effects of this transformation are still being studied."
    }
  },
  {
    id: "swt-5",
    type: "summarize-written-text",
    title: "Summarize Written Text",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "medium",
    content: {
      sourceText: "Renewable energy sources are becoming increasingly important in addressing climate change. Solar and wind power have seen dramatic cost reductions, making them competitive with fossil fuels. However, challenges remain regarding energy storage and grid integration. Governments worldwide are implementing policies to accelerate the transition to clean energy. The shift requires significant investment in infrastructure and technology."
    }
  },
  {
    id: "swt-6",
    type: "summarize-written-text",
    title: "Summarize Written Text",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "medium",
    content: {
      sourceText: "Social media has fundamentally changed how people communicate and consume information. While it enables instant global connection and democratizes content creation, it has also contributed to misinformation spread and mental health concerns. Platforms are implementing measures to combat fake news and protect users. The debate continues about the appropriate level of regulation for these powerful communication tools."
    }
  },
  // Hard
  {
    id: "swt-7",
    type: "summarize-written-text",
    title: "Summarize Written Text",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "hard",
    content: {
      sourceText: "The concept of neuroplasticity has revolutionized our understanding of the brain. Contrary to earlier beliefs that brain structure was fixed after childhood, research now shows that neural connections can form and reorganize throughout life. This has profound implications for learning, rehabilitation after brain injury, and treating neurological disorders. Environmental factors, cognitive training, and physical exercise have all been shown to promote beneficial neural changes. The brain's remarkable adaptability offers hope for addressing age-related cognitive decline and recovering from stroke."
    }
  },
  {
    id: "swt-8",
    type: "summarize-written-text",
    title: "Summarize Written Text",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "hard",
    content: {
      sourceText: "The circular economy represents a fundamental shift from the traditional linear 'take-make-dispose' model of production and consumption. By designing products for durability, reuse, and recycling, this approach aims to minimize waste and maximize resource efficiency. Companies are increasingly adopting circular principles, driven by both environmental concerns and economic incentives. However, transitioning to a circular economy requires systemic changes in business models, consumer behavior, and policy frameworks. The potential benefits include reduced environmental impact, new business opportunities, and enhanced resource security."
    }
  },
  {
    id: "swt-9",
    type: "summarize-written-text",
    title: "Summarize Written Text",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "hard",
    content: {
      sourceText: "The ethics of artificial intelligence presents complex challenges for society. As AI systems become more autonomous and influential in decision-making, questions arise about accountability, bias, and transparency. Algorithms can perpetuate or amplify existing societal biases if trained on skewed data. The concept of 'explainable AI' has emerged as a response to concerns about black-box decision-making. Establishing ethical guidelines and governance frameworks is essential to ensure AI development benefits humanity while minimizing potential harms."
    }
  },

  // ================== WRITE ESSAY - 9 Questions ==================
  // Easy
  {
    id: "we-1",
    type: "write-essay",
    title: "Write Essay",
    instruction: "Write an essay of 200-300 words on the given topic.",
    timeLimit: 1200,
    minWords: 200,
    maxWords: 300,
    difficulty: "easy",
    content: {
      essayPrompt: "Do you agree or disagree that technology has improved our quality of life? Support your opinion with reasons and examples."
    }
  },
  {
    id: "we-2",
    type: "write-essay",
    title: "Write Essay",
    instruction: "Write an essay of 200-300 words on the given topic.",
    timeLimit: 1200,
    minWords: 200,
    maxWords: 300,
    difficulty: "easy",
    content: {
      essayPrompt: "Some people prefer to live in a big city, while others prefer small towns. Which do you prefer and why?"
    }
  },
  {
    id: "we-3",
    type: "write-essay",
    title: "Write Essay",
    instruction: "Write an essay of 200-300 words on the given topic.",
    timeLimit: 1200,
    minWords: 200,
    maxWords: 300,
    difficulty: "easy",
    content: {
      essayPrompt: "What are the advantages and disadvantages of learning a foreign language at school?"
    }
  },
  // Medium
  {
    id: "we-4",
    type: "write-essay",
    title: "Write Essay",
    instruction: "Write an essay of 200-300 words on the given topic.",
    timeLimit: 1200,
    minWords: 200,
    maxWords: 300,
    difficulty: "medium",
    content: {
      essayPrompt: "Some argue that governments should invest heavily in space exploration, while others believe this money would be better spent solving problems on Earth. Discuss both views and give your opinion."
    }
  },
  {
    id: "we-5",
    type: "write-essay",
    title: "Write Essay",
    instruction: "Write an essay of 200-300 words on the given topic.",
    timeLimit: 1200,
    minWords: 200,
    maxWords: 300,
    difficulty: "medium",
    content: {
      essayPrompt: "With the rise of social media, some people believe that traditional forms of communication are becoming obsolete. To what extent do you agree or disagree?"
    }
  },
  {
    id: "we-6",
    type: "write-essay",
    title: "Write Essay",
    instruction: "Write an essay of 200-300 words on the given topic.",
    timeLimit: 1200,
    minWords: 200,
    maxWords: 300,
    difficulty: "medium",
    content: {
      essayPrompt: "Some people think that universities should provide practical skills for the job market, while others believe the focus should be on academic knowledge. Discuss both perspectives."
    }
  },
  // Hard
  {
    id: "we-7",
    type: "write-essay",
    title: "Write Essay",
    instruction: "Write an essay of 200-300 words on the given topic.",
    timeLimit: 1200,
    minWords: 200,
    maxWords: 300,
    difficulty: "hard",
    content: {
      essayPrompt: "The increasing use of artificial intelligence in the workplace raises concerns about mass unemployment. However, others argue that AI will create more jobs than it eliminates. Analyze both perspectives and provide your assessment of how society should prepare for this transition."
    }
  },
  {
    id: "we-8",
    type: "write-essay",
    title: "Write Essay",
    instruction: "Write an essay of 200-300 words on the given topic.",
    timeLimit: 1200,
    minWords: 200,
    maxWords: 300,
    difficulty: "hard",
    content: {
      essayPrompt: "Some argue that in an era of globalization, national identities are becoming less relevant. Others contend that preserving cultural distinctiveness is more important than ever. Critically evaluate these opposing viewpoints and present a nuanced position."
    }
  },
  {
    id: "we-9",
    type: "write-essay",
    title: "Write Essay",
    instruction: "Write an essay of 200-300 words on the given topic.",
    timeLimit: 1200,
    minWords: 200,
    maxWords: 300,
    difficulty: "hard",
    content: {
      essayPrompt: "The tension between individual privacy rights and collective security in the digital age presents complex ethical dilemmas. Examine the arguments for and against government surveillance programs and propose a balanced framework for addressing this issue."
    }
  },

  // ================== SUMMARIZE WRITTEN TEXT CORE - 6 Questions ==================
  // Easy
  {
    id: "swtc-1",
    type: "summarize-written-text-core",
    title: "Summarize Written Text (Core)",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "easy",
    content: {
      sourceText: "Volunteering offers benefits to both the volunteer and the community. It provides opportunities to develop new skills and meet people. Volunteers often report increased happiness and sense of purpose. Communities benefit from the additional support and services that volunteers provide."
    }
  },
  {
    id: "swtc-2",
    type: "summarize-written-text-core",
    title: "Summarize Written Text (Core)",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "easy",
    content: {
      sourceText: "Public libraries are valuable community resources. They provide free access to books, computers, and educational programs. Libraries also serve as community gathering spaces and offer services to all residents regardless of economic status. Many libraries have adapted to include digital resources and online services."
    }
  },
  // Medium
  {
    id: "swtc-3",
    type: "summarize-written-text-core",
    title: "Summarize Written Text (Core)",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "medium",
    content: {
      sourceText: "Workplace diversity brings multiple benefits to organizations. Teams with diverse backgrounds often generate more creative solutions and better represent customer bases. However, managing diversity requires intentional effort to create inclusive environments. Companies that successfully embrace diversity tend to outperform their more homogeneous competitors in terms of innovation and financial performance."
    }
  },
  {
    id: "swtc-4",
    type: "summarize-written-text-core",
    title: "Summarize Written Text (Core)",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "medium",
    content: {
      sourceText: "The sharing economy has transformed how people access goods and services. Platforms for ride-sharing, home-sharing, and equipment rental have created new business models. While this offers convenience and can reduce waste, it also raises questions about worker protections and market regulation. Traditional industries have had to adapt to this new competitive landscape."
    }
  },
  // Hard
  {
    id: "swtc-5",
    type: "summarize-written-text-core",
    title: "Summarize Written Text (Core)",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "hard",
    content: {
      sourceText: "The intersection of biotechnology and ethics raises profound questions about human enhancement and genetic modification. While gene therapies offer hope for treating inherited diseases, the prospect of 'designer babies' and genetic enhancement troubles many observers. Different cultures and religions hold varying perspectives on the acceptable boundaries of such interventions. Creating ethical frameworks that balance scientific progress with moral considerations remains an ongoing challenge for societies worldwide."
    }
  },
  {
    id: "swtc-6",
    type: "summarize-written-text-core",
    title: "Summarize Written Text (Core)",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "hard",
    content: {
      sourceText: "Urban green spaces provide essential ecosystem services in densely populated areas. Parks and urban forests help regulate temperature, reduce air pollution, and manage stormwater. Beyond environmental benefits, these spaces promote physical activity and mental well-being among city residents. However, access to green spaces is often unequally distributed, with lower-income neighborhoods typically having less access. Urban planning that prioritizes equitable green space distribution can address both environmental and social justice concerns."
    }
  },

  // ================== WRITE EMAIL - 9 Questions ==================
  // Easy
  {
    id: "wem-1",
    type: "write-email",
    title: "Write Email",
    instruction: "Write an email of 50-120 words based on the given context.",
    timeLimit: 540,
    minWords: 50,
    maxWords: 120,
    difficulty: "easy",
    content: {
      emailContext: "You recently moved to a new apartment. Write an email to a friend inviting them to your housewarming party.",
      emailTasks: [
        "Describe your new apartment briefly",
        "Provide party details (date, time)",
        "Ask if they can attend"
      ]
    }
  },
  {
    id: "wem-2",
    type: "write-email",
    title: "Write Email",
    instruction: "Write an email of 50-120 words based on the given context.",
    timeLimit: 540,
    minWords: 50,
    maxWords: 120,
    difficulty: "easy",
    content: {
      emailContext: "You ordered a book online but received the wrong item. Write an email to customer service.",
      emailTasks: [
        "Explain what happened",
        "Describe what you received vs. what you ordered",
        "Request a resolution"
      ]
    }
  },
  {
    id: "wem-3",
    type: "write-email",
    title: "Write Email",
    instruction: "Write an email of 50-120 words based on the given context.",
    timeLimit: 540,
    minWords: 50,
    maxWords: 120,
    difficulty: "easy",
    content: {
      emailContext: "You are a student who needs to miss a class next week. Write an email to your professor.",
      emailTasks: [
        "Explain why you will miss class",
        "Ask about any assignments",
        "Request to meet during office hours"
      ]
    }
  },
  // Medium
  {
    id: "wem-4",
    type: "write-email",
    title: "Write Email",
    instruction: "Write an email of 50-120 words based on the given context.",
    timeLimit: 540,
    minWords: 50,
    maxWords: 120,
    difficulty: "medium",
    content: {
      emailContext: "You are the team leader. Your team successfully completed a challenging project. Write an email to your manager.",
      emailTasks: [
        "Report on the project completion",
        "Highlight key achievements",
        "Acknowledge team members' contributions"
      ]
    }
  },
  {
    id: "wem-5",
    type: "write-email",
    title: "Write Email",
    instruction: "Write an email of 50-120 words based on the given context.",
    timeLimit: 540,
    minWords: 50,
    maxWords: 120,
    difficulty: "medium",
    content: {
      emailContext: "You attended a job interview last week. Write a follow-up email to the hiring manager.",
      emailTasks: [
        "Thank them for the interview opportunity",
        "Reiterate your interest in the position",
        "Briefly reinforce why you are a good fit"
      ]
    }
  },
  {
    id: "wem-6",
    type: "write-email",
    title: "Write Email",
    instruction: "Write an email of 50-120 words based on the given context.",
    timeLimit: 540,
    minWords: 50,
    maxWords: 120,
    difficulty: "medium",
    content: {
      emailContext: "You are organizing a charity fundraiser at your workplace. Write an email to colleagues.",
      emailTasks: [
        "Explain the cause and event",
        "Provide event details",
        "Encourage participation or donations"
      ]
    }
  },
  // Hard
  {
    id: "wem-7",
    type: "write-email",
    title: "Write Email",
    instruction: "Write an email of 50-120 words based on the given context.",
    timeLimit: 540,
    minWords: 50,
    maxWords: 120,
    difficulty: "hard",
    content: {
      emailContext: "A client has complained about a service delay. You are the customer relations manager. Write an email addressing their concerns.",
      emailTasks: [
        "Acknowledge the issue and apologize",
        "Explain what caused the delay",
        "Outline steps being taken to resolve it",
        "Offer compensation if appropriate"
      ]
    }
  },
  {
    id: "wem-8",
    type: "write-email",
    title: "Write Email",
    instruction: "Write an email of 50-120 words based on the given context.",
    timeLimit: 540,
    minWords: 50,
    maxWords: 120,
    difficulty: "hard",
    content: {
      emailContext: "You are a project manager. A key stakeholder has proposed changes that would significantly impact the project timeline. Write an email responding to their proposal.",
      emailTasks: [
        "Acknowledge their suggestions diplomatically",
        "Explain the potential impact on the project",
        "Propose an alternative approach or compromise",
        "Suggest a meeting to discuss further"
      ]
    }
  },
  {
    id: "wem-9",
    type: "write-email",
    title: "Write Email",
    instruction: "Write an email of 50-120 words based on the given context.",
    timeLimit: 540,
    minWords: 50,
    maxWords: 120,
    difficulty: "hard",
    content: {
      emailContext: "You are declining a job offer due to accepting another position. Write a professional email to the HR manager.",
      emailTasks: [
        "Express gratitude for the offer",
        "Politely decline the position",
        "Explain your decision briefly without being negative",
        "Express hope to stay in touch professionally"
      ]
    }
  },
];

export function getWritingQuestionsByType(type: WritingTestType): WritingQuestion[] {
  return writingQuestions.filter(q => q.type === type);
}

export function getWritingQuestionsByDifficulty(difficulty: "easy" | "medium" | "hard"): WritingQuestion[] {
  return writingQuestions.filter(q => q.difficulty === difficulty);
}

export function getWritingTestTypeInfo(type: WritingTestType) {
  const info: Record<WritingTestType, { name: string; description: string; icon: string }> = {
    "summarize-written-text": {
      name: "Summarize Written Text",
      description: "Summarize a passage in one sentence (5-75 words)",
      icon: "📋"
    },
    "write-essay": {
      name: "Write Essay",
      description: "Write an essay of 200-300 words on a given topic",
      icon: "✍️"
    },
    "summarize-written-text-core": {
      name: "Summarize Written Text (Core)",
      description: "Summarize a passage in one sentence for PTE Core",
      icon: "📄"
    },
    "write-email": {
      name: "Write Email",
      description: "Write a professional email (50-120 words)",
      icon: "📧"
    }
  };
  return info[type];
}
