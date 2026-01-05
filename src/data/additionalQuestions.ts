// Additional PTE UKVI questions based on 2025 test format
// These extend the existing question files with more realistic test content

export const additionalSpeakingQuestions = [
  // More Read Aloud questions
  {
    id: "ra-ukvi-1",
    type: "read-aloud",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    prepTime: 30,
    recordTime: 40,
    difficulty: "medium",
    content: {
      text: "The proliferation of digital technologies has fundamentally altered the landscape of modern education. Online learning platforms now offer unprecedented access to knowledge, enabling students from remote areas to participate in courses previously available only to urban populations."
    }
  },
  {
    id: "ra-ukvi-2",
    type: "read-aloud",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    prepTime: 30,
    recordTime: 40,
    difficulty: "hard",
    content: {
      text: "Contemporary architectural practices increasingly incorporate sustainable design principles, recognizing the imperative to minimize environmental impact while maximizing occupant comfort. Green building certifications have become standard benchmarks for evaluating construction quality."
    }
  },
  {
    id: "ra-ukvi-3",
    type: "read-aloud",
    title: "Read Aloud",
    instruction: "Read the text aloud as naturally as possible. You have 30 seconds to prepare.",
    prepTime: 30,
    recordTime: 40,
    difficulty: "medium",
    content: {
      text: "International trade agreements facilitate economic cooperation between nations while establishing frameworks for dispute resolution. These multilateral arrangements have become increasingly complex as global supply chains expand across multiple jurisdictions."
    }
  },

  // More Repeat Sentence questions
  {
    id: "rs-ukvi-1",
    type: "repeat-sentence",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    prepTime: 3,
    recordTime: 15,
    difficulty: "medium",
    content: {
      text: "The university has announced a new scholarship program for international students starting next semester."
    }
  },
  {
    id: "rs-ukvi-2",
    type: "repeat-sentence",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    prepTime: 3,
    recordTime: 15,
    difficulty: "hard",
    content: {
      text: "Archaeological evidence suggests that ancient civilizations developed sophisticated agricultural techniques thousands of years before previously thought."
    }
  },
  {
    id: "rs-ukvi-3",
    type: "repeat-sentence",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    prepTime: 3,
    recordTime: 15,
    difficulty: "medium",
    content: {
      text: "The laboratory results confirmed the hypothesis regarding the effectiveness of the new treatment protocol."
    }
  },
  {
    id: "rs-ukvi-4",
    type: "repeat-sentence",
    title: "Repeat Sentence",
    instruction: "Listen to the sentence and repeat it exactly as you heard it.",
    prepTime: 3,
    recordTime: 15,
    difficulty: "easy",
    content: {
      text: "Please remember to bring your student identification card to the examination hall."
    }
  },

  // More Describe Image questions
  {
    id: "di-ukvi-1",
    type: "describe-image",
    title: "Describe Image",
    instruction: "Describe the image in detail. You have 25 seconds to study the image and 40 seconds to speak.",
    prepTime: 25,
    recordTime: 40,
    difficulty: "medium",
    content: {
      imageUrl: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800",
      imageDescription: "A stacked bar chart comparing smartphone market share across different brands (Apple, Samsung, Xiaomi, Others) from 2019 to 2023, showing Samsung and Apple dominating with roughly equal shares."
    }
  },
  {
    id: "di-ukvi-2",
    type: "describe-image",
    title: "Describe Image",
    instruction: "Describe the image in detail. You have 25 seconds to study the image and 40 seconds to speak.",
    prepTime: 25,
    recordTime: 40,
    difficulty: "hard",
    content: {
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
      imageDescription: "A flowchart depicting the water treatment process from collection through purification to distribution, with multiple stages including filtration, chemical treatment, and quality testing."
    }
  },

  // More Retell Lecture questions
  {
    id: "rl-ukvi-1",
    type: "retell-lecture",
    title: "Re-tell Lecture",
    instruction: "Listen to the lecture and re-tell it in your own words. You have 10 seconds to prepare after the audio ends.",
    prepTime: 10,
    recordTime: 40,
    difficulty: "medium",
    content: {
      lectureContent: "Today I want to discuss the phenomenon of urbanization and its impact on traditional communities. As cities expand, rural populations migrate seeking employment and educational opportunities. This movement has both positive and negative consequences. On one hand, urban areas offer better healthcare facilities and diverse employment options. On the other hand, traditional customs and community bonds often weaken as families become geographically dispersed."
    }
  },
  {
    id: "rl-ukvi-2",
    type: "retell-lecture",
    title: "Re-tell Lecture",
    instruction: "Listen to the lecture and re-tell it in your own words. You have 10 seconds to prepare after the audio ends.",
    prepTime: 10,
    recordTime: 40,
    difficulty: "hard",
    content: {
      lectureContent: "The development of renewable energy sources represents one of the most significant technological shifts of our era. Solar panel efficiency has improved dramatically over the past decade, while manufacturing costs have decreased by nearly 90 percent. Wind power has similarly advanced, with offshore turbines now capable of generating enough electricity for thousands of homes. However, the intermittent nature of these sources presents challenges for grid stability, driving innovation in battery storage technology."
    }
  },

  // More Answer Short Question
  {
    id: "asq-ukvi-1",
    type: "answer-short-question",
    title: "Answer Short Question",
    instruction: "Listen to the question and give a short answer.",
    prepTime: 3,
    recordTime: 10,
    difficulty: "easy",
    content: {
      question: "What do you call a person who writes articles for newspapers?",
      expectedAnswer: "journalist"
    }
  },
  {
    id: "asq-ukvi-2",
    type: "answer-short-question",
    title: "Answer Short Question",
    instruction: "Listen to the question and give a short answer.",
    prepTime: 3,
    recordTime: 10,
    difficulty: "easy",
    content: {
      question: "What instrument is used to measure temperature?",
      expectedAnswer: "thermometer"
    }
  },
  {
    id: "asq-ukvi-3",
    type: "answer-short-question",
    title: "Answer Short Question",
    instruction: "Listen to the question and give a short answer.",
    prepTime: 3,
    recordTime: 10,
    difficulty: "medium",
    content: {
      question: "What term describes the study of the Earth's physical features and atmosphere?",
      expectedAnswer: "geography"
    }
  },
];

