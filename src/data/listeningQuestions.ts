export type ListeningTestType = 
  | "highlight-correct-summary"
  | "mc-single-listening"
  | "mc-multiple-listening"
  | "fill-blanks-listening"
  | "highlight-incorrect-words"
  | "write-from-dictation"
  | "select-missing-word"
  | "summarize-spoken-text";

export interface ListeningQuestion {
  id: string;
  type: ListeningTestType;
  title: string;
  instruction: string;
  difficulty: "easy" | "medium" | "hard";
  content: {
    audioText: string; // Text to be spoken via TTS
    transcript?: string; // For highlight incorrect words
    question?: string;
    options?: { id: string; text: string }[];
    correctAnswers?: string[];
    blanks?: { id: string; position: number; correctAnswer: string }[];
    incorrectWords?: { position: number; incorrect: string; correct: string }[];
    dictationText?: string;
    missingWord?: string;
  };
  timeLimit: number;
  audioPlayLimit?: number; // How many times audio can be played
}

export const listeningQuestions: ListeningQuestion[] = [
  // Highlight Correct Summary
  {
    id: "highlight-summary-1",
    type: "highlight-correct-summary",
    title: "Renewable Energy Lecture",
    instruction: "You will hear a recording. Click on the paragraph that best relates to the recording.",
    difficulty: "medium",
    content: {
      audioText: `The transition to renewable energy is accelerating faster than many experts predicted. Solar panel costs have dropped by over 90% in the past decade, making solar power competitive with fossil fuels in many regions. Wind energy has seen similar cost reductions, with offshore wind farms now capable of powering millions of homes. Governments worldwide are setting ambitious targets for carbon neutrality, driving investment in clean energy infrastructure. However, challenges remain, including the need for better energy storage solutions and grid modernization to handle variable renewable sources.`,
      options: [
        { id: "a", text: "Renewable energy adoption is slowing down due to high costs and technical challenges. While solar and wind have potential, they remain too expensive for widespread adoption. Governments are skeptical about clean energy targets." },
        { id: "b", text: "The renewable energy sector is growing rapidly, driven by dramatic cost reductions in solar and wind power. Government policies support this transition, though energy storage and grid infrastructure still need improvement." },
        { id: "c", text: "Fossil fuels remain the most economical energy source, with renewable alternatives proving too unreliable for large-scale use. Energy storage technology has advanced significantly, solving most intermittency issues." },
        { id: "d", text: "Nuclear power is emerging as the primary alternative to fossil fuels, with renewable sources playing a minor supporting role in the energy transition." }
      ],
      correctAnswers: ["b"]
    },
    timeLimit: 180,
    audioPlayLimit: 1
  },
  {
    id: "highlight-summary-2",
    type: "highlight-correct-summary",
    title: "Urban Agriculture",
    instruction: "You will hear a recording. Click on the paragraph that best relates to the recording.",
    difficulty: "easy",
    content: {
      audioText: `Urban agriculture is gaining popularity in cities around the world. Rooftop gardens, vertical farms, and community gardens are transforming unused urban spaces into productive growing areas. These initiatives provide fresh produce to local communities, reduce food transportation costs, and help improve air quality. Many schools have started incorporating garden programs into their curriculum, teaching children about nutrition and where their food comes from. The COVID-19 pandemic accelerated interest in local food production, as supply chain disruptions highlighted the vulnerability of our food systems.`,
      options: [
        { id: "a", text: "Urban agriculture is declining as cities prioritize commercial development over green spaces. Most urban farming initiatives have failed due to lack of interest and funding." },
        { id: "b", text: "Vertical farming technology is the only viable form of urban agriculture, with traditional gardens proving impractical in city environments." },
        { id: "c", text: "Urban agriculture is expanding through various forms including rooftop gardens and vertical farms. It benefits communities by providing fresh food and educational opportunities, with increased interest following pandemic-related supply chain issues." },
        { id: "d", text: "Urban agriculture primarily focuses on ornamental plants rather than food production, serving mainly aesthetic purposes in city landscapes." }
      ],
      correctAnswers: ["c"]
    },
    timeLimit: 180,
    audioPlayLimit: 1
  },

  // MC Single Answer (Listening)
  {
    id: "mc-single-listen-1",
    type: "mc-single-listening",
    title: "Economic Trends",
    instruction: "Listen to the recording and answer the multiple-choice question by selecting the best response.",
    difficulty: "medium",
    content: {
      audioText: `The global economy is experiencing significant shifts in labor markets due to automation and artificial intelligence. While some jobs are being eliminated, new roles are emerging in technology, data analysis, and AI management. Economists suggest that workers who develop skills in problem-solving, creativity, and emotional intelligence will be best positioned for the future. The key challenge for governments and educational institutions is to ensure that training programs keep pace with rapidly changing skill requirements. Some experts predict that lifelong learning will become essential rather than optional for career success.`,
      question: "According to the speaker, what is the key challenge facing governments and educational institutions?",
      options: [
        { id: "a", text: "Eliminating all automated jobs" },
        { id: "b", text: "Ensuring training programs keep pace with changing skill requirements" },
        { id: "c", text: "Preventing the development of AI technology" },
        { id: "d", text: "Reducing the cost of education" }
      ],
      correctAnswers: ["b"]
    },
    timeLimit: 120,
    audioPlayLimit: 1
  },
  {
    id: "mc-single-listen-2",
    type: "mc-single-listening",
    title: "Marine Conservation",
    instruction: "Listen to the recording and answer the multiple-choice question by selecting the best response.",
    difficulty: "hard",
    content: {
      audioText: `Marine protected areas have become a crucial tool in ocean conservation efforts. These designated zones restrict human activities such as fishing, mining, and shipping to allow marine ecosystems to recover. Research shows that fish populations within well-managed protected areas can increase by up to 400% compared to unprotected waters. The benefits extend beyond the protected zones, as healthy fish populations spill over into adjacent areas, benefiting local fishing communities. However, enforcement remains a challenge, particularly in remote ocean regions where illegal fishing continues to threaten marine biodiversity.`,
      question: "What is identified as a major challenge for marine protected areas?",
      options: [
        { id: "a", text: "Low fish populations within protected zones" },
        { id: "b", text: "Lack of community support" },
        { id: "c", text: "Enforcement, especially in remote regions" },
        { id: "d", text: "Excessive shipping traffic" }
      ],
      correctAnswers: ["c"]
    },
    timeLimit: 120,
    audioPlayLimit: 1
  },

  // MC Multiple Answers (Listening)
  {
    id: "mc-multiple-listen-1",
    type: "mc-multiple-listening",
    title: "Educational Technology",
    instruction: "Listen to the recording and answer the question by selecting ALL the correct responses. More than one response is correct.",
    difficulty: "medium",
    content: {
      audioText: `Educational technology has transformed how students learn and teachers teach. Online platforms enable personalized learning paths that adapt to each student's pace and learning style. Video conferencing tools have made remote learning possible, expanding access to education for students in rural areas. Digital assessments provide immediate feedback, helping students identify areas where they need more practice. However, concerns about screen time, digital equity, and the importance of face-to-face interaction remind us that technology should complement rather than replace traditional teaching methods.`,
      question: "According to the recording, what are the benefits of educational technology?",
      options: [
        { id: "a", text: "Personalized learning paths" },
        { id: "b", text: "Expanded access to education" },
        { id: "c", text: "Reduced need for teachers" },
        { id: "d", text: "Immediate feedback from digital assessments" },
        { id: "e", text: "Complete replacement of classroom learning" }
      ],
      correctAnswers: ["a", "b", "d"]
    },
    timeLimit: 150,
    audioPlayLimit: 1
  },

  // Fill in the Blanks (Listening)
  {
    id: "fill-listen-1",
    type: "fill-blanks-listening",
    title: "Climate Science",
    instruction: "You will hear a recording. Type the missing words in the blanks. Write only one word in each blank.",
    difficulty: "hard",
    content: {
      audioText: `Climate scientists use various methods to understand past climate conditions. Ice cores from Antarctica and Greenland contain trapped air bubbles that preserve atmospheric samples from thousands of years ago. By analyzing these samples, researchers can determine historical levels of carbon dioxide and other greenhouse gases. Tree rings provide another valuable record, as their width varies according to growing conditions in each year. Together, these natural archives help scientists understand how climate has changed over time and predict future trends.`,
      transcript: `Climate scientists use various methods to understand past climate [BLANK1]. Ice cores from Antarctica and Greenland contain trapped air [BLANK2] that preserve atmospheric samples from thousands of years ago. By analyzing these samples, researchers can determine [BLANK3] levels of carbon dioxide and other greenhouse gases. Tree rings provide another valuable record, as their width varies according to growing [BLANK4] in each year. Together, these natural [BLANK5] help scientists understand how climate has changed over time and predict future trends.`,
      blanks: [
        { id: "b1", position: 1, correctAnswer: "conditions" },
        { id: "b2", position: 2, correctAnswer: "bubbles" },
        { id: "b3", position: 3, correctAnswer: "historical" },
        { id: "b4", position: 4, correctAnswer: "conditions" },
        { id: "b5", position: 5, correctAnswer: "archives" }
      ]
    },
    timeLimit: 180,
    audioPlayLimit: 1
  },

  // Highlight Incorrect Words
  {
    id: "highlight-incorrect-1",
    type: "highlight-incorrect-words",
    title: "The Water Cycle",
    instruction: "You will hear a recording. Below is a transcript of the recording. Some words in the transcript differ from what the speaker said. Click on the words that are different.",
    difficulty: "medium",
    content: {
      audioText: `The water cycle is a continuous process that circulates water throughout Earth's systems. Water evaporates from oceans, lakes, and rivers, rising into the atmosphere as water vapor. As this vapor cools at higher altitudes, it condenses to form clouds. Eventually, the water returns to Earth's surface as precipitation, including rain, snow, and hail. Some of this water flows into rivers and streams, while some infiltrates the soil to become groundwater.`,
      transcript: `The water cycle is a continuous method that circulates water throughout Earth's systems. Water evaporates from oceans, lakes, and mountains, rising into the atmosphere as water vapor. As this vapor cools at higher altitudes, it condenses to form storms. Eventually, the water returns to Earth's surface as precipitation, including rain, snow, and hail. Some of this water flows into rivers and streams, while some penetrates the soil to become groundwater.`,
      incorrectWords: [
        { position: 6, incorrect: "method", correct: "process" },
        { position: 15, incorrect: "mountains", correct: "rivers" },
        { position: 31, incorrect: "storms", correct: "clouds" },
        { position: 58, incorrect: "penetrates", correct: "infiltrates" }
      ]
    },
    timeLimit: 180,
    audioPlayLimit: 1
  },
  {
    id: "highlight-incorrect-2",
    type: "highlight-incorrect-words",
    title: "Photosynthesis",
    instruction: "You will hear a recording. Below is a transcript of the recording. Some words in the transcript differ from what the speaker said. Click on the words that are different.",
    difficulty: "easy",
    content: {
      audioText: `Photosynthesis is the process by which plants convert sunlight into chemical energy. Plants absorb carbon dioxide from the air through small pores called stomata on their leaves. Using energy from sunlight, they combine this carbon dioxide with water to produce glucose and oxygen. The glucose provides energy for plant growth, while the oxygen is released into the atmosphere. This process is fundamental to life on Earth, as it produces the oxygen we breathe and forms the base of most food chains.`,
      transcript: `Photosynthesis is the process by which plants convert sunlight into thermal energy. Plants absorb carbon dioxide from the air through small pores called stomata on their stems. Using energy from sunlight, they combine this carbon dioxide with water to produce glucose and oxygen. The glucose provides nutrition for plant growth, while the oxygen is released into the atmosphere. This process is fundamental to life on Earth, as it produces the oxygen we breathe and forms the base of most food chains.`,
      incorrectWords: [
        { position: 13, incorrect: "thermal", correct: "chemical" },
        { position: 27, incorrect: "stems", correct: "leaves" },
        { position: 47, incorrect: "nutrition", correct: "energy" }
      ]
    },
    timeLimit: 180,
    audioPlayLimit: 1
  },

  // Write from Dictation
  {
    id: "dictation-1",
    type: "write-from-dictation",
    title: "Academic Statement 1",
    instruction: "You will hear a sentence. Type the sentence in the text box below. Write the response as you hear it.",
    difficulty: "easy",
    content: {
      audioText: "The library will be closed for renovations during the summer break.",
      dictationText: "The library will be closed for renovations during the summer break."
    },
    timeLimit: 60,
    audioPlayLimit: 1
  },
  {
    id: "dictation-2",
    type: "write-from-dictation",
    title: "Academic Statement 2",
    instruction: "You will hear a sentence. Type the sentence in the text box below. Write the response as you hear it.",
    difficulty: "medium",
    content: {
      audioText: "Students must submit their assignments before the deadline to receive full credit.",
      dictationText: "Students must submit their assignments before the deadline to receive full credit."
    },
    timeLimit: 60,
    audioPlayLimit: 1
  },
  {
    id: "dictation-3",
    type: "write-from-dictation",
    title: "Academic Statement 3",
    instruction: "You will hear a sentence. Type the sentence in the text box below. Write the response as you hear it.",
    difficulty: "hard",
    content: {
      audioText: "The interdisciplinary research program requires collaboration between multiple academic departments.",
      dictationText: "The interdisciplinary research program requires collaboration between multiple academic departments."
    },
    timeLimit: 60,
    audioPlayLimit: 1
  },

  // Select Missing Word
  {
    id: "missing-word-1",
    type: "select-missing-word",
    title: "Environmental Science",
    instruction: "You will hear a recording about environmental science. At the end of the recording, the last word or group of words has been replaced by a beep. Select the correct option to complete the recording.",
    difficulty: "medium",
    content: {
      audioText: `Sustainable development aims to meet the needs of the present without compromising the ability of future generations to meet their own needs. This concept requires balancing economic growth with environmental protection and social equity. Many businesses are now adopting sustainable practices, recognizing that long-term success depends on responsible resource...`,
      missingWord: "management",
      options: [
        { id: "a", text: "management" },
        { id: "b", text: "destruction" },
        { id: "c", text: "extraction" },
        { id: "d", text: "consumption" }
      ],
      correctAnswers: ["a"]
    },
    timeLimit: 120,
    audioPlayLimit: 1
  },

  // Summarize Spoken Text
  {
    id: "summarize-spoken-1",
    type: "summarize-spoken-text",
    title: "Biodiversity Conservation",
    instruction: "You will hear a short lecture. Write a summary for a fellow student who was not present at the lecture. You should write 50-70 words.",
    difficulty: "hard",
    content: {
      audioText: `Biodiversity conservation is facing unprecedented challenges in the 21st century. Scientists estimate that species are going extinct at a rate 100 to 1000 times faster than the natural background rate. Habitat destruction, climate change, pollution, and invasive species are the primary drivers of this crisis. Protected areas cover about 15% of Earth's land surface, but many experts argue this is insufficient.

Conservation efforts are evolving to address these challenges. Traditional approaches focused on protecting individual species, but modern conservation increasingly emphasizes ecosystem-based management. Corridor projects that connect isolated habitats allow species to migrate and maintain genetic diversity. Community-based conservation programs recognize that local people must be partners in protection efforts, not obstacles to them.

The economic value of biodiversity is becoming better understood. Ecosystem services such as pollination, water purification, and carbon sequestration provide trillions of dollars in benefits annually. As these values are incorporated into economic decision-making, there is hope that conservation can become not just an ethical imperative but an economic necessity.`
    },
    timeLimit: 600,
    audioPlayLimit: 2
  }
];

