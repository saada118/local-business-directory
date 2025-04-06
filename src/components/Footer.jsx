function Footer() {
    return (
      <footer className="bg-dark text-light py-5 mt-5">
        {/* Full-width wrapper with no horizontal padding */}
        <div className="w-100 text-center px-3">
  
          {/* Centered content inside */}
          <div className="d-flex align-items-center justify-content-center mb-3">
            <img
              src="/logo.png"
              alt="Logo"
              style={{
                width: '70px',
                height: '70px',
                marginRight: '16px',
              }}
            />
            <h2 className="mb-0 fw-bold" style={{ fontSize: '2.5rem' }}>
              LOCAL BIZ
            </h2>
          </div>
  
          <p className="fs-5 mb-0">For Locals To Meet Locals</p>
        </div>
      </footer>
    );
  }
  
  export default Footer;
  