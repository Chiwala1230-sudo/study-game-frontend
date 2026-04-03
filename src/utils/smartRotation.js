// This analyzes her weak subjects and creates daily mandatory study plan
export const getSmartRotation = (weakSubjects, allSubjects) => {
  // weakSubjects comes from database: subjects she got wrong most often
  // Returns subjects she MUST study today
  
  const mandatorySubjects = [];
  
  // Prioritize subjects with highest wrong answer rate
  const sortedWeakSubjects = [...weakSubjects].sort((a, b) => b.wrongRate - a.wrongRate);
  
  // Take top 3 weakest subjects for today
  for (let i = 0; i < Math.min(3, sortedWeakSubjects.length); i++) {
    mandatorySubjects.push({
      subject: sortedWeakSubjects[i].subject,
      reason: `You got ${sortedWeakSubjects[i].wrongCount} wrong in this subject`,
      priority: i + 1
    });
  }
  
  // If no weak subjects (new user), rotate through all subjects
  if (mandatorySubjects.length === 0) {
    return allSubjects.slice(0, 3).map(s => ({ 
      subject: s, 
      reason: "New subject to master!",
      priority: 1 
    }));
  }
  
  return mandatorySubjects;
};

// Calculate daily score and rewards
export const calculateDailyReward = (score, thresholds) => {
  if (score >= thresholds.highScore) {
    return {
      reward: thresholds.highReward,
      penalty: 0,
      message: `🎉 Amazing! +K${thresholds.highReward} for scoring ${score}%!`,
      status: 'high'
    };
  } else if (score <= thresholds.lowScore) {
    return {
      reward: 0,
      penalty: thresholds.lowPenalty,
      message: `😢 Keep trying! -K${thresholds.lowPenalty} for scoring ${score}%. You'll do better tomorrow!`,
      status: 'low'
    };
  } else {
    return {
      reward: 0,
      penalty: 0,
      message: `👍 Good effort! ${score}%. Keep studying to earn rewards!`,
      status: 'normal'
    };
  }
};