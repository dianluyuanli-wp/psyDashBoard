import React from 'react';
import styles from './index.less';

interface AProps {
  text: string;
  [props: string]: any;
}

export function ActionText(props: AProps) {
  const { text, ...rest } = props;
  return (
    <span {...rest} className={styles.action}>
      {text}
    </span>
  );
};