export const additionalWritingQuestions = [
  // More Summarize Written Text
  {
    id: "swt-ukvi-1",
    type: "summarize-written-text",
    title: "Summarize Written Text",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "medium",
    content: {
      sourceText: "The global economy is experiencing a significant transformation as emerging markets become increasingly influential. Countries such as China, India, and Brazil have seen remarkable economic growth, shifting the balance of global trade. This development has led to new opportunities for international business but also created challenges for traditional economic powers. Understanding these dynamics is crucial for businesses seeking to expand their operations internationally."
    }
  },
  {
    id: "swt-ukvi-2",
    type: "summarize-written-text",
    title: "Summarize Written Text",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "hard",
    content: {
      sourceText: "Artificial intelligence is revolutionizing healthcare delivery across multiple dimensions. Machine learning algorithms can now analyze medical imaging with accuracy comparable to trained radiologists, while natural language processing enables efficient extraction of insights from clinical notes. Predictive models help identify patients at risk of developing chronic conditions, allowing for preventive interventions. However, concerns about data privacy, algorithmic bias, and the potential displacement of healthcare workers require careful consideration as these technologies are integrated into clinical practice."
    }
  },
  {
    id: "swt-ukvi-3",
    type: "summarize-written-text",
    title: "Summarize Written Text",
    instruction: "Read the passage and summarize it in ONE sentence (5-75 words).",
    timeLimit: 600,
    minWords: 5,
    maxWords: 75,
    difficulty: "medium",
    content: {
      sourceText: "Climate change mitigation requires a multi-faceted approach involving governments, businesses, and individuals. Transitioning to renewable energy sources such as solar and wind power reduces greenhouse gas emissions from the electricity sector. Improving energy efficiency in buildings and transportation further decreases carbon footprints. Additionally, protecting and restoring forests helps absorb carbon dioxide from the atmosphere. International cooperation through agreements like the Paris Accord establishes frameworks for coordinated global action."
    }
  },

  // More Write Essay
  {
    id: "we-ukvi-1",
    type: "write-essay",
    title: "Write Essay",
    instruction: "Write an essay of 200-300 words on the given topic.",
    timeLimit: 1200,
    minWords: 200,
    maxWords: 300,
    difficulty: "medium",
    content: {
      essayPrompt: "Some employers believe that formal academic qualifications are more important than life experience or personal qualities when selecting candidates. To what extent do you agree with this view?"
    }
  },
  {
    id: "we-ukvi-2",
    type: "write-essay",
    title: "Write Essay",
    instruction: "Write an essay of 200-300 words on the given topic.",
    timeLimit: 1200,
    minWords: 200,
    maxWords: 300,
    difficulty: "hard",
    content: {
      essayPrompt: "The increasing automation of manufacturing processes has led to concerns about widespread unemployment. However, others argue that technological advancement always creates new job opportunities. Examine both perspectives and provide your own assessment of how society should prepare for this transition."
    }
  },
  {
    id: "we-ukvi-3",
    type: "write-essay",
    title: "Write Essay",
    instruction: "Write an essay of 200-300 words on the given topic.",
    timeLimit: 1200,
    minWords: 200,
    maxWords: 300,
    difficulty: "medium",
    content: {
      essayPrompt: "Many countries are investing heavily in renewable energy sources while others continue to rely on fossil fuels. What factors influence a nation's energy policy, and what should be the priorities for the future?"
    }
  },
];

