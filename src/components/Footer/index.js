import React from 'react';
import './style.css';

class Footer extends React.Component {
  render() {
    return (
      <div className="footer fixed-bottom">
          <h3> <a href="http://data.naturalcapitalproject.org/nightly-build/invest-users-guide/html/index.html"
            target="blank">InVEST User Guide</a> </h3>
      </div>
    );
  }
}

export default Footer;
