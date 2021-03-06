import React from 'react';
import classNames from 'classnames';
import { Spin } from 'choerodon-ui';
import Permission from '../permission';
import NoAccess from '../error-pages/403';

const spinStyle = {
  textAlign: 'center',
  paddingTop: 300,
};

const Page = ({ className, service, ...props }) => {
  const classString = classNames('page-container', className);
  const page = <div {...props} className={classString} />;
  if (service && service.length) {
    return (
      <Permission service={service} defaultChildren={<div style={spinStyle}><Spin size="large" /></div>} noAccessChildren={<NoAccess />}>
        {page}
      </Permission>
    );
  } else {
    return page;
  }
};

export default Page;