export const additionalReadingQuestions = [
  // More MC Single
  {
    id: "mc-single-ukvi-1",
    type: "mc-single",
    title: "Global Trade Impact",
    instruction: "Read the passage and answer the multiple-choice question below by selecting the best answer.",
    difficulty: "medium",
    content: {
      passage: `Global trade patterns have shifted dramatically in recent decades with the rise of Asian economies. China has become the world's largest exporter, while traditional manufacturing powerhouses in Europe and North America have seen their relative importance decline. This shift has had profound implications for employment, with many workers in developed countries experiencing job losses in manufacturing sectors.

The response to these changes has varied. Some countries have invested heavily in education and retraining programs, seeking to equip their workforce with skills suited to the knowledge economy. Others have pursued protectionist policies, imposing tariffs and trade barriers to shield domestic industries from foreign competition. The effectiveness of these different approaches remains a subject of ongoing debate among economists.`,
      question: "According to the passage, what has been one response to changes in global trade patterns?",
      options: [
        { id: "a", text: "Increasing manufacturing output" },
        { id: "b", text: "Investment in education and retraining programs" },
        { id: "c", text: "Reducing exports to Asian countries" },
        { id: "d", text: "Eliminating all trade agreements" }
      ],
      correctAnswers: ["b"]
    },
    timeLimit: 120
  },
  {
    id: "mc-single-ukvi-2",
    type: "mc-single",
    title: "Healthcare Innovation",
    instruction: "Read the passage and answer the multiple-choice question below by selecting the best answer.",
    difficulty: "hard",
    content: {
      passage: `Telemedicine has emerged as a transformative force in healthcare delivery, particularly following the global pandemic. Remote consultations allow patients to receive medical advice without visiting a clinic, reducing travel time and potential exposure to infectious diseases. Advanced video conferencing technology enables physicians to conduct visual examinations, while connected devices can transmit vital signs in real-time.

Despite these advantages, telemedicine faces significant challenges. Not all medical conditions can be adequately assessed remotely; physical examinations remain necessary for many diagnoses. Furthermore, access to the required technology is not universal, potentially creating disparities in healthcare access based on socioeconomic status or geographic location. Regulatory frameworks are still adapting to this new model of care, with questions remaining about licensing, liability, and reimbursement.`,
      question: "What is identified as a primary challenge for telemedicine according to the passage?",
      options: [
        { id: "a", text: "Lack of physician interest in remote consultations" },
        { id: "b", text: "The inability to perform physical examinations remotely" },
        { id: "c", text: "High costs of video conferencing equipment" },
        { id: "d", text: "Patient resistance to new technology" }
      ],
      correctAnswers: ["b"]
    },
    timeLimit: 150
  },

  // More MC Multiple
  {
    id: "mc-multiple-ukvi-1",
    type: "mc-multiple",
    title: "Sustainable Agriculture",
    instruction: "Read the passage and select ALL the correct answers. More than one response is correct.",
    difficulty: "medium",
    content: {
      passage: `Sustainable agriculture practices are gaining importance as the global population grows and climate change threatens food security. Organic farming methods reduce reliance on synthetic pesticides and fertilizers, protecting soil health and water quality. Crop rotation helps maintain soil nutrients naturally while reducing pest populations. Cover cropping prevents erosion and adds organic matter to the soil.

Modern sustainable farms often integrate technology with traditional practices. Precision agriculture uses sensors and data analytics to optimize irrigation and fertilizer application, reducing waste while maintaining yields. Some farmers are adopting agroforestry, which combines trees with crops to create more diverse and resilient ecosystems. These approaches aim to produce food efficiently while preserving environmental resources for future generations.`,
      question: "According to the passage, what are benefits or features of sustainable agriculture practices?",
      options: [
        { id: "a", text: "Protection of soil health and water quality" },
        { id: "b", text: "Use of precision agriculture technology" },
        { id: "c", text: "Higher short-term profits than conventional farming" },
        { id: "d", text: "Prevention of erosion through cover cropping" },
        { id: "e", text: "Complete elimination of all pest problems" }
      ],
      correctAnswers: ["a", "b", "d"]
    },
    timeLimit: 150
  },

  // More Reorder Paragraphs
  {
    id: "reorder-ukvi-1",
    type: "reorder-paragraphs",
    title: "Economic Development",
    instruction: "The text boxes below have been placed in random order. Restore the original order by dragging the text boxes to their correct positions.",
    difficulty: "hard",
    content: {
      paragraphs: [
        { id: "p1", text: "Economic development is a complex process that involves the transformation of a society's productive capacity and standard of living." },
        { id: "p2", text: "Initially, most developing economies rely heavily on agriculture and the extraction of natural resources." },
        { id: "p3", text: "As development progresses, manufacturing sectors typically expand, providing employment and generating exports." },
        { id: "p4", text: "Eventually, service industries come to dominate the economy, including finance, healthcare, and technology." },
        { id: "p5", text: "Throughout this process, improvements in education and infrastructure are essential to sustain growth and reduce inequality." }
      ],
      correctOrder: ["p1", "p2", "p3", "p4", "p5"]
    },
    timeLimit: 180
  },

  // More Fill Blanks
  {
    id: "fill-drag-ukvi-1",
    type: "fill-blanks-drag",
    title: "Climate Science",
    instruction: "Below is a text with blanks. Drag words from the box below to fill in the blanks.",
    difficulty: "medium",
    content: {
      passage: `Climate scientists use sophisticated computer [BLANK1] to predict future weather patterns and long-term climate trends. These tools process vast amounts of [BLANK2] collected from satellites, weather stations, and ocean buoys. The accuracy of predictions has improved [BLANK3] over recent decades, though uncertainty remains for long-term forecasts.

Understanding climate change requires [BLANK4] between multiple scientific disciplines. Atmospheric scientists, oceanographers, and geologists all contribute to our knowledge of how the Earth's climate system works. This [BLANK5] research helps policymakers make informed decisions about environmental protection.`,
      blanks: [
        { id: "b1", position: 1, correctAnswer: "models", options: ["models", "toys", "books", "chairs"] },
        { id: "b2", position: 2, correctAnswer: "data", options: ["data", "rumors", "opinions", "stories"] },
        { id: "b3", position: 3, correctAnswer: "significantly", options: ["significantly", "rarely", "never", "poorly"] },
        { id: "b4", position: 4, correctAnswer: "collaboration", options: ["collaboration", "competition", "isolation", "confusion"] },
        { id: "b5", position: 5, correctAnswer: "interdisciplinary", options: ["interdisciplinary", "simple", "unrelated", "outdated"] }
      ]
    },
    timeLimit: 180
  },
];

