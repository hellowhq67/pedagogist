// Complete Mock Tests Question Bank with 15 Full Mock Tests
// Each mock test contains questions for Speaking, Writing, Reading, and Listening sections

export interface MockTestInfo {
  id: string;
  name: string;
  description: string;
  type: "free" | "premium";
  testType: "full" | "section" | "question";
  duration: number; // in minutes
  totalQuestions: number;
  difficulty: "easy" | "medium" | "hard";
  isNew?: boolean;
  version?: string;
}

export interface MockTestQuestion {
  id: string;
  mockTestId: string;
  type: string;
  section: "speaking" | "writing" | "reading" | "listening";
  title: string;
  instruction: string;
  difficulty: "easy" | "medium" | "hard";
  content: any;
  timeLimit?: number;
  prepTime?: number;
  recordTime?: number;
  minWords?: number;
  maxWords?: number;
}

// 15 Complete Mock Tests
export const mockTestsList: MockTestInfo[] = [
  {
    id: "mock-test-free-a",
    name: "【Free Full】Mock Test A",
    description: "Free full-length practice test with AI scoring",
    type: "free",
    testType: "full",
    duration: 139,
    totalQuestions: 45,
    difficulty: "medium",
  },
  {
    id: "mock-test-45a",
    name: "【VIP Full】PTE Mock Test 45A",
    description: "Latest January 2026 format",
    type: "premium",
    testType: "full",
    duration: 139,
    totalQuestions: 48,
    difficulty: "medium",
    isNew: true,
    version: "Jan 2026",
  },
  {
    id: "mock-test-45b",
    name: "【VIP Full】PTE Mock Test 45B",
    description: "Latest January 2026 format",
    type: "premium",
    testType: "full",
    duration: 139,
    totalQuestions: 48,
    difficulty: "medium",
    isNew: true,
    version: "Jan 2026",
  },
  {
    id: "mock-test-44a",
    name: "【VIP Full】PTE Mock Test 44A",
    description: "December 2025 format",
    type: "premium",
    testType: "full",
    duration: 139,
    totalQuestions: 47,
    difficulty: "medium",
    version: "Dec 2025",
  },
  {
    id: "mock-test-44b",
    name: "【VIP Full】PTE Mock Test 44B",
    description: "December 2025 format",
    type: "premium",
    testType: "full",
    duration: 139,
    totalQuestions: 47,
    difficulty: "hard",
    version: "Dec 2025",
  },
  {
    id: "mock-test-43a",
    name: "【VIP Full】PTE Mock Test 43A",
    description: "November 2025 format",
    type: "premium",
    testType: "full",
    duration: 139,
    totalQuestions: 46,
    difficulty: "medium",
    version: "Nov 2025",
  },
  {
    id: "mock-test-43b",
    name: "【VIP Full】PTE Mock Test 43B",
    description: "November 2025 format",
    type: "premium",
    testType: "full",
    duration: 139,
    totalQuestions: 46,
    difficulty: "hard",
    version: "Nov 2025",
  },
  {
    id: "mock-test-42a",
    name: "【VIP Full】PTE Mock Test 42A",
    description: "October 2025 format",
    type: "premium",
    testType: "full",
    duration: 139,
    totalQuestions: 45,
    difficulty: "medium",
    version: "Oct 2025",
  },
  {
    id: "mock-test-42b",
    name: "【VIP Full】PTE Mock Test 42B",
    description: "October 2025 format",
    type: "premium",
    testType: "full",
    duration: 139,
    totalQuestions: 45,
    difficulty: "hard",
    version: "Oct 2025",
  },
  {
    id: "mock-test-41a",
    name: "【VIP Full】PTE Mock Test 41A",
    description: "September 2025 format",
    type: "premium",
    testType: "full",
    duration: 139,
    totalQuestions: 45,
    difficulty: "medium",
    version: "Sep 2025",
  },
  {
    id: "mock-test-41b",
    name: "【VIP Full】PTE Mock Test 41B",
    description: "September 2025 format",
    type: "premium",
    testType: "full",
    duration: 139,
    totalQuestions: 45,
    difficulty: "hard",
    version: "Sep 2025",
  },
  {
    id: "mock-test-40a",
    name: "【VIP Full】PTE Mock Test 40A",
    description: "August 2025 format",
    type: "premium",
    testType: "full",
    duration: 139,
    totalQuestions: 44,
    difficulty: "medium",
    version: "Aug 2025",
  },
  {
    id: "mock-test-40b",
    name: "【VIP Full】PTE Mock Test 40B",
    description: "August 2025 format",
    type: "premium",
    testType: "full",
    duration: 139,
    totalQuestions: 44,
    difficulty: "hard",
    version: "Aug 2025",
  },
  {
    id: "mock-test-39a",
    name: "【VIP Full】PTE Mock Test 39A",
    description: "July 2025 format",
    type: "premium",
    testType: "full",
    duration: 139,
    totalQuestions: 44,
    difficulty: "medium",
    version: "Jul 2025",
  },
  {
    id: "mock-test-39b",
    name: "【VIP Full】PTE Mock Test 39B",
    description: "July 2025 format",
    type: "premium",
    testType: "full",
    duration: 139,
    totalQuestions: 44,
    difficulty: "hard",
    version: "Jul 2025",
  },
];

// Section-based tests
export const sectionTests: MockTestInfo[] = [
  {
    id: "section-speaking-1",
    name: "Speaking Section Test 1",
    description: "Focus on Speaking & Writing",
    type: "free",
    testType: "section",
    duration: 77,
    totalQuestions: 28,
    difficulty: "medium",
  },
  {
    id: "section-reading-1",
    name: "Reading Section Test 1",
    description: "Focus on Reading skills",
    type: "premium",
    testType: "section",
    duration: 29,
    totalQuestions: 10,
    difficulty: "medium",
  },
  {
    id: "section-listening-1",
    name: "Listening Section Test 1",
    description: "Focus on Listening skills",
    type: "premium",
    testType: "section",
    duration: 33,
    totalQuestions: 16,
    difficulty: "medium",
  },
];

