import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

export default function StudyMaterials({theme = "theme-default" }) {
  const navigate = useNavigate(); // ✅ Move it here

  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem("studySubjects");
    return saved ? JSON.parse(saved) : {};
  });

  const [subjectName, setSubjectName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    localStorage.setItem("studySubjects", JSON.stringify(subjects));
  }, [subjects]);

  const addSubject = () => {
    if (!subjectName.trim()) return alert("Enter a subject name");
    if (subjects[subjectName]) return alert("Subject already exists");
    setSubjects({ ...subjects, [subjectName]: [] });
    setSubjectName("");
  };

  const deleteSubject = (subj) => {
    if (window.confirm(`Delete subject "${subj}" and all its files?`)) {
      const updated = { ...subjects };
      delete updated[subj];
      setSubjects(updated);
      if (selectedSubject === subj) setSelectedSubject(null);
    }
  };

  const uploadFile = () => {
    if (!selectedSubject) return alert("Select a subject");
    if (!file) return alert("Choose a file");

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      const updatedFiles = [
        ...subjects[selectedSubject],
        {
          name: file.name,
          data: base64,
          uploadedAt: new Date().toLocaleString(),
        },
      ];
      setSubjects({ ...subjects, [selectedSubject]: updatedFiles });
      setFile(null);
    };
    reader.readAsDataURL(file);
  };

  const downloadFile = (file) => {
    const link = document.createElement("a");
    link.href = file.data;
    link.download = file.name;
    link.click();
  };
  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left"></div>
        <div className="navbar-right">
          <button onClick={() => navigate("/")}>🏠 Home</button>
          <button onClick={() => navigate("/missed")}>⏰ Missed Tasks</button>
          <button onClick={() => navigate("/Stats")}>📊 Statistics</button>

        </div>
      </nav>
  
      {/* Main Content */}
      <div className={`study-page-wrapper ${theme}`}>
        <div className="study-container">
          <h2 className="title">📚 Study Materials</h2>
  
          <div className="input-row">
            <input
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="New Subject Name"
            />
            <button className="btn add" onClick={addSubject}>
            👉Add
            </button>
          </div>
  
          <div className="subject-list">
            {Object.keys(subjects).length === 0 ? (
              <p className="muted">No subjects yet</p>
            ) : (
              Object.keys(subjects).map((subj) => (
                <div
                  key={subj}
                  className={`subject-tab ${selectedSubject === subj ? "active" : ""}`}
                  onClick={() => setSelectedSubject(subj)}
                >
                  {subj}
                  <span
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSubject(subj);
                    }}
                  >
                    &times;
                  </span>
                </div>
              ))
            )}
          </div>
  
          {selectedSubject && (
            <div className="upload-section">
              <h3>Upload to "{selectedSubject}"</h3>
              <input type="file" onChange={(e) => setFile(e.target.files[0])} />
              <button className="btn upload" onClick={uploadFile}>
                Upload
              </button>
            </div>
          )}
  
          {selectedSubject && subjects[selectedSubject].length > 0 && (
            <div className="file-table">
              <h3>Files in "{selectedSubject}"</h3>
              <table>
                <thead>
                  <tr>
                    <th>Filename</th>
                    <th>Uploaded At</th>
                    <th>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects[selectedSubject].map((file, idx) => (
                    <tr key={idx}>
                      <td>{file.name}</td>
                      <td>{file.uploadedAt}</td>
                      <td>
                        <button className="btn link" onClick={() => downloadFile(file)}>
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
  
         
        </div>
      </div>
    </>
  );
}  