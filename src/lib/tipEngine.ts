export interface HomeAnalyticsData {
  avgScore: number;
  interviewCount: number;
  todaySessions: number;
  weakestCategory: string | null;
  strongestCategory: string | null;
  resumeSkills: string[];
}

export function generateTips(data: HomeAnalyticsData): string[] {
  const tips: string[] = [];

  // Interview count context
  if (data.interviewCount === 0) {
    tips.push("Upload your resume to start interview practice");
  } else if (data.interviewCount < 3) {
    tips.push("Keep going — complete a few more sessions to build momentum");
  }

  // Daily challenge
  if (data.todaySessions === 0) {
    tips.push("Complete 1 interview today to maintain your streak");
  } else if (data.todaySessions >= 3) {
    tips.push("Great work today — review your weakest answers");
  }

  // Score-based AI coaching message
  if (data.avgScore < 50) {
    tips.push("Let's rebuild your fundamentals step by step");
  } else if (data.avgScore >= 50 && data.avgScore <= 69) {
    tips.push("You're improving — keep practicing technical explanations");
  } else if (data.avgScore >= 70 && data.avgScore <= 85) {
    tips.push("Strong progress. Focus on system design depth");
  } else if (data.avgScore > 85) {
    tips.push("You're interview-ready — try advanced mock interviews");
  }

  // Weakest category deep-dives
  if (data.weakestCategory) {
    const weak = data.weakestCategory.toLowerCase();
    if (weak.includes("system design")) {
      tips.push("Practice scalability and distributed system questions");
    } else if (weak.includes("algorithm")) {
      tips.push("Review time complexity and edge cases carefully");
    } else if (weak.includes("database")) {
      tips.push("Practice SQL joins, indexes, and query optimisation");
    } else if (weak.includes("behavioral")) {
      tips.push("Use the STAR method for all behavioral answers");
    } else if (weak.includes("frontend")) {
      tips.push("Review React lifecycle, hooks, and state management");
    } else if (weak.includes("backend")) {
      tips.push("Study REST principles, caching, and API design");
    } else {
      tips.push(`Work on ${data.weakestCategory} questions to boost your overall score`);
    }
  }

  // Strongest category leverage
  if (data.strongestCategory && !data.strongestCategory.toLowerCase().includes("primary role")) {
    tips.push(`Your strength is ${data.strongestCategory} — highlight it confidently in interviews`);
  }

  // Resume skill-specific tips
  data.resumeSkills.forEach(skill => {
    const s = skill.toLowerCase();
    let tip = null;
    if (s.includes("react")) {
      tip = "Prepare to explain React component lifecycle and hooks";
    } else if (s.includes("docker")) {
      tip = "Be ready to explain container orchestration and Docker networking";
    } else if (s.includes("machine learning") || s === "ml") {
      tip = "Practice explaining model evaluation metrics and training strategies";
    } else if (s.includes("kubernetes")) {
      tip = "Know how Kubernetes schedules pods and handles scaling";
    } else if (s.includes("graphql")) {
      tip = "Understand how GraphQL schemas, resolvers, and N+1 problems work";
    } else if (s.includes("postgresql") || s.includes("mysql")) {
      tip = "Practice complex SQL queries with JOINs and window functions";
    } else if (s.includes("python")) {
      tip = "Know Python generators, decorators, and the GIL";
    } else if (s.includes("kotlin")) {
      tip = "Understand Kotlin coroutines, sealed classes, and extension functions";
    }
    
    if (tip) tips.push(tip);
  });

  // Universal fallback tips
  const fallbacks = [
    "Explain your thought process while solving problems",
    "Use the STAR method for behavioral answers",
    "Always explain trade-offs in your solutions",
    "Review your resume before each interview session",
    "Think aloud — interviewers value your reasoning",
    "Practice system design fundamentals daily"
  ];
  tips.push(...fallbacks);

  // Deduplicate and cap
  return Array.from(new Set(tips)).slice(0, 12);
}

export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  let salutation = "Good morning";
  if (hour >= 12 && hour < 18) salutation = "Good afternoon";
  else if (hour >= 18) salutation = "Good evening";
  
  return `${salutation}, ${name} 👋`;
}
