import React from 'react';
import './style.css';

class Navi extends React.Component {
  render() {
    const { title } = this.props;
    return (
      <div className="navbar navbar-expand flex-column flex-md-row bg-primary">
        <h1 className="navbar-brand mb-0">{title}</h1>
      </div>
    );
  }
}
export default Navi;
