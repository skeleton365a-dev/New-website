export const OFFICIAL_CURRICULUM_URL = 'https://pectaa.edu.pk/curriculum-compliance/';
export const BISE_NOTIFICATIONS_URL = 'https://biselahore.com/notifications';

// Subject catalogue is a starting index, not a claim that every student takes every elective.
export const CURRICULUM = {
  'Class 9': {
    group: ['Science', 'Humanities / Arts', 'Matric-Tech'],
    subjects: [
      { name: 'English', type: 'Compulsory' }, { name: 'Urdu', type: 'Compulsory' },
      { name: 'Tarjuma-tul-Quran', type: 'Compulsory' }, { name: 'Mathematics', type: 'Compulsory / group-dependent' },
      { name: 'Islamiyat', type: 'Compulsory' }, { name: 'Physics', type: 'Science elective' },
      { name: 'Chemistry', type: 'Science elective' }, { name: 'Biology', type: 'Science elective' },
      { name: 'Computer Science & Entrepreneurship', type: 'Science elective' },
      { name: 'General Science', type: 'Humanities option' }, { name: 'Education', type: 'Humanities option' },
      { name: 'Economics', type: 'Humanities option' }, { name: 'Civics', type: 'Humanities option' },
      { name: 'Geography', type: 'Humanities option' }, { name: 'History', type: 'Humanities option' },
      { name: 'Punjabi', type: 'Elective' }, { name: 'Arabic', type: 'Elective' },
      { name: 'Home Economics', type: 'Elective' }, { name: 'Art & Model Drawing', type: 'Elective' }
    ]
  },
  'Class 10': {
    group: ['Science', 'Humanities / Arts', 'Matric-Tech'],
    subjects: [
      { name: 'English', type: 'Compulsory' }, { name: 'Urdu', type: 'Compulsory' },
      { name: 'Tarjuma-tul-Quran', type: 'Compulsory' }, { name: 'Pakistan Studies', type: 'Compulsory' },
      { name: 'Mathematics', type: 'Compulsory / group-dependent' }, { name: 'Physics', type: 'Science elective' },
      { name: 'Chemistry', type: 'Science elective' }, { name: 'Biology', type: 'Science elective' },
      { name: 'Computer Science', type: 'Science elective' }, { name: 'General Science', type: 'Humanities option' },
      { name: 'Education', type: 'Humanities option' }, { name: 'Economics', type: 'Humanities option' },
      { name: 'Civics', type: 'Humanities option' }, { name: 'Geography', type: 'Humanities option' },
      { name: 'Punjabi', type: 'Elective' }, { name: 'Arabic', type: 'Elective' },
      { name: 'Home Economics', type: 'Elective' }, { name: 'Art & Model Drawing', type: 'Elective' }
    ]
  },
  'Class 11': {
    group: ['Pre-Medical', 'Pre-Engineering', 'ICS', 'Humanities / FA', 'Commerce'],
    subjects: [
      { name: 'English', type: 'Compulsory' }, { name: 'Urdu', type: 'Compulsory' },
      { name: 'Tarjuma-tul-Quran', type: 'Compulsory' }, { name: 'Physics', type: 'Science elective' },
      { name: 'Chemistry', type: 'Science elective' }, { name: 'Biology', type: 'Science elective' },
      { name: 'Mathematics', type: 'Science / ICS elective' }, { name: 'Computer Science', type: 'ICS elective' },
      { name: 'Statistics', type: 'ICS / elective' }, { name: 'Economics', type: 'Elective' },
      { name: 'Civics', type: 'Humanities elective' }, { name: 'Education', type: 'Humanities elective' },
      { name: 'Psychology', type: 'Humanities elective' }, { name: 'Islamic Studies', type: 'Elective' },
      { name: 'Punjabi', type: 'Elective' }, { name: 'Arabic', type: 'Elective' },
      { name: 'Accounting', type: 'Commerce elective' }, { name: 'Business Mathematics', type: 'Commerce elective' }
    ]
  },
  'Class 12': {
    group: ['Pre-Medical', 'Pre-Engineering', 'ICS', 'Humanities / FA', 'Commerce'],
    subjects: [
      { name: 'English', type: 'Compulsory' }, { name: 'Urdu', type: 'Compulsory' },
      { name: 'Tarjuma-tul-Quran', type: 'Compulsory' }, { name: 'Pakistan Studies', type: 'Compulsory' },
      { name: 'Physics', type: 'Science elective' }, { name: 'Chemistry', type: 'Science elective' },
      { name: 'Biology', type: 'Science elective' }, { name: 'Mathematics', type: 'Science / ICS elective' },
      { name: 'Computer Science', type: 'ICS elective' }, { name: 'Statistics', type: 'ICS / elective' },
      { name: 'Economics', type: 'Elective' }, { name: 'Civics', type: 'Humanities elective' },
      { name: 'Education', type: 'Humanities elective' }, { name: 'Psychology', type: 'Humanities elective' },
      { name: 'Islamic Studies', type: 'Elective' }, { name: 'Punjabi', type: 'Elective' },
      { name: 'Accounting', type: 'Commerce elective' }, { name: 'Business Statistics', type: 'Commerce elective' }
    ]
  }
};
