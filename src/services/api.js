import axios from 'axios';
import API_URL from '../config';

export const fetchQuestions = async (subject = null) => {
  try {
    let url = `${API_URL}/questions`;
    if (subject && subject !== 'random') {
      const subjectMap = {
        'math': 'Mathematics',
        'english': 'English', 
        'science': 'Science',
        'social': 'Social Studies',
        'sds': 'Social Studies',
        'ct': 'Creative and Technology Studies',
        'cts': 'Creative and Technology Studies'
      };
      
      const backendSubject = subjectMap[subject] || subject;
      url = `${API_URL}/questions/subject/${backendSubject}`;
    }
    
    console.log(`📡 Fetching: ${url}`);
    const response = await axios.get(url);
    
    let questions = [];
    if (Array.isArray(response.data)) {
      questions = response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      questions = response.data.data;
    } else {
      questions = [];
    }
    
    console.log(`✅ Got ${questions.length} questions`);
    return questions;
    
  } catch (error) {
    console.error('❌ Error:', error);
    return [];
  }
};

export const recordWrong = async (id) => {
  try {
    const response = await axios.post(`${API_URL}/questions/wrong/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error recording wrong answer:', error);
    return null;
  }
};

export const recordCorrect = async (id) => {
  try {
    const response = await axios.post(`${API_URL}/questions/correct/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error recording correct answer:', error);
    return null;
  }
};

export const saveProgress = async (progressData) => {
  try {
    const response = await axios.post(`${API_URL}/progress`, progressData);
    console.log('Progress saved:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error saving progress:', error);
    return null;
  }
};