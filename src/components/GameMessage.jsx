import React from 'react';

export default function GameMessage(props) {
  let { m_string } = props.message;
  return <div>{m_string}</div>;
}
