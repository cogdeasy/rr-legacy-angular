import './Footer.scss';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <span>&copy; {year} Rolls-Royce plc — Engine Operations Portal</span>
      <span className="footer-links">
        <a href="#">Airworthiness notices</a>
        <a href="#">Data handling</a>
        <a href="#">Support desk</a>
      </span>
    </footer>
  );
}
