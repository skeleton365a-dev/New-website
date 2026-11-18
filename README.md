# Lahore Student Hub Pro — BISE Edition

A local-first React/Vite study workspace for students following Punjab / BISE Lahore classes 9, 10, 11 (1st year) and 12 (2nd year).

## Run in VS Code

1. Extract the ZIP file.
2. Open the extracted `student-hub-pro` folder in VS Code (the folder containing `package.json`).
3. Open Terminal → New Terminal.
4. Run:

```bash
npm install
npm run dev
```

5. Open the local URL printed in the terminal (usually `http://localhost:5173`).

## What's new in this BISE edition

- Separate Class 9, Class 10, Class 11 and Class 12 curriculum views.
- Subject catalogue with individual subject workspaces.
- Official PECTAA curriculum / smart-syllabus and BISE Lahore notification links.
- Import selectable-text PDF, TXT, Markdown and CSV material, tagged by class, subject and chapter.
- Chapter-specific quiz builder. It does not start a random sample quiz.
- MCQ generation uses only the imported chapter text and requires the student's own Gemini API key.
- Manual MCQ authoring and a saved question bank, each tied to class, subject and chapter.
- Answer review with correct option and explanation; quiz history is saved locally.
- Existing planner, notes, AI tutor, focus timer, flashcards, timetable, goals, tracker and backup tools remain.

## Importing a textbook or chapter

Open **Syllabus Library → Import / add chapters**. Select class, subject and chapter, then upload a selectable-text PDF or TXT/MD/CSV file. Importing one chapter at a time is recommended because browser storage is limited. Image-only/scanned PDFs need OCR before they can be used as text. PDF text extraction loads PDF.js from a CDN, so an internet connection is needed for PDF imports.

## Making a syllabus-based quiz

Open **Quiz Maker** and choose class → subject → chapter → imported source file. Choose question count and difficulty, then generate. A Gemini API key is required for AI-generated MCQs. Without a key, you can add your own MCQs to the chapter question bank and practise those. The app never fills the quiz with unrelated random questions.

AI-generated questions should be checked against the textbook and current board syllabus before relying on them for exam preparation.

## Official source portals

- PECTAA Curriculum & Compliance (Smart Syllabus AY 2026–27 and e-books): https://pectaa.edu.pk/curriculum-compliance/
- BISE Lahore notifications: https://biselahore.com/notifications
- eLearn Punjab: https://www.elearn.gov.pk/

The app links to official source portals rather than copying entire copyrighted textbooks or commercial key books into the project. Subject options depend on the student's registered group and current board rules. Always verify the applicable session and subject combination from official notifications.

## Data and privacy

Study files, questions, notes and progress are stored in the current browser's local storage. They are not synced between devices. Export a backup regularly. Imported files and API keys remain in that browser unless the user clears its data. For a public multi-user deployment, add authentication, a secure database, protected file storage and a server-side AI proxy; do not expose API keys in client code.
