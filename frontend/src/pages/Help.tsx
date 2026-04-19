import './Help.css';

const FAQ_ITEMS = [
  {
    k: 'q1',
    q: 'How do I submit a new regional plan?',
    a: 'Navigate to the Dashboard and click the "New Plan" button. Follow the 5-step wizard to enter your project details, organizational structure, lead roles, and budget tasks. Once finished, click "Submit for Review".'
  },
  {
    k: 'q2',
    q: 'Can I edit a plan after submission?',
    a: 'No, once a plan is submitted, it enters the review phase. If changes are needed, an Executive must reject the plan, which will return it to your "Drafts" for editing.'
  },
  {
    k: 'q3',
    q: 'What is the "Export PDF" feature?',
    a: 'This allows you to generate a printable version of your dashboard or any specific regional report for offline presentation or archiving.'
  },
  {
    k: 'q4',
    q: 'Who can approve my reports?',
    a: 'Reports are reviewed and approved by members of the Executive team. Admins also have the ability to manage all system data but primarily focus on platform configuration.'
  }
];

export default function Help() {
  return (
    <div className="help-page">
      <div className="help-page__header">
        <h1 className="help-page__title">Help Center</h1>
        <p className="help-page__subtitle">Everything you need to know about the Scripture Union Ethiopia reporting platform.</p>
      </div>

      <div className="help-page__content grid grid--2">
        <section className="help-section card">
          <div className="help-section__header">
            <span className="material-symbols-outlined">quiz</span>
            <h3>Frequently Asked Questions</h3>
          </div>
          <div className="faq-list">
            {FAQ_ITEMS.map(item => (
              <div key={item.k} className="faq-item">
                <h4 className="faq-item__question">{item.q}</h4>
                <p className="faq-item__answer">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="help-sidebar-container">
          <section className="help-section card">
            <div className="help-section__header">
              <span className="material-symbols-outlined">contact_support</span>
              <h3>Need Support?</h3>
            </div>
            <p className="mb-4">If you're experiencing technical difficulties or have specific questions not covered here, please contact our national office.</p>
            <div className="contact-info">
              <div className="contact-item">
                <span className="material-symbols-outlined">mail</span>
                <span>support@scriptureunionethiopia.org</span>
              </div>
              <div className="contact-item">
                <span className="material-symbols-outlined">call</span>
                <span>+251 11 XXX XXXX</span>
              </div>
            </div>
          </section>

          <section className="help-section card mt-6">
            <div className="help-section__header">
              <span className="material-symbols-outlined">menu_book</span>
              <h3>User Manuals</h3>
            </div>
            <ul className="manual-list">
              <li>
                <span className="material-symbols-outlined">description</span>
                <a href="#">Coordinator Guide (PDF)</a>
              </li>
              <li>
                <span className="material-symbols-outlined">description</span>
                <a href="#">Executive Review Process</a>
              </li>
              <li>
                <span className="material-symbols-outlined">admin_panel_settings</span>
                <a href="#">Admin Training Materials</a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
