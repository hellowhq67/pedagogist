export interface SpeakingQuestion {
  id: string;
  type: TestType;
  title: string;
  instruction: string;
  prepTime: number;
  recordTime: number;
  content: QuestionContent;
  difficulty: "easy" | "medium" | "hard";
}

export type TestType =
  | "read-aloud"
  | "repeat-sentence"
  | "describe-image"
  | "retell-lecture"
  | "answer-short-question"
  | "summarize-spoken-text"
  | "read-and-retell"
  | "summarize-group-discussion"
  | "respond-to-situation";

interface QuestionContent {
  text?: string;
  imageUrl?: string;
  imageDescription?: string;
  audioUrl?: string;
  lectureContent?: string;
  question?: string;
  expectedAnswer?: string;
  situationContext?: string;
  discussionContent?: string;
}

export const speakingQuestions: SpeakingQuestion[] = [
  // ================== READ ALOUD - 12 Questions ==================
  // Easy
  {
    id: "ra-1",
    type: "read-aloud",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    prepTime: 30,
    recordTime: 40,
    difficulty: "easy",
    content: {
      text: "The library is an excellent place to study. It provides a quiet environment where students can focus on their work without distractions."
    }
  },
  {
    id: "ra-2",
    type: "read-aloud",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    prepTime: 30,
    recordTime: 40,
    difficulty: "easy",
    content: {
      text: "Regular exercise is essential for maintaining good health. It helps strengthen the heart, improve mood, and increase energy levels throughout the day."
    }
  },
  {
    id: "ra-3",
    type: "read-aloud",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    prepTime: 30,
    recordTime: 40,
    difficulty: "easy",
    content: {
      text: "Water covers approximately seventy percent of Earth's surface. It exists in various forms including liquid oceans, solid ice caps, and gaseous water vapor."
    }
  },
  {
    id: "ra-4",
    type: "read-aloud",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    prepTime: 30,
    recordTime: 40,
    difficulty: "easy",
    content: {
      text: "Technology has transformed the way we communicate. Mobile phones and the internet allow people to connect instantly across great distances."
    }
  },
  // Medium
  {
    id: "ra-5",
    type: "read-aloud",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    prepTime: 30,
    recordTime: 40,
    difficulty: "medium",
    content: {
      text: "Climate change represents one of the most significant challenges facing humanity today. Scientists around the world have documented rising temperatures, melting ice caps, and increasingly severe weather events. Addressing this crisis requires coordinated action from governments, businesses, and individuals alike."
    }
  },
  {
    id: "ra-6",
    type: "read-aloud",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    prepTime: 30,
    recordTime: 40,
    difficulty: "medium",
    content: {
      text: "The development of artificial intelligence has transformed numerous industries, from healthcare to transportation. Machine learning algorithms can now analyze vast amounts of data to identify patterns that would be impossible for humans to detect. This technology continues to evolve at an unprecedented pace."
    }
  },
  {
    id: "ra-7",
    type: "read-aloud",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    prepTime: 30,
    recordTime: 40,
    difficulty: "medium",
    content: {
      text: "Universities serve as centers of knowledge creation and dissemination, preparing students for careers across diverse fields. Research conducted at these institutions has led to breakthrough discoveries in medicine, technology, and social sciences. The value of higher education extends far beyond the classroom."
    }
  },
  {
    id: "ra-8",
    type: "read-aloud",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    prepTime: 30,
    recordTime: 40,
    difficulty: "medium",
    content: {
      text: "Biodiversity loss threatens the stability of ecosystems worldwide. Species extinction occurs at a rate unprecedented in human history, driven by habitat destruction, pollution, and climate change. Conservation efforts must accelerate to preserve the natural world for future generations."
    }
  },
  // Hard
  {
    id: "ra-9",
    type: "read-aloud",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    prepTime: 30,
    recordTime: 40,
    difficulty: "hard",
    content: {
      text: "The intersection of neuroscience and psychology has revolutionized our understanding of human consciousness and cognitive processes. Sophisticated neuroimaging techniques enable researchers to observe brain activity in real-time, revealing the intricate neural mechanisms underlying perception, memory, and decision-making."
    }
  },
  {
    id: "ra-10",
    type: "read-aloud",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    prepTime: 30,
    recordTime: 40,
    difficulty: "hard",
    content: {
      text: "Quantum mechanics fundamentally challenges our intuitions about reality at the subatomic level. Phenomena such as superposition and entanglement suggest that particles can exist in multiple states simultaneously until observed, a concept that even distinguished physicists have struggled to reconcile with classical understanding."
    }
  },
  {
    id: "ra-11",
    type: "read-aloud",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    prepTime: 30,
    recordTime: 40,
    difficulty: "hard",
    content: {
      text: "The socioeconomic implications of automation extend beyond simple job displacement. While technological advancement has historically created new employment opportunities, the unprecedented speed of current developments in artificial intelligence raises questions about whether traditional economic adjustment mechanisms will suffice in the coming decades."
    }
  },
  {
    id: "ra-12",
    type: "read-aloud",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    prepTime: 30,
    recordTime: 40,
    difficulty: "hard",
    content: {
      text: "Epigenetic modifications represent a fascinating layer of biological complexity that bridges genetic inheritance and environmental influence. These chemical alterations to DNA expression, which do not change the underlying genetic sequence, can be influenced by lifestyle factors and may even be transmitted across generations."
    }
  },

  // ================== REPEAT SENTENCE - 12 Questions ==================
  // Easy
  {
    id: "rs-1",
    type: "repeat-sentence",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    prepTime: 3,
    recordTime: 15,
    difficulty: "easy",
    content: {
      text: "The library will be closed for renovations during the summer break."
    }
  },
  {
    id: "rs-2",
    type: "repeat-sentence",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    prepTime: 3,
    recordTime: 15,
    difficulty: "easy",
    content: {
      text: "Please submit your assignment by the end of the week."
    }
  },
  {
    id: "rs-3",
    type: "repeat-sentence",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    prepTime: 3,
    recordTime: 15,
    difficulty: "easy",
    content: {
      text: "The meeting has been rescheduled to next Monday morning."
    }
  },
  {
    id: "rs-4",
    type: "repeat-sentence",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    prepTime: 3,
    recordTime: 15,
    difficulty: "easy",
    content: {
      text: "Students must bring their identification cards to the examination."
    }
  },
  // Medium
  {
    id: "rs-5",
    type: "repeat-sentence",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    prepTime: 3,
    recordTime: 15,
    difficulty: "medium",
    content: {
      text: "Students should submit their assignments before the deadline to avoid penalties."
    }
  },
  {
    id: "rs-6",
    type: "repeat-sentence",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    prepTime: 3,
    recordTime: 15,
    difficulty: "medium",
    content: {
      text: "The conference will feature presentations from leading experts in the field."
    }
  },
  {
    id: "rs-7",
    type: "repeat-sentence",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    prepTime: 3,
    recordTime: 15,
    difficulty: "medium",
    content: {
      text: "Environmental sustainability requires balancing economic development with ecological preservation."
    }
  },
  {
    id: "rs-8",
    type: "repeat-sentence",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    prepTime: 3,
    recordTime: 15,
    difficulty: "medium",
    content: {
      text: "The research findings suggest a correlation between sleep quality and academic performance."
    }
  },
  // Hard
  {
    id: "rs-9",
    type: "repeat-sentence",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    prepTime: 3,
    recordTime: 15,
    difficulty: "hard",
    content: {
      text: "The implementation of interdisciplinary approaches has significantly enhanced our understanding of complex societal challenges."
    }
  },
  {
    id: "rs-10",
    type: "repeat-sentence",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    prepTime: 3,
    recordTime: 15,
    difficulty: "hard",
    content: {
      text: "Contemporary economic theories increasingly emphasize the interconnectedness of global financial markets."
    }
  },
  {
    id: "rs-11",
    type: "repeat-sentence",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    prepTime: 3,
    recordTime: 15,
    difficulty: "hard",
    content: {
      text: "The longitudinal study revealed statistically significant improvements in participants' cognitive functioning."
    }
  },
  {
    id: "rs-12",
    type: "repeat-sentence",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    prepTime: 3,
    recordTime: 15,
    difficulty: "hard",
    content: {
      text: "Archaeological excavations have uncovered unprecedented evidence of sophisticated prehistoric civilizations."
    }
  },

  // ================== DESCRIBE IMAGE - 9 Questions ==================
  // Easy
  {
    id: "di-1",
    type: "describe-image",
    title: "Describe Image",
    instruction: "Describe the image in detail. You have 25 seconds to study the image and 40 seconds to speak.",
    prepTime: 25,
    recordTime: 40,
    difficulty: "easy",
    content: {
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
      imageDescription: "A simple bar chart showing sales data for four quarters, with Q4 having the highest sales."
    }
  },
  {
    id: "di-2",
    type: "describe-image",
    title: "Describe Image",
    instruction: "Describe the image in detail. You have 25 seconds to study the image and 40 seconds to speak.",
    prepTime: 25,
    recordTime: 40,
    difficulty: "easy",
    content: {
      imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
      imageDescription: "A pie chart showing budget allocation across departments: Marketing 30%, Operations 40%, R&D 20%, Admin 10%."
    }
  },
  {
    id: "di-3",
    type: "describe-image",
    title: "Describe Image",
    instruction: "Describe the image in detail. You have 25 seconds to study the image and 40 seconds to speak.",
    prepTime: 25,
    recordTime: 40,
    difficulty: "easy",
    content: {
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
      imageDescription: "A simple line graph showing website traffic over 12 months with a steady increase."
    }
  },
  // Medium
  {
    id: "di-4",
    type: "describe-image",
    title: "Describe Image",
    instruction: "Describe the image in detail. You have 25 seconds to study the image and 40 seconds to speak.",
    prepTime: 25,
    recordTime: 40,
    difficulty: "medium",
    content: {
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
      imageDescription: "A world map showing global population density with different regions colored to indicate population concentration. Darker colors indicate higher population density. Major cities are marked with dots. Asia shows the highest concentration."
    }
  },
  {
    id: "di-5",
    type: "describe-image",
    title: "Describe Image",
    instruction: "Describe the image in detail. You have 25 seconds to study the image and 40 seconds to speak.",
    prepTime: 25,
    recordTime: 40,
    difficulty: "medium",
    content: {
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
      imageDescription: "A business analytics dashboard showing multiple charts: line chart for growth trends, bar charts comparing regional metrics, and pie charts showing market distribution."
    }
  },
  {
    id: "di-6",
    type: "describe-image",
    title: "Describe Image",
    instruction: "Describe the image in detail. You have 25 seconds to study the image and 40 seconds to speak.",
    prepTime: 25,
    recordTime: 40,
    difficulty: "medium",
    content: {
      imageUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800",
      imageDescription: "A comparison chart showing renewable energy adoption rates across different countries from 2010 to 2020, with Germany and Denmark leading."
    }
  },
  // Hard
  {
    id: "di-7",
    type: "describe-image",
    title: "Describe Image",
    instruction: "Describe the image in detail. You have 25 seconds to study the image and 40 seconds to speak.",
    prepTime: 25,
    recordTime: 40,
    difficulty: "hard",
    content: {
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
      imageDescription: "A complex multi-axis chart combining unemployment rates, GDP growth, and inflation across G7 nations from 2008-2023, showing the impact of financial crisis and pandemic."
    }
  },
  {
    id: "di-8",
    type: "describe-image",
    title: "Describe Image",
    instruction: "Describe the image in detail. You have 25 seconds to study the image and 40 seconds to speak.",
    prepTime: 25,
    recordTime: 40,
    difficulty: "hard",
    content: {
      imageUrl: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800",
      imageDescription: "A scientific diagram showing the carbon cycle with arrows indicating carbon flow between atmosphere, oceans, land ecosystems, and human activities."
    }
  },
  {
    id: "di-9",
    type: "describe-image",
    title: "Describe Image",
    instruction: "Describe the image in detail. You have 25 seconds to study the image and 40 seconds to speak.",
    prepTime: 25,
    recordTime: 40,
    difficulty: "hard",
    content: {
      imageUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800",
      imageDescription: "A Sankey diagram illustrating global energy flows from primary sources through conversion processes to end-use sectors, showing efficiency losses at each stage."
    }
  },

  // ================== RETELL LECTURE - 9 Questions ==================
  // Easy
  {
    id: "rl-1",
    type: "retell-lecture",
    title: "Re-tell Lecture",
    instruction: "Listen to the lecture and re-tell it in your own words. You have 10 seconds to prepare after the audio ends.",
    prepTime: 10,
    recordTime: 40,
    difficulty: "easy",
    content: {
      lectureContent: "Today we'll discuss the water cycle. Water evaporates from oceans when heated by the sun. This vapor rises and forms clouds. Then it falls back as rain or snow. This cycle repeats continuously and is essential for life on Earth."
    }
  },
  {
    id: "rl-2",
    type: "retell-lecture",
    title: "Re-tell Lecture",
    instruction: "Listen to the lecture and re-tell it in your own words. You have 10 seconds to prepare after the audio ends.",
    prepTime: 10,
    recordTime: 40,
    difficulty: "easy",
    content: {
      lectureContent: "Photosynthesis is how plants make food. They use sunlight, water, and carbon dioxide. The process produces glucose and oxygen. This is why plants are so important - they create the oxygen we breathe."
    }
  },
  {
    id: "rl-3",
    type: "retell-lecture",
    title: "Re-tell Lecture",
    instruction: "Listen to the lecture and re-tell it in your own words. You have 10 seconds to prepare after the audio ends.",
    prepTime: 10,
    recordTime: 40,
    difficulty: "easy",
    content: {
      lectureContent: "The solar system has eight planets. The four inner planets are rocky: Mercury, Venus, Earth, and Mars. The four outer planets are gas giants: Jupiter, Saturn, Uranus, and Neptune. Earth is the only planet known to support life."
    }
  },
  // Medium
  {
    id: "rl-4",
    type: "retell-lecture",
    title: "Re-tell Lecture",
    instruction: "Listen to the lecture and re-tell it in your own words. You have 10 seconds to prepare after the audio ends.",
    prepTime: 10,
    recordTime: 40,
    difficulty: "medium",
    content: {
      lectureContent: "The Renaissance, which means 'rebirth' in French, was a period of cultural, artistic, and intellectual transformation that began in Italy in the 14th century and spread throughout Europe. This era saw a renewed interest in classical Greek and Roman ideas. Artists like Leonardo da Vinci and Michelangelo revolutionized painting and sculpture. The invention of the printing press by Gutenberg allowed ideas to spread rapidly."
    }
  },
  {
    id: "rl-5",
    type: "retell-lecture",
    title: "Re-tell Lecture",
    instruction: "Listen to the lecture and re-tell it in your own words. You have 10 seconds to prepare after the audio ends.",
    prepTime: 10,
    recordTime: 40,
    difficulty: "medium",
    content: {
      lectureContent: "The Industrial Revolution transformed society from agricultural to industrial economies. Starting in Britain in the late 18th century, it introduced factory systems and mass production. New inventions like the steam engine revolutionized transportation. While it created economic growth, it also led to urbanization and significant social changes, including the rise of the working class."
    }
  },
  {
    id: "rl-6",
    type: "retell-lecture",
    title: "Re-tell Lecture",
    instruction: "Listen to the lecture and re-tell it in your own words. You have 10 seconds to prepare after the audio ends.",
    prepTime: 10,
    recordTime: 40,
    difficulty: "medium",
    content: {
      lectureContent: "Coral reefs are among the most biodiverse ecosystems on Earth. They cover less than one percent of the ocean floor but support about 25 percent of all marine species. Coral bleaching, caused by rising ocean temperatures, threatens these vital ecosystems. Conservation efforts focus on reducing pollution and establishing marine protected areas."
    }
  },
  // Hard
  {
    id: "rl-7",
    type: "retell-lecture",
    title: "Re-tell Lecture",
    instruction: "Listen to the lecture and re-tell it in your own words. You have 10 seconds to prepare after the audio ends.",
    prepTime: 10,
    recordTime: 40,
    difficulty: "hard",
    content: {
      lectureContent: "Behavioral economics challenges traditional economic assumptions about rational decision-making. Research by Kahneman and Tversky demonstrated that humans consistently deviate from rational choice theory. Cognitive biases such as loss aversion, anchoring, and the availability heuristic systematically influence our decisions. These insights have profound implications for policy design, marketing strategies, and personal financial planning."
    }
  },
  {
    id: "rl-8",
    type: "retell-lecture",
    title: "Re-tell Lecture",
    instruction: "Listen to the lecture and re-tell it in your own words. You have 10 seconds to prepare after the audio ends.",
    prepTime: 10,
    recordTime: 40,
    difficulty: "hard",
    content: {
      lectureContent: "The human microbiome comprises trillions of microorganisms residing in our bodies, particularly in the gut. Recent research has revealed its crucial role in immune function, metabolism, and even mental health through the gut-brain axis. Dysbiosis, or microbial imbalance, has been linked to conditions ranging from inflammatory bowel disease to depression. Interventions such as probiotics and fecal transplants offer promising therapeutic avenues."
    }
  },
  {
    id: "rl-9",
    type: "retell-lecture",
    title: "Re-tell Lecture",
    instruction: "Listen to the lecture and re-tell it in your own words. You have 10 seconds to prepare after the audio ends.",
    prepTime: 10,
    recordTime: 40,
    difficulty: "hard",
    content: {
      lectureContent: "Cryptocurrency and blockchain technology represent a paradigm shift in financial systems. Decentralized ledger technology eliminates the need for intermediaries in transactions. Smart contracts enable automated, trustless agreements. However, challenges remain regarding scalability, energy consumption, and regulatory frameworks. Central bank digital currencies are emerging as governments explore blockchain applications."
    }
  },

  // ================== ANSWER SHORT QUESTION - 15 Questions ==================
  // Easy
  {
    id: "asq-1",
    type: "answer-short-question",
    title: "Answer Short Question",
    instruction: "Answer the question with a single word or a few words.",
    prepTime: 3,
    recordTime: 10,
    difficulty: "easy",
    content: {
      question: "What do we call a person who studies the stars and planets?",
      expectedAnswer: "astronomer"
    }
  },
  {
    id: "asq-2",
    type: "answer-short-question",
    title: "Answer Short Question",
    instruction: "Answer the question with a single word or a few words.",
    prepTime: 3,
    recordTime: 10,
    difficulty: "easy",
    content: {
      question: "What device is used to measure temperature?",
      expectedAnswer: "thermometer"
    }
  },
  {
    id: "asq-3",
    type: "answer-short-question",
    title: "Answer Short Question",
    instruction: "Answer the question with a single word or a few words.",
    prepTime: 3,
    recordTime: 10,
    difficulty: "easy",
    content: {
      question: "How many days are there in a week?",
      expectedAnswer: "seven"
    }
  },
  {
    id: "asq-4",
    type: "answer-short-question",
    title: "Answer Short Question",
    instruction: "Answer the question with a single word or a few words.",
    prepTime: 3,
    recordTime: 10,
    difficulty: "easy",
    content: {
      question: "What is the opposite of hot?",
      expectedAnswer: "cold"
    }
  },
  {
    id: "asq-5",
    type: "answer-short-question",
    title: "Answer Short Question",
    instruction: "Answer the question with a single word or a few words.",
    prepTime: 3,
    recordTime: 10,
    difficulty: "easy",
    content: {
      question: "What do we call the person who flies an airplane?",
      expectedAnswer: "pilot"
    }
  },
  // Medium
  {
    id: "asq-6",
    type: "answer-short-question",
    title: "Answer Short Question",
    instruction: "Answer the question with a single word or a few words.",
    prepTime: 3,
    recordTime: 10,
    difficulty: "medium",
    content: {
      question: "What is the primary gas that plants absorb from the atmosphere?",
      expectedAnswer: "carbon dioxide"
    }
  },
  {
    id: "asq-7",
    type: "answer-short-question",
    title: "Answer Short Question",
    instruction: "Answer the question with a single word or a few words.",
    prepTime: 3,
    recordTime: 10,
    difficulty: "medium",
    content: {
      question: "What do you call a doctor who performs surgeries?",
      expectedAnswer: "surgeon"
    }
  },
  {
    id: "asq-8",
    type: "answer-short-question",
    title: "Answer Short Question",
    instruction: "Answer the question with a single word or a few words.",
    prepTime: 3,
    recordTime: 10,
    difficulty: "medium",
    content: {
      question: "What is the hardest natural substance on Earth?",
      expectedAnswer: "diamond"
    }
  },
  {
    id: "asq-9",
    type: "answer-short-question",
    title: "Answer Short Question",
    instruction: "Answer the question with a single word or a few words.",
    prepTime: 3,
    recordTime: 10,
    difficulty: "medium",
    content: {
      question: "What is the study of ancient life through fossils called?",
      expectedAnswer: "paleontology"
    }
  },
  {
    id: "asq-10",
    type: "answer-short-question",
    title: "Answer Short Question",
    instruction: "Answer the question with a single word or a few words.",
    prepTime: 3,
    recordTime: 10,
    difficulty: "medium",
    content: {
      question: "What organ in the human body produces insulin?",
      expectedAnswer: "pancreas"
    }
  },
  // Hard
  {
    id: "asq-11",
    type: "answer-short-question",
    title: "Answer Short Question",
    instruction: "Answer the question with a single word or a few words.",
    prepTime: 3,
    recordTime: 10,
    difficulty: "hard",
    content: {
      question: "What is the term for a word that has the same spelling but different meanings?",
      expectedAnswer: "homonym"
    }
  },
  {
    id: "asq-12",
    type: "answer-short-question",
    title: "Answer Short Question",
    instruction: "Answer the question with a single word or a few words.",
    prepTime: 3,
    recordTime: 10,
    difficulty: "hard",
    content: {
      question: "What economic term describes a prolonged period of declining prices?",
      expectedAnswer: "deflation"
    }
  },
  {
    id: "asq-13",
    type: "answer-short-question",
    title: "Answer Short Question",
    instruction: "Answer the question with a single word or a few words.",
    prepTime: 3,
    recordTime: 10,
    difficulty: "hard",
    content: {
      question: "What is the scientific study of earthquakes called?",
      expectedAnswer: "seismology"
    }
  },
  {
    id: "asq-14",
    type: "answer-short-question",
    title: "Answer Short Question",
    instruction: "Answer the question with a single word or a few words.",
    prepTime: 3,
    recordTime: 10,
    difficulty: "hard",
    content: {
      question: "What philosophical term refers to knowledge gained through experience?",
      expectedAnswer: "empiricism"
    }
  },
  {
    id: "asq-15",
    type: "answer-short-question",
    title: "Answer Short Question",
    instruction: "Answer the question with a single word or a few words.",
    prepTime: 3,
    recordTime: 10,
    difficulty: "hard",
    content: {
      question: "What is the psychological term for attributing human characteristics to non-human entities?",
      expectedAnswer: "anthropomorphism"
    }
  },

  // ================== SUMMARIZE SPOKEN TEXT - 6 Questions ==================
  // Easy
  {
    id: "sst-1",
    type: "summarize-spoken-text",
    title: "Summarize Spoken Text",
    instruction: "Listen to the recording and summarize what you heard in 50-70 words.",
    prepTime: 10,
    recordTime: 60,
    difficulty: "easy",
    content: {
      lectureContent: "Recycling is important for the environment. It reduces waste in landfills and conserves natural resources. Common recyclable items include paper, plastic, glass, and metal. Many cities have recycling programs that make it easy for residents to participate."
    }
  },
  {
    id: "sst-2",
    type: "summarize-spoken-text",
    title: "Summarize Spoken Text",
    instruction: "Listen to the recording and summarize what you heard in 50-70 words.",
    prepTime: 10,
    recordTime: 60,
    difficulty: "easy",
    content: {
      lectureContent: "Sleep is essential for good health. Adults need seven to nine hours of sleep each night. During sleep, the body repairs itself and the brain processes information from the day. Poor sleep can lead to health problems and difficulty concentrating."
    }
  },
  // Medium
  {
    id: "sst-3",
    type: "summarize-spoken-text",
    title: "Summarize Spoken Text",
    instruction: "Listen to the recording and summarize what you heard in 50-70 words.",
    prepTime: 10,
    recordTime: 60,
    difficulty: "medium",
    content: {
      lectureContent: "Urbanization is one of the defining trends of our time. More than half of the world's population now lives in cities, and this proportion is expected to increase to 68% by 2050. Cities offer economic opportunities, better healthcare, and educational facilities. However, rapid urbanization also brings challenges including overcrowding, pollution, and strain on infrastructure."
    }
  },
  {
    id: "sst-4",
    type: "summarize-spoken-text",
    title: "Summarize Spoken Text",
    instruction: "Listen to the recording and summarize what you heard in 50-70 words.",
    prepTime: 10,
    recordTime: 60,
    difficulty: "medium",
    content: {
      lectureContent: "The gig economy has transformed traditional employment patterns. Platforms like Uber and Fiverr connect workers with short-term contracts or freelance work. This offers flexibility for workers but raises concerns about job security and benefits. Governments worldwide are grappling with how to regulate these new forms of employment."
    }
  },
  // Hard
  {
    id: "sst-5",
    type: "summarize-spoken-text",
    title: "Summarize Spoken Text",
    instruction: "Listen to the recording and summarize what you heard in 50-70 words.",
    prepTime: 10,
    recordTime: 60,
    difficulty: "hard",
    content: {
      lectureContent: "The emergence of antibiotic-resistant bacteria represents one of the most pressing public health challenges. Overuse and misuse of antibiotics in medicine and agriculture have accelerated bacterial evolution. Superbugs like MRSA and drug-resistant tuberculosis are increasingly difficult to treat. New antimicrobial strategies, including bacteriophage therapy and CRISPR-based approaches, are being explored as alternatives to traditional antibiotics."
    }
  },
  {
    id: "sst-6",
    type: "summarize-spoken-text",
    title: "Summarize Spoken Text",
    instruction: "Listen to the recording and summarize what you heard in 50-70 words.",
    prepTime: 10,
    recordTime: 60,
    difficulty: "hard",
    content: {
      lectureContent: "Neural plasticity challenges the long-held assumption that brain structure is fixed after childhood. Research demonstrates that the brain continuously reorganizes itself by forming new neural connections throughout life. This has profound implications for stroke rehabilitation, learning in adulthood, and treating neurological disorders. Environmental enrichment and targeted training can induce significant structural changes in the brain."
    }
  },

  // ================== READ AND RETELL - 6 Questions ==================
  // Easy
  {
    id: "rar-1",
    type: "read-and-retell",
    title: "Read and Retell",
    instruction: "Read the passage silently, then retell it in your own words. You have 30 seconds to read.",
    prepTime: 30,
    recordTime: 40,
    difficulty: "easy",
    content: {
      text: "Coffee is one of the most popular beverages in the world. It is made from roasted coffee beans. Many people drink coffee in the morning to help them wake up. Coffee contains caffeine, which gives people energy."
    }
  },
  {
    id: "rar-2",
    type: "read-and-retell",
    title: "Read and Retell",
    instruction: "Read the passage silently, then retell it in your own words. You have 30 seconds to read.",
    prepTime: 30,
    recordTime: 40,
    difficulty: "easy",
    content: {
      text: "Honey is a natural sweetener made by bees. Bees collect nectar from flowers and convert it into honey. Honey has been used for thousands of years as food and medicine. It never spoils when stored properly."
    }
  },
  // Medium
  {
    id: "rar-3",
    type: "read-and-retell",
    title: "Read and Retell",
    instruction: "Read the passage silently, then retell it in your own words. You have 30 seconds to read.",
    prepTime: 30,
    recordTime: 40,
    difficulty: "medium",
    content: {
      text: "The Great Barrier Reef, located off the coast of Australia, is the world's largest coral reef system. It stretches over 2,300 kilometers and is home to thousands of species of marine life. The reef is facing serious threats from climate change, with rising water temperatures causing widespread coral bleaching."
    }
  },
  {
    id: "rar-4",
    type: "read-and-retell",
    title: "Read and Retell",
    instruction: "Read the passage silently, then retell it in your own words. You have 30 seconds to read.",
    prepTime: 30,
    recordTime: 40,
    difficulty: "medium",
    content: {
      text: "Electric vehicles are becoming increasingly popular as an alternative to traditional gasoline-powered cars. They produce zero direct emissions and are cheaper to operate. However, challenges remain regarding battery range, charging infrastructure, and the environmental impact of battery production and disposal."
    }
  },
  // Hard
  {
    id: "rar-5",
    type: "read-and-retell",
    title: "Read and Retell",
    instruction: "Read the passage silently, then retell it in your own words. You have 30 seconds to read.",
    prepTime: 30,
    recordTime: 40,
    difficulty: "hard",
    content: {
      text: "The concept of universal basic income has gained traction as automation threatens to displace workers across industries. Proponents argue it would provide economic security and reduce poverty. Critics contend it could discourage work and prove fiscally unsustainable. Pilot programs in Finland, Kenya, and elsewhere are providing empirical data to inform this debate."
    }
  },
  {
    id: "rar-6",
    type: "read-and-retell",
    title: "Read and Retell",
    instruction: "Read the passage silently, then retell it in your own words. You have 30 seconds to read.",
    prepTime: 30,
    recordTime: 40,
    difficulty: "hard",
    content: {
      text: "CRISPR-Cas9 gene editing technology has revolutionized biological research and holds immense therapeutic potential. It enables precise modifications to DNA sequences, offering possibilities for treating genetic disorders. However, ethical concerns about human germline editing and the potential for unintended consequences necessitate careful regulatory frameworks and ongoing public discourse."
    }
  },

  // ================== SUMMARIZE GROUP DISCUSSION - 6 Questions ==================
  // Easy
  {
    id: "sgd-1",
    type: "summarize-group-discussion",
    title: "Summarize Group Discussion",
    instruction: "Listen to the group discussion and summarize the main points in 60 seconds.",
    prepTime: 10,
    recordTime: 60,
    difficulty: "easy",
    content: {
      discussionContent: "Speaker 1: I think we should have more recycling bins in the office. Speaker 2: That's a good idea. We should also reduce paper usage. Speaker 1: Yes, we could use digital documents more. Speaker 2: And maybe have recycling workshops for staff."
    }
  },
  {
    id: "sgd-2",
    type: "summarize-group-discussion",
    title: "Summarize Group Discussion",
    instruction: "Listen to the group discussion and summarize the main points in 60 seconds.",
    prepTime: 10,
    recordTime: 60,
    difficulty: "easy",
    content: {
      discussionContent: "Student A: The library should have longer hours during exam period. Student B: I agree, especially on weekends. Student A: Maybe until midnight? Student B: That would be helpful. We could also use more study rooms."
    }
  },
  // Medium
  {
    id: "sgd-3",
    type: "summarize-group-discussion",
    title: "Summarize Group Discussion",
    instruction: "Listen to the group discussion and summarize the main points in 60 seconds.",
    prepTime: 10,
    recordTime: 60,
    difficulty: "medium",
    content: {
      discussionContent: "Manager: We need to improve team communication. How can we do this? Employee 1: Regular team meetings would help. We could have weekly check-ins. Employee 2: I think a shared project management tool would be useful for tracking tasks. Manager: Good suggestions. What about informal communication? Employee 1: A team chat channel for quick questions and updates. Employee 2: Yes, and maybe monthly team lunches to build relationships."
    }
  },
  {
    id: "sgd-4",
    type: "summarize-group-discussion",
    title: "Summarize Group Discussion",
    instruction: "Listen to the group discussion and summarize the main points in 60 seconds.",
    prepTime: 10,
    recordTime: 60,
    difficulty: "medium",
    content: {
      discussionContent: "Professor: Let's discuss the challenges of online learning. Student 1: The lack of face-to-face interaction makes it harder to stay engaged. Student 2: Technical issues can be frustrating, especially with poor internet. Professor: What about the benefits? Student 1: Flexibility is great - you can study at your own pace. Student 2: And recorded lectures mean you can review difficult concepts multiple times."
    }
  },
  // Hard
  {
    id: "sgd-5",
    type: "summarize-group-discussion",
    title: "Summarize Group Discussion",
    instruction: "Listen to the group discussion and summarize the main points in 60 seconds.",
    prepTime: 10,
    recordTime: 60,
    difficulty: "hard",
    content: {
      discussionContent: "Panelist 1: The rise of artificial intelligence in healthcare presents both opportunities and challenges. Diagnostic algorithms can analyze medical images with remarkable accuracy. Panelist 2: However, we must consider the ethical implications. Who is responsible when an AI makes an incorrect diagnosis? Panelist 3: There's also the issue of data privacy. These systems require vast amounts of patient data to train. Panelist 1: We need robust regulatory frameworks that balance innovation with patient protection. Panelist 2: And we shouldn't forget the importance of maintaining the human element in medicine."
    }
  },
  {
    id: "sgd-6",
    type: "summarize-group-discussion",
    title: "Summarize Group Discussion",
    instruction: "Listen to the group discussion and summarize the main points in 60 seconds.",
    prepTime: 10,
    recordTime: 60,
    difficulty: "hard",
    content: {
      discussionContent: "Expert 1: Climate migration is becoming a significant global issue. Rising sea levels and extreme weather events are displacing millions. Expert 2: The legal framework for climate refugees is inadequate. The 1951 Refugee Convention doesn't recognize environmental displacement. Expert 3: Developed nations need to accept responsibility given their historical emissions. Expert 1: We need proactive policies rather than reactive responses to these population movements. Expert 2: International cooperation is essential, but political will seems lacking."
    }
  },

  // ================== RESPOND TO SITUATION - 6 Questions ==================
  // Easy
  {
    id: "rts-1",
    type: "respond-to-situation",
    title: "Respond to Situation",
    instruction: "Listen to the situation and respond appropriately. You have 20 seconds to prepare and 40 seconds to speak.",
    prepTime: 20,
    recordTime: 40,
    difficulty: "easy",
    content: {
      situationContext: "You are a student. You missed a class yesterday and need to ask your classmate about the homework assignment. What would you say?"
    }
  },
  {
    id: "rts-2",
    type: "respond-to-situation",
    title: "Respond to Situation",
    instruction: "Listen to the situation and respond appropriately. You have 20 seconds to prepare and 40 seconds to speak.",
    prepTime: 20,
    recordTime: 40,
    difficulty: "easy",
    content: {
      situationContext: "You ordered a coffee, but the barista gave you the wrong drink. How would you politely explain the mistake and ask for the correct order?"
    }
  },
  // Medium
  {
    id: "rts-3",
    type: "respond-to-situation",
    title: "Respond to Situation",
    instruction: "Listen to the situation and respond appropriately. You have 20 seconds to prepare and 40 seconds to speak.",
    prepTime: 20,
    recordTime: 40,
    difficulty: "medium",
    content: {
      situationContext: "You are at a job interview. The interviewer asks why you left your previous position. Your previous job was eliminated due to company restructuring. How would you explain this professionally?"
    }
  },
  {
    id: "rts-4",
    type: "respond-to-situation",
    title: "Respond to Situation",
    instruction: "Listen to the situation and respond appropriately. You have 20 seconds to prepare and 40 seconds to speak.",
    prepTime: 20,
    recordTime: 40,
    difficulty: "medium",
    content: {
      situationContext: "You are a team leader. One of your team members has been consistently arriving late to meetings. How would you address this issue with them privately?"
    }
  },
  // Hard
  {
    id: "rts-5",
    type: "respond-to-situation",
    title: "Respond to Situation",
    instruction: "Listen to the situation and respond appropriately. You have 20 seconds to prepare and 40 seconds to speak.",
    prepTime: 20,
    recordTime: 40,
    difficulty: "hard",
    content: {
      situationContext: "You are presenting a proposal to senior management. Midway through your presentation, an executive challenges a key assumption in your data analysis. How would you respond professionally while maintaining confidence in your proposal?"
    }
  },
  {
    id: "rts-6",
    type: "respond-to-situation",
    title: "Respond to Situation",
    instruction: "Listen to the situation and respond appropriately. You have 20 seconds to prepare and 40 seconds to speak.",
    prepTime: 20,
    recordTime: 40,
    difficulty: "hard",
    content: {
      situationContext: "You are a project manager. A client is unhappy because a deliverable was delayed. The delay was partially due to late requirements from the client themselves. How would you address their concerns diplomatically while also highlighting the client's contribution to the delay?"
    }
  },
];