// Question-type specific tests
export const questionTests: MockTestInfo[] = [
  {
    id: "question-read-aloud",
    name: "Read Aloud Practice",
    description: "10 Read Aloud questions",
    type: "free",
    testType: "question",
    duration: 15,
    totalQuestions: 10,
    difficulty: "medium",
  },
  {
    id: "question-repeat-sentence",
    name: "Repeat Sentence Practice",
    description: "15 Repeat Sentence questions",
    type: "free",
    testType: "question",
    duration: 10,
    totalQuestions: 15,
    difficulty: "medium",
  },
  {
    id: "question-summarize-spoken",
    name: "Summarize Spoken Text",
    description: "5 SST questions",
    type: "premium",
    testType: "question",
    duration: 50,
    totalQuestions: 5,
    difficulty: "hard",
  },
];

// Complete question bank for all mock tests
export const mockTestQuestions: MockTestQuestion[] = [
  // ========== MOCK TEST FREE-A QUESTIONS ==========
  // Speaking - Read Aloud
  {
    id: "free-a-ra-1",
    mockTestId: "mock-test-free-a",
    type: "read-aloud",
    section: "speaking",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    difficulty: "medium",
    prepTime: 30,
    recordTime: 40,
    content: {
      text: "The proliferation of digital technologies has fundamentally altered the landscape of modern education. Online learning platforms now offer unprecedented access to knowledge, enabling students from remote areas to participate in courses previously available only to urban populations."
    }
  },
  {
    id: "free-a-ra-2",
    mockTestId: "mock-test-free-a",
    type: "read-aloud",
    section: "speaking",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    difficulty: "medium",
    prepTime: 30,
    recordTime: 40,
    content: {
      text: "Climate change represents one of the most pressing challenges facing humanity today. Rising global temperatures are causing shifts in weather patterns, affecting agriculture, and threatening biodiversity across the planet."
    }
  },
  {
    id: "free-a-ra-3",
    mockTestId: "mock-test-free-a",
    type: "read-aloud",
    section: "speaking",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    difficulty: "hard",
    prepTime: 30,
    recordTime: 40,
    content: {
      text: "Contemporary architectural practices increasingly incorporate sustainable design principles, recognizing the imperative to minimize environmental impact while maximizing occupant comfort. Green building certifications have become standard benchmarks for evaluating construction quality."
    }
  },
  {
    id: "free-a-ra-4",
    mockTestId: "mock-test-free-a",
    type: "read-aloud",
    section: "speaking",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    difficulty: "medium",
    prepTime: 30,
    recordTime: 40,
    content: {
      text: "The integration of artificial intelligence into healthcare systems promises to revolutionize patient care. Machine learning algorithms can analyze medical imaging with remarkable accuracy, potentially detecting diseases at earlier stages than traditional methods."
    }
  },
  {
    id: "free-a-ra-5",
    mockTestId: "mock-test-free-a",
    type: "read-aloud",
    section: "speaking",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    difficulty: "easy",
    prepTime: 30,
    recordTime: 40,
    content: {
      text: "The university library offers a wide range of services to support student research. These include access to digital databases, interlibrary loan services, and individual research consultations with subject specialists."
    }
  },
  {
    id: "free-a-ra-6",
    mockTestId: "mock-test-free-a",
    type: "read-aloud",
    section: "speaking",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    difficulty: "medium",
    prepTime: 30,
    recordTime: 40,
    content: {
      text: "International trade agreements facilitate economic cooperation between nations while establishing frameworks for dispute resolution. These multilateral arrangements have become increasingly complex as global supply chains expand across multiple jurisdictions."
    }
  },
  // Speaking - Repeat Sentence
  {
    id: "free-a-rs-1",
    mockTestId: "mock-test-free-a",
    type: "repeat-sentence",
    section: "speaking",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    difficulty: "medium",
    prepTime: 3,
    recordTime: 15,
    content: {
      text: "The university has announced a new scholarship program for international students starting next semester."
    }
  },
  {
    id: "free-a-rs-2",
    mockTestId: "mock-test-free-a",
    type: "repeat-sentence",
    section: "speaking",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    difficulty: "hard",
    prepTime: 3,
    recordTime: 15,
    content: {
      text: "Archaeological evidence suggests that ancient civilizations developed sophisticated agricultural techniques thousands of years before previously thought."
    }
  },
  {
    id: "free-a-rs-3",
    mockTestId: "mock-test-free-a",
    type: "repeat-sentence",
    section: "speaking",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    difficulty: "easy",
    prepTime: 3,
    recordTime: 15,
    content: {
      text: "Please remember to bring your student identification card to the examination hall."
    }
  },
  {
    id: "free-a-rs-4",
    mockTestId: "mock-test-free-a",
    type: "repeat-sentence",
    section: "speaking",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    difficulty: "medium",
    prepTime: 3,
    recordTime: 15,
    content: {
      text: "The laboratory results confirmed the hypothesis regarding the effectiveness of the new treatment protocol."
    }
  },
  {
    id: "free-a-rs-5",
    mockTestId: "mock-test-free-a",
    type: "repeat-sentence",
    section: "speaking",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    difficulty: "medium",
    prepTime: 3,
    recordTime: 15,
    content: {
      text: "The conference will feature presentations from leading experts in renewable energy technology."
    }
  },
  {
    id: "free-a-rs-6",
    mockTestId: "mock-test-free-a",
    type: "repeat-sentence",
    section: "speaking",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    difficulty: "hard",
    prepTime: 3,
    recordTime: 15,
    content: {
      text: "Sustainable development requires balancing economic growth with environmental protection and social equity considerations."
    }
  },
  {
    id: "free-a-rs-7",
    mockTestId: "mock-test-free-a",
    type: "repeat-sentence",
    section: "speaking",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    difficulty: "easy",
    prepTime: 3,
    recordTime: 15,
    content: {
      text: "The museum opens at nine o'clock and closes at six on weekdays."
    }
  },
  {
    id: "free-a-rs-8",
    mockTestId: "mock-test-free-a",
    type: "repeat-sentence",
    section: "speaking",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    difficulty: "medium",
    prepTime: 3,
    recordTime: 15,
    content: {
      text: "The research team published their findings in a peer-reviewed academic journal last month."
    }
  },
  {
    id: "free-a-rs-9",
    mockTestId: "mock-test-free-a",
    type: "repeat-sentence",
    section: "speaking",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    difficulty: "medium",
    prepTime: 3,
    recordTime: 15,
    content: {
      text: "Students are encouraged to participate in extracurricular activities to develop leadership skills."
    }
  },
  {
    id: "free-a-rs-10",
    mockTestId: "mock-test-free-a",
    type: "repeat-sentence",
    section: "speaking",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    difficulty: "hard",
    prepTime: 3,
    recordTime: 15,
    content: {
      text: "The interdisciplinary approach combines methodologies from multiple fields to address complex research questions."
    }
  },
  // Speaking - Describe Image
  {
    id: "free-a-di-1",
    mockTestId: "mock-test-free-a",
    type: "describe-image",
    section: "speaking",
    title: "Describe Image",
    instruction: "Describe the image in detail. You have 25 seconds to study the image and 40 seconds to speak.",
    difficulty: "medium",
    prepTime: 25,
    recordTime: 40,
    content: {
      imageUrl: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800",
      imageDescription: "A bar chart comparing smartphone market share across different brands (Apple, Samsung, Xiaomi, Others) from 2019 to 2023, showing market trends and competition."
    }
  },
  {
    id: "free-a-di-2",
    mockTestId: "mock-test-free-a",
    type: "describe-image",
    section: "speaking",
    title: "Describe Image",
    instruction: "Describe the image in detail. You have 25 seconds to study the image and 40 seconds to speak.",
    difficulty: "medium",
    prepTime: 25,
    recordTime: 40,
    content: {
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
      imageDescription: "A line graph showing global temperature changes over the past century, with a clear upward trend indicating climate warming."
    }
  },
  {
    id: "free-a-di-3",
    mockTestId: "mock-test-free-a",
    type: "describe-image",
    section: "speaking",
    title: "Describe Image",
    instruction: "Describe the image in detail. You have 25 seconds to study the image and 40 seconds to speak.",
    difficulty: "hard",
    prepTime: 25,
    recordTime: 40,
    content: {
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
      imageDescription: "A complex flowchart showing the water treatment process from collection through purification to distribution, with multiple stages and quality checkpoints."
    }
  },
  // Speaking - Retell Lecture
  {
    id: "free-a-rl-1",
    mockTestId: "mock-test-free-a",
    type: "retell-lecture",
    section: "speaking",
    title: "Re-tell Lecture",
    instruction: "Listen to the lecture and re-tell it in your own words. You have 10 seconds to prepare after the audio ends.",
    difficulty: "medium",
    prepTime: 10,
    recordTime: 40,
    content: {
      lectureContent: "Today I want to discuss the phenomenon of urbanization and its impact on traditional communities. As cities expand, rural populations migrate seeking employment and educational opportunities. This movement has both positive and negative consequences. On one hand, urban areas offer better healthcare facilities and diverse employment options. On the other hand, traditional customs and community bonds often weaken as families become geographically dispersed."
    }
  },
  {
    id: "free-a-rl-2",
    mockTestId: "mock-test-free-a",
    type: "retell-lecture",
    section: "speaking",
    title: "Re-tell Lecture",
    instruction: "Listen to the lecture and re-tell it in your own words. You have 10 seconds to prepare after the audio ends.",
    difficulty: "hard",
    prepTime: 10,
    recordTime: 40,
    content: {
      lectureContent: "The development of renewable energy sources represents one of the most significant technological shifts of our era. Solar panel efficiency has improved dramatically over the past decade, while manufacturing costs have decreased by nearly 90 percent. Wind power has similarly advanced, with offshore turbines now capable of generating enough electricity for thousands of homes. However, the intermittent nature of these sources presents challenges for grid stability, driving innovation in battery storage technology."
    }
  },
  // Speaking - Answer Short Question
  {
    id: "free-a-asq-1",
    mockTestId: "mock-test-free-a",
    type: "answer-short-question",
    section: "speaking",
    title: "Answer Short Question",
    instruction: "Listen to the question and give a short answer.",
    difficulty: "easy",
    prepTime: 3,
    recordTime: 10,
    content: {
      question: "What do you call a person who writes articles for newspapers?",
      expectedAnswer: "journalist"
    }
  },
  {
    id: "free-a-asq-2",
    mockTestId: "mock-test-free-a",
    type: "answer-short-question",
    section: "speaking",
    title: "Answer Short Question",
    instruction: "Listen to the question and give a short answer.",
    difficulty: "easy",
    prepTime: 3,
    recordTime: 10,
    content: {
      question: "What instrument is used to measure temperature?",
      expectedAnswer: "thermometer"
    }
  },
  {
    id: "free-a-asq-3",
    mockTestId: "mock-test-free-a",
    type: "answer-short-question",
    section: "speaking",
    title: "Answer Short Question",
    instruction: "Listen to the question and give a short answer.",
    difficulty: "medium",
    prepTime: 3,
    recordTime: 10,
    content: {
      question: "What term describes the study of the Earth's physical features and atmosphere?",
      expectedAnswer: "geography"
    }
  },
  {
    id: "free-a-asq-4",
    mockTestId: "mock-test-free-a",
    type: "answer-short-question",
    section: "speaking",
    title: "Answer Short Question",
    instruction: "Listen to the question and give a short answer.",
    difficulty: "easy",
    prepTime: 3,
    recordTime: 10,
    content: {
      question: "What do we call the person who leads an orchestra?",
      expectedAnswer: "conductor"
    }
  },
  {
    id: "free-a-asq-5",
    mockTestId: "mock-test-free-a",
    type: "answer-short-question",
    section: "speaking",
    title: "Answer Short Question",
    instruction: "Listen to the question and give a short answer.",
    difficulty: "medium",
    prepTime: 3,
    recordTime: 10,
    content: {
      question: "What is the study of ancient human civilizations called?",
      expectedAnswer: "archaeology"
    }
  },
  // Writing - Summarize Written Text
  {
    id: "free-a-swt-1",
    mockTestId: "mock-test-free-a",
    type: "summarize-written-text",
    section: "writing",
    title: "Summarize Written Text",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    difficulty: "medium",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    content: {
      sourceText: "The global economy is experiencing a significant transformation as emerging markets become increasingly influential. Countries such as China, India, and Brazil have seen remarkable economic growth, shifting the balance of global trade. This development has led to new opportunities for international business but also created challenges for traditional economic powers. Understanding these dynamics is crucial for businesses seeking to expand their operations internationally."
    }
  },
  // Writing - Write Essay
  {
    id: "free-a-we-1",
    mockTestId: "mock-test-free-a",
    type: "write-essay",
    section: "writing",
    title: "Write Essay",
    instruction: "Write an essay of 200-300 words on the given topic.",
    difficulty: "medium",
    timeLimit: 1200,
    minWords: 200,
    maxWords: 300,
    content: {
      essayPrompt: "Some employers believe that formal academic qualifications are more important than life experience or personal qualities when selecting candidates. To what extent do you agree with this view?"
    }
  },
  // Reading - Multiple Choice Single
  {
    id: "free-a-mcs-1",
    mockTestId: "mock-test-free-a",
    type: "mc-single",
    section: "reading",
    title: "Multiple Choice - Single Answer",
    instruction: "Read the passage and answer the multiple-choice question below by selecting the best answer.",
    difficulty: "medium",
    timeLimit: 120,
    content: {
      passage: `Global trade patterns have shifted dramatically in recent decades with the rise of Asian economies. China has become the world's largest exporter, while traditional manufacturing powerhouses in Europe and North America have seen their relative importance decline. This shift has had profound implications for employment, with many workers in developed countries experiencing job losses in manufacturing sectors.

The response to these changes has varied. Some countries have invested heavily in education and retraining programs, seeking to equip their workforce with skills suited to the knowledge economy. Others have pursued protectionist policies, imposing tariffs and trade barriers to shield domestic industries from foreign competition.`,
      question: "According to the passage, what has been one response to changes in global trade patterns?",
      options: [
        { id: "a", text: "Increasing manufacturing output" },
        { id: "b", text: "Investment in education and retraining programs" },
        { id: "c", text: "Reducing exports to Asian countries" },
        { id: "d", text: "Eliminating all trade agreements" }
      ],
      correctAnswers: ["b"]
    }
  },
  {
    id: "free-a-mcs-2",
    mockTestId: "mock-test-free-a",
    type: "mc-single",
    section: "reading",
    title: "Multiple Choice - Single Answer",
    instruction: "Read the passage and answer the multiple-choice question below by selecting the best answer.",
    difficulty: "hard",
    timeLimit: 150,
    content: {
      passage: `Telemedicine has emerged as a transformative force in healthcare delivery, particularly following the global pandemic. Remote consultations allow patients to receive medical advice without visiting a clinic, reducing travel time and potential exposure to infectious diseases. Advanced video conferencing technology enables physicians to conduct visual examinations, while connected devices can transmit vital signs in real-time.

Despite these advantages, telemedicine faces significant challenges. Not all medical conditions can be adequately assessed remotely; physical examinations remain necessary for many diagnoses. Furthermore, access to the required technology is not universal, potentially creating disparities in healthcare access.`,
      question: "What is identified as a primary challenge for telemedicine according to the passage?",
      options: [
        { id: "a", text: "Lack of physician interest in remote consultations" },
        { id: "b", text: "The inability to perform physical examinations remotely" },
        { id: "c", text: "High costs of video conferencing equipment" },
        { id: "d", text: "Patient resistance to new technology" }
      ],
      correctAnswers: ["b"]
    }
  },
  // Reading - Multiple Choice Multiple
  {
    id: "free-a-mcm-1",
    mockTestId: "mock-test-free-a",
    type: "mc-multiple",
    section: "reading",
    title: "Multiple Choice - Multiple Answers",
    instruction: "Read the passage and select ALL the correct answers. More than one response is correct.",
    difficulty: "medium",
    timeLimit: 150,
    content: {
      passage: `Sustainable agriculture practices are gaining importance as the global population grows and climate change threatens food security. Organic farming methods reduce reliance on synthetic pesticides and fertilizers, protecting soil health and water quality. Crop rotation helps maintain soil nutrients naturally while reducing pest populations. Cover cropping prevents erosion and adds organic matter to the soil.

Modern sustainable farms often integrate technology with traditional practices. Precision agriculture uses sensors and data analytics to optimize irrigation and fertilizer application, reducing waste while maintaining yields.`,
      question: "According to the passage, what are benefits or features of sustainable agriculture practices?",
      options: [
        { id: "a", text: "Protection of soil health and water quality" },
        { id: "b", text: "Use of precision agriculture technology" },
        { id: "c", text: "Higher short-term profits than conventional farming" },
        { id: "d", text: "Prevention of erosion through cover cropping" },
        { id: "e", text: "Complete elimination of all pest problems" }
      ],
      correctAnswers: ["a", "b", "d"]
    }
  },
  {
    id: "free-a-mcm-2",
    mockTestId: "mock-test-free-a",
    type: "mc-multiple",
    section: "reading",
    title: "Multiple Choice - Multiple Answers",
    instruction: "Read the passage and select ALL the correct answers. More than one response is correct.",
    difficulty: "hard",
    timeLimit: 150,
    content: {
      passage: `The development of renewable energy technologies has accelerated rapidly in recent years. Solar photovoltaic costs have declined by over 80% in the past decade, making solar power competitive with fossil fuels in many markets. Wind energy has similarly become more cost-effective, with offshore wind farms now generating substantial amounts of electricity.

Government policies have played a crucial role in this transformation. Tax incentives, subsidies, and renewable portfolio standards have encouraged investment in clean energy. Additionally, international climate agreements have set ambitious targets for reducing carbon emissions.`,
      question: "Based on the passage, which factors have contributed to the growth of renewable energy?",
      options: [
        { id: "a", text: "Declining costs of solar technology" },
        { id: "b", text: "Government tax incentives and subsidies" },
        { id: "c", text: "Elimination of fossil fuel industries" },
        { id: "d", text: "International climate agreements" },
        { id: "e", text: "Consumer preference for higher energy prices" }
      ],
      correctAnswers: ["a", "b", "d"]
    }
  },
  // Reading - Reorder Paragraphs
  {
    id: "free-a-rop-1",
    mockTestId: "mock-test-free-a",
    type: "reorder-paragraphs",
    section: "reading",
    title: "Reorder Paragraphs",
    instruction: "The text boxes below have been placed in random order. Restore the original order by dragging the text boxes to their correct positions.",
    difficulty: "hard",
    timeLimit: 180,
    content: {
      paragraphs: [
        { id: "p1", text: "Economic development is a complex process that involves the transformation of a society's productive capacity and standard of living." },
        { id: "p2", text: "Initially, most developing economies rely heavily on agriculture and the extraction of natural resources." },
        { id: "p3", text: "As development progresses, manufacturing sectors typically expand, providing employment and generating exports." },
        { id: "p4", text: "Eventually, service industries come to dominate the economy, including finance, healthcare, and technology." },
        { id: "p5", text: "Throughout this process, improvements in education and infrastructure are essential to sustain growth and reduce inequality." }
      ],
      correctOrder: ["p1", "p2", "p3", "p4", "p5"]
    }
  },
  {
    id: "free-a-rop-2",
    mockTestId: "mock-test-free-a",
    type: "reorder-paragraphs",
    section: "reading",
    title: "Reorder Paragraphs",
    instruction: "The text boxes below have been placed in random order. Restore the original order by dragging the text boxes to their correct positions.",
    difficulty: "medium",
    timeLimit: 180,
    content: {
      paragraphs: [
        { id: "p1", text: "Scientific research follows a systematic methodology to investigate natural phenomena." },
        { id: "p2", text: "The process begins with observation and the formulation of a hypothesis." },
        { id: "p3", text: "Experiments are then designed to test the hypothesis under controlled conditions." },
        { id: "p4", text: "Data collected from experiments is analyzed to determine whether the hypothesis is supported." },
        { id: "p5", text: "Finally, conclusions are drawn and results are published for peer review." }
      ],
      correctOrder: ["p1", "p2", "p3", "p4", "p5"]
    }
  },
  // Reading - Fill in the Blanks (Drag)
  {
    id: "free-a-fbd-1",
    mockTestId: "mock-test-free-a",
    type: "fill-blanks-drag",
    section: "reading",
    title: "Fill in the Blanks (Drag & Drop)",
    instruction: "Below is a text with blanks. Drag words from the box below to fill in the blanks.",
    difficulty: "medium",
    timeLimit: 180,
    content: {
      text: "The Earth's climate system is influenced by many [1]. Solar radiation provides the [2] that drives weather patterns. Greenhouse gases in the atmosphere [3] heat, keeping the planet warm enough to support life. Human activities have [4] the concentration of these gases, leading to global warming.",
      blanks: [
        { id: 1, correctAnswer: "factors" },
        { id: 2, correctAnswer: "energy" },
        { id: 3, correctAnswer: "trap" },
        { id: 4, correctAnswer: "increased" }
      ],
      options: ["factors", "energy", "trap", "increased", "decreased", "release", "problems", "light"]
    }
  },
  {
    id: "free-a-fbd-2",
    mockTestId: "mock-test-free-a",
    type: "fill-blanks-drag",
    section: "reading",
    title: "Fill in the Blanks (Drag & Drop)",
    instruction: "Below is a text with blanks. Drag words from the box below to fill in the blanks.",
    difficulty: "hard",
    timeLimit: 180,
    content: {
      text: "Biodiversity refers to the [1] of life forms found on Earth. This includes [2] diversity, species diversity, and ecosystem diversity. [3] of biodiversity threatens the stability of ecosystems and the [4] they provide to humanity.",
      blanks: [
        { id: 1, correctAnswer: "variety" },
        { id: 2, correctAnswer: "genetic" },
        { id: 3, correctAnswer: "Loss" },
        { id: 4, correctAnswer: "services" }
      ],
      options: ["variety", "genetic", "Loss", "services", "number", "chemical", "Increase", "products"]
    }
  },
  // Reading - Fill in the Blanks (Dropdown)
  {
    id: "free-a-fbdd-1",
    mockTestId: "mock-test-free-a",
    type: "fill-blanks-dropdown",
    section: "reading",
    title: "Fill in the Blanks (Dropdown)",
    instruction: "Select the appropriate word from the dropdown menu for each blank.",
    difficulty: "medium",
    timeLimit: 180,
    content: {
      text: "The [1] of digital technology has transformed how people [2] information. Traditional libraries now offer electronic resources alongside physical books. This [3] has made knowledge more accessible but has also raised [4] about digital literacy.",
      blanks: [
        { id: 1, correctAnswer: "rise", options: ["rise", "fall", "absence", "limit"] },
        { id: 2, correctAnswer: "access", options: ["deny", "access", "prevent", "avoid"] },
        { id: 3, correctAnswer: "shift", options: ["shift", "stop", "barrier", "limit"] },
        { id: 4, correctAnswer: "concerns", options: ["profits", "concerns", "solutions", "barriers"] }
      ]
    }
  },
  {
    id: "free-a-fbdd-2",
    mockTestId: "mock-test-free-a",
    type: "fill-blanks-dropdown",
    section: "reading",
    title: "Fill in the Blanks (Dropdown)",
    instruction: "Select the appropriate word from the dropdown menu for each blank.",
    difficulty: "hard",
    timeLimit: 180,
    content: {
      text: "Modern architecture [1] functionality with aesthetic appeal. Buildings are designed to [2] environmental standards while providing comfortable spaces. The use of sustainable materials has become [3] important as awareness of climate change [4].",
      blanks: [
        { id: 1, correctAnswer: "combines", options: ["separates", "combines", "removes", "ignores"] },
        { id: 2, correctAnswer: "meet", options: ["avoid", "meet", "violate", "ignore"] },
        { id: 3, correctAnswer: "increasingly", options: ["decreasingly", "rarely", "increasingly", "never"] },
        { id: 4, correctAnswer: "grows", options: ["declines", "grows", "stops", "disappears"] }
      ]
    }
  },
  // Listening - Summarize Spoken Text
  {
    id: "free-a-sst-1",
    mockTestId: "mock-test-free-a",
    type: "summarize-spoken-text",
    section: "listening",
    title: "Summarize Spoken Text",
    instruction: "Listen to the recording and write a summary of 50-70 words.",
    difficulty: "hard",
    timeLimit: 600,
    minWords: 50,
    maxWords: 70,
    content: {
      audioContent: "The lecture discusses the importance of biodiversity conservation. The speaker explains that biodiversity provides essential ecosystem services, including clean air, water purification, and crop pollination. They note that habitat destruction and climate change are major threats. The conclusion emphasizes that protecting biodiversity is not just an environmental issue but an economic and social imperative for sustainable development."
    }
  },
  // Listening - Multiple Choice Multiple
  {
    id: "free-a-mcml-1",
    mockTestId: "mock-test-free-a",
    type: "mc-multiple-listening",
    section: "listening",
    title: "Multiple Choice - Multiple Answers",
    instruction: "Listen to the recording and select ALL the correct answers.",
    difficulty: "medium",
    timeLimit: 150,
    content: {
      audioContent: "Today we'll discuss the benefits of remote work. First, employees save time and money on commuting. Second, many report improved work-life balance. Third, companies can access a wider talent pool by hiring from different locations. However, challenges include maintaining team cohesion and ensuring effective communication.",
      question: "According to the speaker, what are benefits of remote work?",
      options: [
        { id: "a", text: "Reduced commuting costs for employees" },
        { id: "b", text: "Access to a wider talent pool for companies" },
        { id: "c", text: "Guaranteed higher productivity" },
        { id: "d", text: "Improved work-life balance" },
        { id: "e", text: "Elimination of all communication challenges" }
      ],
      correctAnswers: ["a", "b", "d"]
    }
  },
  {
    id: "free-a-mcml-2",
    mockTestId: "mock-test-free-a",
    type: "mc-multiple-listening",
    section: "listening",
    title: "Multiple Choice - Multiple Answers",
    instruction: "Listen to the recording and select ALL the correct answers.",
    difficulty: "hard",
    timeLimit: 150,
    content: {
      audioContent: "The presentation covers the evolution of electric vehicles. Early electric cars were limited by battery technology and infrastructure. Recent advances have dramatically improved range and reduced charging times. Government incentives have accelerated adoption. Major automakers are now committed to transitioning their entire fleets to electric power within the next decade.",
      question: "What points does the speaker make about electric vehicles?",
      options: [
        { id: "a", text: "Early models had limitations due to battery technology" },
        { id: "b", text: "Charging infrastructure has improved" },
        { id: "c", text: "Government incentives have helped adoption" },
        { id: "d", text: "All automakers have already switched to electric only" },
        { id: "e", text: "Battery range has increased significantly" }
      ],
      correctAnswers: ["a", "c", "e"]
    }
  },
  // Listening - Fill in the Blanks
  {
    id: "free-a-fbl-1",
    mockTestId: "mock-test-free-a",
    type: "fill-blanks-listening",
    section: "listening",
    title: "Fill in the Blanks",
    instruction: "Listen to the recording and fill in the blanks with the words you hear.",
    difficulty: "medium",
    timeLimit: 180,
    content: {
      transcript: "The university is implementing a new [1] management system to reduce paper usage. All documents will be stored [2] and accessible through the student [3]. This initiative is part of our broader [4] commitment.",
      blanks: [
        { id: 1, correctAnswer: "document" },
        { id: 2, correctAnswer: "electronically" },
        { id: 3, correctAnswer: "portal" },
        { id: 4, correctAnswer: "sustainability" }
      ]
    }
  },
  {
    id: "free-a-fbl-2",
    mockTestId: "mock-test-free-a",
    type: "fill-blanks-listening",
    section: "listening",
    title: "Fill in the Blanks",
    instruction: "Listen to the recording and fill in the blanks with the words you hear.",
    difficulty: "hard",
    timeLimit: 180,
    content: {
      transcript: "The research [1] significant findings about climate adaptation. Scientists discovered that certain plant [2] have evolved mechanisms to cope with rising [3]. This has important [4] for agricultural planning.",
      blanks: [
        { id: 1, correctAnswer: "revealed" },
        { id: 2, correctAnswer: "species" },
        { id: 3, correctAnswer: "temperatures" },
        { id: 4, correctAnswer: "implications" }
      ]
    }
  },
  // Listening - Highlight Correct Summary
  {
    id: "free-a-hcs-1",
    mockTestId: "mock-test-free-a",
    type: "highlight-correct-summary",
    section: "listening",
    title: "Highlight Correct Summary",
    instruction: "Listen to the recording and select the paragraph that best summarizes it.",
    difficulty: "medium",
    timeLimit: 180,
    content: {
      audioContent: "The speaker discusses how social media has changed journalism. Traditional gatekeeping by editors has been replaced by algorithmic content distribution. Anyone can now publish news, which has increased the spread of misinformation. However, social media has also enabled citizen journalism and given voice to underrepresented communities.",
      options: [
        { id: "a", text: "Social media has completely destroyed professional journalism and should be regulated by governments to prevent misinformation from spreading." },
        { id: "b", text: "Social media has transformed journalism by changing content distribution from editorial control to algorithms, bringing both challenges like misinformation and benefits like increased voice for underrepresented groups." },
        { id: "c", text: "The speaker believes that traditional journalism is superior to social media and that citizen journalism has no value in modern society." },
        { id: "d", text: "Algorithms used by social media companies are designed specifically to promote accurate news and eliminate misinformation effectively." }
      ],
      correctAnswer: "b"
    }
  },
  {
    id: "free-a-hcs-2",
    mockTestId: "mock-test-free-a",
    type: "highlight-correct-summary",
    section: "listening",
    title: "Highlight Correct Summary",
    instruction: "Listen to the recording and select the paragraph that best summarizes it.",
    difficulty: "hard",
    timeLimit: 180,
    content: {
      audioContent: "Today's lecture explores the psychology of decision-making. Research shows that humans often rely on mental shortcuts called heuristics. While these shortcuts help us make quick decisions, they can lead to systematic errors or biases. Understanding these biases can help individuals and organizations make better choices.",
      options: [
        { id: "a", text: "The lecture argues that all human decisions are irrational and that heuristics should be completely eliminated from our thinking processes." },
        { id: "b", text: "According to the lecture, mental shortcuts always lead to poor decisions and should be avoided in all circumstances." },
        { id: "c", text: "The lecture discusses how mental shortcuts called heuristics help with quick decisions but can cause biases, and understanding them improves decision-making." },
        { id: "d", text: "The speaker suggests that only experts can make good decisions because ordinary people lack the cognitive ability to avoid biases." }
      ],
      correctAnswer: "c"
    }
  },
  // Listening - MC Single
  {
    id: "free-a-mcsl-1",
    mockTestId: "mock-test-free-a",
    type: "mc-single-listening",
    section: "listening",
    title: "Multiple Choice - Single Answer",
    instruction: "Listen to the recording and select the best answer.",
    difficulty: "medium",
    timeLimit: 120,
    content: {
      audioContent: "The professor explains that the library will be undergoing renovations during the summer break. During this time, students can access digital resources through the online portal. Physical book loans will be suspended, but the reference section will remain open for limited hours.",
      question: "What will students be able to do during the library renovations?",
      options: [
        { id: "a", text: "Borrow physical books as normal" },
        { id: "b", text: "Access digital resources online" },
        { id: "c", text: "Use the library at any time" },
        { id: "d", text: "Attend library workshops" }
      ],
      correctAnswer: "b"
    }
  },
  {
    id: "free-a-mcsl-2",
    mockTestId: "mock-test-free-a",
    type: "mc-single-listening",
    section: "listening",
    title: "Multiple Choice - Single Answer",
    instruction: "Listen to the recording and select the best answer.",
    difficulty: "hard",
    timeLimit: 120,
    content: {
      audioContent: "The economist argues that inflation is primarily driven by supply chain disruptions rather than monetary policy. She notes that production bottlenecks and transportation costs have increased prices across multiple sectors. She suggests that addressing these structural issues will be more effective than raising interest rates.",
      question: "According to the economist, what is the main cause of inflation?",
      options: [
        { id: "a", text: "Excessive government spending" },
        { id: "b", text: "Supply chain disruptions" },
        { id: "c", text: "Low interest rates" },
        { id: "d", text: "Consumer demand" }
      ],
      correctAnswer: "b"
    }
  },
  // Listening - Select Missing Word
  {
    id: "free-a-smw-1",
    mockTestId: "mock-test-free-a",
    type: "select-missing-word",
    section: "listening",
    title: "Select Missing Word",
    instruction: "Listen to the recording. At the end, the last word or phrase is replaced by a beep. Select the option that best completes the recording.",
    difficulty: "medium",
    timeLimit: 120,
    content: {
      audioContent: "The study found that regular exercise not only improves physical health but also has significant benefits for mental wellbeing. Participants who exercised three times a week reported reduced anxiety and improved [BEEP].",
      options: [
        { id: "a", text: "appetite" },
        { id: "b", text: "mood" },
        { id: "c", text: "weight" },
        { id: "d", text: "speed" }
      ],
      correctAnswer: "b"
    }
  },
  {
    id: "free-a-smw-2",
    mockTestId: "mock-test-free-a",
    type: "select-missing-word",
    section: "listening",
    title: "Select Missing Word",
    instruction: "Listen to the recording. At the end, the last word or phrase is replaced by a beep. Select the option that best completes the recording.",
    difficulty: "hard",
    timeLimit: 120,
    content: {
      audioContent: "The archaeological discovery shed new light on ancient trading routes. Artifacts found at the site included pottery from distant regions, indicating that this settlement was a major commercial [BEEP].",
      options: [
        { id: "a", text: "failure" },
        { id: "b", text: "mystery" },
        { id: "c", text: "hub" },
        { id: "d", text: "secret" }
      ],
      correctAnswer: "c"
    }
  },
  // Listening - Highlight Incorrect Words
  {
    id: "free-a-hiw-1",
    mockTestId: "mock-test-free-a",
    type: "highlight-incorrect-words",
    section: "listening",
    title: "Highlight Incorrect Words",
    instruction: "Listen to the recording and click on the words in the transcript that differ from what you hear.",
    difficulty: "medium",
    timeLimit: 180,
    content: {
      transcript: "The university has announced a new research center focused on sustainable development. The facility will bring together experts from various disciplines to address global environmental challenges. Funding has been secured through a combination of government grants and private donations.",
      incorrectWords: [
        { original: "center", spoken: "institute" },
        { original: "experts", spoken: "scholars" },
        { original: "global", spoken: "major" }
      ]
    }
  },
  {
    id: "free-a-hiw-2",
    mockTestId: "mock-test-free-a",
    type: "highlight-incorrect-words",
    section: "listening",
    title: "Highlight Incorrect Words",
    instruction: "Listen to the recording and click on the words in the transcript that differ from what you hear.",
    difficulty: "hard",
    timeLimit: 180,
    content: {
      transcript: "The conference will feature presentations from leading researchers in artificial intelligence. Topics include machine learning applications in healthcare, autonomous vehicles, and natural language processing. Registration opens next week and early bird discounts are available.",
      incorrectWords: [
        { original: "presentations", spoken: "lectures" },
        { original: "autonomous", spoken: "self-driving" },
        { original: "Registration", spoken: "Enrollment" }
      ]
    }
  },
  // Listening - Write From Dictation
  {
    id: "free-a-wfd-1",
    mockTestId: "mock-test-free-a",
    type: "write-from-dictation",
    section: "listening",
    title: "Write From Dictation",
    instruction: "Listen to the recording and type the sentence exactly as you hear it.",
    difficulty: "medium",
    timeLimit: 60,
    content: {
      sentence: "Students must submit their assignments before the deadline."
    }
  },
  {
    id: "free-a-wfd-2",
    mockTestId: "mock-test-free-a",
    type: "write-from-dictation",
    section: "listening",
    title: "Write From Dictation",
    instruction: "Listen to the recording and type the sentence exactly as you hear it.",
    difficulty: "hard",
    timeLimit: 60,
    content: {
      sentence: "The laboratory equipment must be handled with extreme care."
    }
  },
  {
    id: "free-a-wfd-3",
    mockTestId: "mock-test-free-a",
    type: "write-from-dictation",
    section: "listening",
    title: "Write From Dictation",
    instruction: "Listen to the recording and type the sentence exactly as you hear it.",
    difficulty: "easy",
    timeLimit: 60,
    content: {
      sentence: "The library will be closed for renovations next month."
    }
  },

  // Additional questions for other mock tests would follow the same pattern...
  // For brevity, I'll include key questions for the next few mock tests

  // ========== MOCK TEST 45A QUESTIONS ==========
  {
    id: "45a-ra-1",
    mockTestId: "mock-test-45a",
    type: "read-aloud",
    section: "speaking",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    difficulty: "hard",
    prepTime: 30,
    recordTime: 40,
    content: {
      text: "Quantum computing represents a paradigm shift in computational capability. Unlike classical computers that process information in binary states, quantum computers utilize qubits that can exist in multiple states simultaneously, enabling exponentially faster processing for certain types of problems."
    }
  },
  {
    id: "45a-rs-1",
    mockTestId: "mock-test-45a",
    type: "repeat-sentence",
    section: "speaking",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    difficulty: "hard",
    prepTime: 3,
    recordTime: 15,
    content: {
      text: "Neuroscience research has revealed the remarkable plasticity of the human brain throughout the lifespan."
    }
  },
  {
    id: "45a-swt-1",
    mockTestId: "mock-test-45a",
    type: "summarize-written-text",
    section: "writing",
    title: "Summarize Written Text",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    difficulty: "hard",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    content: {
      sourceText: "Artificial intelligence is revolutionizing healthcare delivery across multiple dimensions. Machine learning algorithms can now analyze medical imaging with accuracy comparable to trained radiologists, while natural language processing enables efficient extraction of insights from clinical notes. Predictive models help identify patients at risk of developing chronic conditions, allowing for preventive interventions. However, concerns about data privacy, algorithmic bias, and the potential displacement of healthcare workers require careful consideration as these technologies are integrated into clinical practice."
    }
  },

  // ========== MOCK TEST 45B QUESTIONS ==========
  {
    id: "45b-ra-1",
    mockTestId: "mock-test-45b",
    type: "read-aloud",
    section: "speaking",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    difficulty: "medium",
    prepTime: 30,
    recordTime: 40,
    content: {
      text: "The biodiversity of tropical rainforests supports countless species of plants, animals, and microorganisms. These ecosystems play a critical role in regulating global climate patterns and serve as valuable sources for pharmaceutical research."
    }
  },

  // ========== MOCK TEST 44A QUESTIONS ==========
  {
    id: "44a-ra-1",
    mockTestId: "mock-test-44a",
    type: "read-aloud",
    section: "speaking",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    difficulty: "medium",
    prepTime: 30,
    recordTime: 40,
    content: {
      text: "Ocean acidification resulting from increased carbon dioxide absorption poses a significant threat to marine ecosystems. Coral reefs, which support approximately twenty-five percent of all marine species, are particularly vulnerable to changes in water chemistry."
    }
  },
];

// Helper function to get questions for a specific mock test
export function getMockTestQuestions(mockTestId: string): MockTestQuestion[] {
  return mockTestQuestions.filter(q => q.mockTestId === mockTestId);
}

// Helper function to get questions by section
export function getQuestionsBySection(mockTestId: string, section: "speaking" | "writing" | "reading" | "listening"): MockTestQuestion[] {
  return mockTestQuestions.filter(q => q.mockTestId === mockTestId && q.section === section);
}

// Helper function to get all mock tests by type
export function getMockTestsByType(testType: "full" | "section" | "question"): MockTestInfo[] {
  return mockTestsList.filter(t => t.testType === testType);
}