export const additionalListeningQuestions = [
  // More Highlight Correct Summary
  {
    id: "highlight-summary-ukvi-1",
    type: "highlight-correct-summary",
    title: "Digital Transformation",
    instruction: "You will hear a recording. Click on the paragraph that best relates to the recording.",
    difficulty: "medium",
    content: {
      audioText: `The digital transformation of business operations has accelerated dramatically in recent years. Companies across all industries are adopting cloud computing, artificial intelligence, and automation to improve efficiency and reduce costs. Small businesses that once lacked access to sophisticated technology can now use affordable software solutions to compete with larger organizations. However, this shift also requires workers to continuously update their skills. Those who fail to adapt may find themselves displaced by automated systems or left behind as industries evolve.`,
      options: [
        { id: "a", text: "Digital transformation is slowing down as businesses find new technology too expensive. Large corporations are abandoning cloud computing in favor of traditional systems." },
        { id: "b", text: "Businesses across industries are embracing digital technologies for efficiency gains, benefiting small businesses but requiring workforce adaptation to avoid displacement." },
        { id: "c", text: "Only large corporations can afford digital transformation, leaving small businesses unable to compete in the modern marketplace." },
        { id: "d", text: "Automation has completely replaced human workers in most industries, leading to unprecedented unemployment rates globally." }
      ],
      correctAnswers: ["b"]
    },
    timeLimit: 180,
    audioPlayLimit: 1
  },

  // More MC Single Listening
  {
    id: "mc-single-listen-ukvi-1",
    type: "mc-single-listening",
    title: "University Research",
    instruction: "Listen to the recording and answer the multiple-choice question by selecting the best response.",
    difficulty: "medium",
    content: {
      audioText: `Research funding at universities has become increasingly competitive in recent years. Government grants, which were once the primary source of research support, now represent a smaller proportion of overall funding. Universities are turning to industry partnerships, private foundations, and philanthropic donations to support their research activities. This diversification of funding sources has advantages, including greater financial stability and opportunities for practical application of research. However, critics worry that reliance on private funding may influence research priorities, potentially directing attention away from fundamental science toward more commercially viable projects.`,
      question: "According to the speaker, what is a concern about relying on private research funding?",
      options: [
        { id: "a", text: "It may reduce the quality of research" },
        { id: "b", text: "It could influence research priorities toward commercial interests" },
        { id: "c", text: "Private donors are unreliable sources of funding" },
        { id: "d", text: "It increases competition among researchers" }
      ],
      correctAnswers: ["b"]
    },
    timeLimit: 120,
    audioPlayLimit: 1
  },

  // More Write from Dictation
  {
    id: "dictation-ukvi-1",
    type: "write-from-dictation",
    title: "Academic Statement",
    instruction: "You will hear a sentence. Type the sentence in the text box below. Write the response as you hear it.",
    difficulty: "medium",
    content: {
      audioText: "The laboratory equipment must be calibrated before each experimental procedure begins.",
      dictationText: "The laboratory equipment must be calibrated before each experimental procedure begins."
    },
    timeLimit: 60,
    audioPlayLimit: 1
  },
  {
    id: "dictation-ukvi-2",
    type: "write-from-dictation",
    title: "Academic Statement",
    instruction: "You will hear a sentence. Type the sentence in the text box below. Write the response as you hear it.",
    difficulty: "hard",
    content: {
      audioText: "Contemporary architectural designs increasingly incorporate sustainable materials and energy-efficient technologies.",
      dictationText: "Contemporary architectural designs increasingly incorporate sustainable materials and energy-efficient technologies."
    },
    timeLimit: 60,
    audioPlayLimit: 1
  },
  {
    id: "dictation-ukvi-3",
    type: "write-from-dictation",
    title: "Academic Statement",
    instruction: "You will hear a sentence. Type the sentence in the text box below. Write the response as you hear it.",
    difficulty: "medium",
    content: {
      audioText: "Students should consult their academic advisors before registering for advanced courses.",
      dictationText: "Students should consult their academic advisors before registering for advanced courses."
    },
    timeLimit: 60,
    audioPlayLimit: 1
  },

  // More Fill Blanks Listening
  {
    id: "fill-listen-ukvi-1",
    type: "fill-blanks-listening",
    title: "Environmental Science",
    instruction: "You will hear a recording. Type the missing words in the blanks. Write only one word in each blank.",
    difficulty: "medium",
    content: {
      audioText: `Ocean acidification is one of the lesser-known consequences of increased carbon dioxide emissions. As the oceans absorb carbon dioxide from the atmosphere, chemical reactions lower the water's pH level. This acidification threatens marine ecosystems, particularly organisms that build shells or skeletons from calcium carbonate. Coral reefs and shellfish are especially vulnerable to these changes. Scientists are studying how different species may adapt to more acidic conditions, but many experts are concerned about the long-term impacts on marine biodiversity.`,
      transcript: `Ocean [BLANK1] is one of the lesser-known consequences of increased carbon dioxide emissions. As the oceans absorb carbon dioxide from the atmosphere, chemical [BLANK2] lower the water's pH level. This acidification threatens marine ecosystems, particularly organisms that build shells or skeletons from calcium [BLANK3]. Coral reefs and shellfish are especially [BLANK4] to these changes. Scientists are studying how different species may adapt to more acidic conditions, but many experts are concerned about the long-term impacts on marine [BLANK5].`,
      blanks: [
        { id: "b1", position: 1, correctAnswer: "acidification" },
        { id: "b2", position: 2, correctAnswer: "reactions" },
        { id: "b3", position: 3, correctAnswer: "carbonate" },
        { id: "b4", position: 4, correctAnswer: "vulnerable" },
        { id: "b5", position: 5, correctAnswer: "biodiversity" }
      ]
    },
    timeLimit: 180,
    audioPlayLimit: 1
  },

  // More Summarize Spoken Text
  {
    id: "summarize-spoken-ukvi-1",
    type: "summarize-spoken-text",
    title: "Urban Development",
    instruction: "You will hear a short lecture. Write a summary for a fellow student who was not present at the lecture. You should write 50-70 words.",
    difficulty: "hard",
    content: {
      audioText: `Urban planning in the 21st century faces unprecedented challenges. Cities are growing rapidly, particularly in developing regions, straining infrastructure and public services. Traffic congestion, air pollution, and inadequate housing affect quality of life for millions of urban residents.

Modern urban planners are adopting new approaches to address these issues. Mixed-use development, which combines residential, commercial, and recreational spaces, reduces the need for long commutes. Investment in public transportation offers alternatives to private vehicle use. Green infrastructure, including parks and urban forests, improves air quality and provides recreational opportunities.

Smart city technologies are also transforming urban management. Sensors monitor traffic flow, energy usage, and waste collection, allowing for more efficient resource allocation. However, implementing these solutions requires significant investment and political will. Successful urban development ultimately depends on balancing economic growth with environmental sustainability and social equity.`
    },
    timeLimit: 600,
    audioPlayLimit: 2
  },
];
