import React, { useState } from 'react';
import api from '../services/api';

function BulkImport({ onBack }) {
  const [subject, setSubject] = useState('Creative Arts');
  const [questionsText, setQuestionsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({ success: [], failed: [] });

  const handleImport = async () => {
    setLoading(true);
    setResult({ success: [], failed: [] });
    
    const lines = questionsText.split('\n');
    let currentQuestion = {};
    const questions = [];
    
    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('Q:')) {
        if (currentQuestion.text) questions.push(currentQuestion);
        currentQuestion = { 
          subject, 
          text: line.substring(2).trim(), 
          options: [], 
          difficulty: 'Medium',
          explanation: ''
        };
      } else if (line.startsWith('1:')) {
        currentQuestion.options.push(line.substring(2).trim());
      } else if (line.startsWith('2:')) {
        currentQuestion.options.push(line.substring(2).trim());
      } else if (line.startsWith('3:')) {
        currentQuestion.options.push(line.substring(2).trim());
      } else if (line.startsWith('4:')) {
        currentQuestion.options.push(line.substring(2).trim());
      } else if (line.startsWith('A:')) {
        currentQuestion.correctAnswer = line.substring(2).trim();
      } else if (line.startsWith('E:')) {
        currentQuestion.explanation = line.substring(2).trim();
      }
    }
    if (currentQuestion.text) questions.push(currentQuestion);
    
    for (let q of questions) {
      try {
        await api.post('/questions', q);
        setResult(prev => ({ ...prev, success: [...prev.success, q.text.substring(0, 50)] }));
      } catch (error) {
        setResult(prev => ({ ...prev, failed: [...prev.failed, q.text.substring(0, 50)] }));
      }
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>📦 Bulk Import Questions</h1>
        <button onClick={onBack} style={styles.backButton}>← Back to Admin</button>
      </div>
      
      <div style={styles.card}>
        <label style={styles.label}>Select Subject:</label>
        <select value={subject} onChange={e => setSubject(e.target.value)} style={styles.select}>
          <option>Mathematics</option>
          <option>English</option>
          <option>Science</option>
          <option>Social Studies</option>
          <option>Creative Arts</option>
        </select>
        
        <label style={styles.label}>📝 Format your questions like this:</label>
        <div style={styles.example}>
          Q: What is the capital of Zambia?<br/>
          1: Lusaka<br/>
          2: Harare<br/>
          3: Lilongwe<br/>
          4: Gaborone<br/>
          A: Lusaka<br/>
          E: Lusaka is the capital city of Zambia! 🇿🇲<br/>
          <br/>
          Q: What is 15 × 8?<br/>
          1: 100<br/>
          2: 120<br/>
          3: 140<br/>
          4: 160<br/>
          A: 120<br/>
          E: 15 × 8 = 120. Think: 10×8=80, plus 5×8=40! ✨
        </div>
        
        <label style={styles.label}>📋 Paste your questions here:</label>
        <textarea
          value={questionsText}
          onChange={e => setQuestionsText(e.target.value)}
          placeholder="Paste your questions here..."
          style={styles.textarea}
          rows={15}
        />
        
        <button onClick={handleImport} disabled={loading} style={styles.importButton}>
          {loading ? '⏳ Importing...' : '📥 Import All Questions'}
        </button>
        
        {result.success.length > 0 && (
          <div style={styles.success}>
            <strong>✅ Successfully imported: {result.success.length} questions</strong>
          </div>
        )}
        
        {result.failed.length > 0 && (
          <div style={styles.error}>
            <strong>❌ Failed to import: {result.failed.length} questions</strong>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '800px', margin: '0 auto', minHeight: '100vh', background: '#f9fafb' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
  backButton: { background: '#6b7280', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  card: { background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  label: { display: 'block', fontWeight: '600', marginBottom: '8px', marginTop: '16px', color: '#374151' },
  select: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '16px', fontSize: '14px' },
  example: { background: '#f3f4f6', padding: '12px', borderRadius: '8px', fontSize: '12px', marginBottom: '16px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' },
  textarea: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontFamily: 'monospace', fontSize: '12px', boxSizing: 'border-box' },
  importButton: { background: '#6366f1', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '16px', width: '100%', fontSize: '16px', fontWeight: '600' },
  success: { background: '#d1fae5', padding: '12px', borderRadius: '8px', marginTop: '16px', color: '#065f46' },
  error: { background: '#fee2e2', padding: '12px', borderRadius: '8px', marginTop: '16px', color: '#991b1b' }
};

export default BulkImport;