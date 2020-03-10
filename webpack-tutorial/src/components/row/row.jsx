import React, { Component, } from 'react'; 
import PropTypes from 'prop-types';
import Clipboard from 'clipboard';

// import './row.scss';

class Row extends Component {
  constructor (props) {
    super(props);

    this.copyAction = null;
  }

  componentDidMount() {
    this.copyAction = new Clipboard(this.copy, {
      text: () => {
        return this.email.innerText;
      }
    });
  }

  componentWillUnmount() {
    this.copyAction.destroy();
  }

  render () {
    let name = this.props.mp.Contact.split(',');
    name = name.reverse().join(' ');

    return (
      <tr>
        <td>{name}</td>
        <td>{this.props.mp.Party}</td>
        <td>{this.props.mp.Electorate}</td>
        <td>
          <a href={'mailto:' + this.props.mp['Parliament Email']}>
            <span ref={(ref) => { this.email = ref; }}>{this.props.mp['Parliament Email']}</span>
          </a>
          <button className="copybutton btn btn-default" ref={(ref) => { this.copy = ref; }}>Copy</button>
        </td>
      </tr>
    );
  }
}

Row.propTypes = {
  mp: PropTypes.object.isRequired
};

export default Row;
