Chatbot Doc Assistant

A browser-based chatbot that extracts and answers questions from uploaded **DOCX**, **PDF**, and **Excel** files using JavaScript libraries. No backend or server required — runs entirely in the browser!

Features :
Upload and process DOCX, PDF or Excel (.xlsx) files.
Extracts file content using mammoth.js, pdf.js, and xlsx.js.
Asks and answers questions based on uploaded content.
Simple and interactive UI using pure HTML, CSS, and JavaScript.

Project Structure :

chatbot-doc-assistant/
  ├── index.html # Main interface
  ├── script.js # Core logic for chatbot interaction and file parsing
  ├── style.css # Styling
  └── libs/
        ├── mammoth.browser.min.js # DOCX parser
        ├── pdf.min.js # PDF parser
        └── xlsx.full.min.js # Excel parser

How to Use :
1. Open index.html in your browser.
2. Upload a document (DOCX, PDF, or XLSX).
3. Ask questions about the content – the chatbot will respond contextually