export function getListeningQuestionsByType(type: ListeningTestType): ListeningQuestion[] {
  return listeningQuestions.filter(q => q.type === type);
}

export function getListeningTestTypeInfo(type: ListeningTestType): { name: string; description: string; icon: string } {
  const info: Record<ListeningTestType, { name: string; description: string; icon: string }> = {
    "highlight-correct-summary": {
      name: "Highlight Correct Summary",
      description: "Select the paragraph that best summarizes the recording",
      icon: "📌"
    },
    "mc-single-listening": {
      name: "MC Single Answer",
      description: "Listen and select the single best answer",
      icon: "🔘"
    },
    "mc-multiple-listening": {
      name: "MC Multiple Answers",
      description: "Listen and select all correct answers",
      icon: "☑️"
    },
    "fill-blanks-listening": {
      name: "Fill in Blanks",
      description: "Type the missing words you hear",
      icon: "✍️"
    },
    "highlight-incorrect-words": {
      name: "Highlight Incorrect Words",
      description: "Identify words that differ from the recording",
      icon: "🔍"
    },
    "write-from-dictation": {
      name: "Write from Dictation",
      description: "Type exactly what you hear",
      icon: "📝"
    },
    "select-missing-word": {
      name: "Select Missing Word",
      description: "Choose the word that completes the recording",
      icon: "🎯"
    },
    "summarize-spoken-text": {
      name: "Summarize Spoken Text",
      description: "Write a summary of what you heard",
      icon: "📄"
    }
  };
  return info[type];
}
