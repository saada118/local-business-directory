import { Link } from 'react-router-dom';
import './PromotionBanner.css'; // 👈 CSS file for animations

function PromotionBanner() {
  return (
    <div className="promotion-banner bg-warning py-2 text-center">
      <Link to="/promotions" className="promotion-text text-dark text-decoration-none">
        <strong className="blinking-text">🎉 PROMOTIONS 🎉</strong>
      </Link>
    </div>
  );
}

export default PromotionBanner;

  