export function getQuestionsByType(type: TestType): SpeakingQuestion[] {
  return speakingQuestions.filter(q => q.type === type);
}

export function getQuestionsByDifficulty(difficulty: "easy" | "medium" | "hard"): SpeakingQuestion[] {
  return speakingQuestions.filter(q => q.difficulty === difficulty);
}

export function getQuestionsByTypeAndDifficulty(type: TestType, difficulty: "easy" | "medium" | "hard"): SpeakingQuestion[] {
  return speakingQuestions.filter(q => q.type === type && q.difficulty === difficulty);
}

export function getTestTypeInfo(type: TestType) {
  const info: Record<TestType, { name: string; description: string; icon: string }> = {
    "read-aloud": {
      name: "Read Aloud",
      description: "Read a text aloud with clear pronunciation and natural pacing",
      icon: "📖"
    },
    "repeat-sentence": {
      name: "Repeat Sentence",
      description: "Listen and repeat the sentence exactly as heard",
      icon: "🔁"
    },
    "describe-image": {
      name: "Describe Image",
      description: "Describe what you see in the image in detail",
      icon: "🖼️"
    },
    "retell-lecture": {
      name: "Re-tell Lecture",
      description: "Listen to a lecture and retell it in your own words",
      icon: "🎓"
    },
    "answer-short-question": {
      name: "Answer Short Question",
      description: "Answer the question with a word or short phrase",
      icon: "❓"
    },
    "summarize-spoken-text": {
      name: "Summarize Spoken Text",
      description: "Listen and provide a spoken summary",
      icon: "📝"
    },
    "read-and-retell": {
      name: "Read and Retell",
      description: "Read silently then retell in your own words",
      icon: "📚"
    },
    "summarize-group-discussion": {
      name: "Summarize Group Discussion",
      description: "Listen to a discussion and summarize key points",
      icon: "👥"
    },
    "respond-to-situation": {
      name: "Respond to Situation",
      description: "Respond appropriately to a given scenario",
      icon: "💬"
    }
  };
  return info[type];
}
