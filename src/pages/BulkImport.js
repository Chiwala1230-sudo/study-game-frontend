import React, { useState } from 'react';
import api from '../services/api';

function BulkImport({ onBack }) {
  const [textInput, setTextInput] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);

  const parseQuestions = (text) => {
    const questions = [];
    const blocks = text.trim().split(/\n\s*\n/);

    for (const block of blocks) {
      const lines = block.trim().split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 3) continue;

      const questionText = lines[0].replace(/^\d+[.)]\s*/, '');
      const options = [];
      let correctAnswer = '';

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const answerMatch = line.match(/^(?:Answer|Correct)\s*:\s*(.+)/i);
        if (answerMatch) {
          correctAnswer = answerMatch[1].trim();
          continue;
        }
        const optionMatch = line.match(/^[a-dA-D][.)]\s*(.+)/);
        if (optionMatch) {
          const isCorrect = line.endsWith('*');
          const optionText = optionMatch[1].replace(/\*$/, '').trim();
          options.push(optionText);
          if (isCorrect) {
            correctAnswer = optionText;
          }
        }
      }

      if (questionText && options.length >= 2 && correctAnswer) {
        while (options.length < 4) options.push('');
        questions.push({
          subject,
          text: questionText,
          options: options.slice(0, 4),
          correctAnswer,
        });
      }
    }
    return questions;
  };

  const handleImport = async () => {
    const questions = parseQuestions(textInput);
    if (questions.length === 0) {
      alert('No valid questions found. Please check the format and try again.');
      return;
    }

    setImporting(true);
    let success = 0;
    let failed = 0;

    for (const question of questions) {
      try {
        await api.post('/questions', question);
        success++;
      } catch (err) {
        failed++;
      }
    }

    setResults({ success, failed, total: questions.length });
    setImporting(false);
  };

  const handleClear = () => {
    setTextInput('');
    setResults(null);
  };

  const exampleText = `1. What is 2 + 2?
a. 3
b. 4*
c. 5
d. 6
Answer: 4

2. What is the capital of Malawi?
a. Blantyre
b. Lilongwe*
c. Mzuzu
d. Zomba
Answer: Lilongwe`;

  return (
    <div style={styles.section}>
      <h2>📦 Bulk Import Questions</h2>
      <p style={styles.description}>
        Paste multiple questions below to import them all at once into the <strong>{subject}</strong> category.
      </p>

      <div style={styles.formatBox}>
        <h4>Format Guide:</h4>
        <pre style={styles.example}>{exampleText}</pre>
        <p style={styles.hint}>
          Separate each question with a blank line. Mark the correct answer with * after the option or use "Answer: ..." on its own line.
        </p>
      </div>

      <label style={styles.label}>Subject:</label>
      <select value={subject} onChange={(e) => setSubject(e.target.value)} style={styles.input}>
        <option>Mathematics</option>
        <option>English</option>
        <option>Science</option>
        <option>Social Studies</option>
        <option>Creative Arts</option>
      </select>

      <label style={styles.label}>Paste questions:</label>
      <textarea
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="Paste your questions here..."
        style={styles.textarea}
        rows={12}
      />

      <div style={styles.buttonRow}>
        <button onClick={handleImport} disabled={importing || !textInput.trim()} style={styles.importButton}>
          {importing ? 'Importing...' : `Import Questions`}
        </button>
        <button onClick={handleClear} style={styles.clearButton}>Clear</button>
        <button onClick={onBack} style={styles.backButton}>← Back to Questions</button>
      </div>

      {results && (
        <div style={results.failed > 0 ? styles.resultsWarning : styles.resultsSuccess}>
          <h3>Import Results</h3>
          <p>Total parsed: {results.total}</p>
          <p>Successfully imported: {results.success}</p>
          {results.failed > 0 && <p>Failed: {results.failed}</p>}
        </div>
      )}
    </div>
  );
}

const styles = {
  section: { background: 'white', padding: '20px', borderRadius: '10px' },
  description: { color: '#555', marginBottom: '15px' },
  formatBox: { background: '#f9f9f9', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px', marginBottom: '20px' },
  example: { background: '#fff', padding: '10px', borderRadius: '5px', fontSize: '13px', whiteSpace: 'pre-wrap', border: '1px solid #ddd' },
  hint: { fontSize: '12px', color: '#888', marginTop: '8px', marginBottom: '0' },
  label: { fontWeight: 'bold', display: 'block', marginBottom: '5px', marginTop: '10px' },
  input: { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', fontFamily: 'monospace', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' },
  buttonRow: { display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' },
  importButton: { background: '#4CAF50', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  clearButton: { background: '#ff9800', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  backButton: { background: '#666', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  resultsSuccess: { marginTop: '20px', padding: '15px', background: '#e8f5e9', border: '1px solid #4CAF50', borderRadius: '8px' },
  resultsWarning: { marginTop: '20px', padding: '15px', background: '#fff3e0', border: '1px solid #ff9800', borderRadius: '8px' },
};

export default BulkImport;
