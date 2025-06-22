import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';

const getAuthHeaders = () => ({
  'x-access-token': localStorage.getItem('token'),
});

const API_BASE_URL = 'http://localhost:5000';

export default function StudyMaterials({ theme = "theme-default" }) {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [subjectName, setSubjectName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [files, setFiles] = useState([]);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subjects', { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch subjects.');
      const data = await response.json();
      setSubjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleSelectSubject = async (subject) => {
    setSelectedSubject(subject);
    if (!subject) {
      setFiles([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/subjects/${subject.id}/files`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch files.');
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      setError(err.message);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addSubject = async () => {
    if (!subjectName.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: subjectName }),
      });
      if (!response.ok) throw new Error('Failed to add subject.');
      setSubjectName("");
      fetchSubjects(); // Refresh subjects list
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async () => {
    if (!selectedSubject || !fileToUpload) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const response = await fetch(`/api/subjects/${selectedSubject.id}/files`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload file.');
      setFileToUpload(null);
      document.getElementById('file-input').value = null; // Clear file input
      fetchSubjects(); // Refresh subjects list to update count
      handleSelectSubject(selectedSubject); // Refresh file list
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`study-page-wrapper ${theme}`}>
      <div className="study-container">
        <h2 className="title">📚 Study Materials</h2>
        {error && <p className="error-message">{error}</p>}

        <div className="input-row">
          <input
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="New Subject Name"
            disabled={isLoading}
          />
          <button className="btn add" onClick={addSubject} disabled={isLoading}>
            {isLoading ? 'Adding...' : '👉 Add'}
          </button>
        </div>

        <div className="subject-list">
          {subjects.length === 0 ? (
            <p className="muted">No subjects yet. Add one to get started!</p>
          ) : (
            subjects.map((subj) => (
              <div
                key={subj.id}
                className={`subject-tab ${selectedSubject?.id === subj.id ? "active" : ""}`}
                onClick={() => handleSelectSubject(subj)}
              >
                {subj.name} ({subj.file_count})
              </div>
            ))
          )}
        </div>

        {selectedSubject && (
          <div className="upload-section">
            <h3>Upload to "{selectedSubject.name}"</h3>
            <input
              id="file-input"
              type="file"
              onChange={(e) => setFileToUpload(e.target.files[0])}
              disabled={isLoading}
            />
            <button className="btn upload" onClick={uploadFile} disabled={isLoading || !fileToUpload}>
              {isLoading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        )}

        {selectedSubject && (
          <div className="file-table">
            <h3>Files in "{selectedSubject.name}"</h3>
            {files.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Filename</th>
                    <th>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id}>
                      <td>{file.name}</td>
                      <td>
                        <a
                          href={`${API_BASE_URL}/uploads/${file.path.replace('\\', '/')}`}
                          className="btn link"
                          download
                        >
                          Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="muted">No files in this subject yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}