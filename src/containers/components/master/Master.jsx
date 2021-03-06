/*eslint-disable*/
import React, { Component, createElement } from 'react';
import { inject, observer } from 'mobx-react';
import { Spin } from 'choerodon-ui';
import CommonMenu from '../menu';
import MasterHeader from '../header';
import './style';
import 'babel-polyfill';

const spinStyle = {
  textAlign: 'center',
  paddingTop: 300,
};

@inject('AppState')
@observer
class Masters extends Component {
  render() {
    const { AppState, AutoRouter } = this.props;
    return (
      AppState.isAuth ?
        <div className="page-wrapper">
          <div className="page-header">
            <MasterHeader />
          </div>
          <div className="page-body">
            <div className="content-wrapper">
              <div id="menu" className="c7n-menu">
                <CommonMenu />
              </div>
              <div id="autoRouter" className="content">
                <AutoRouter />
              </div>
            </div>
          </div>
        </div>
        : <div style={spinStyle}><Spin /></div>
    );
  }
}

export default Masters;
