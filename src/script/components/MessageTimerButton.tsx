/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import React from 'react';

import {t} from 'Util/LocalizerUtil';
import {formatDuration, DurationUnit} from 'Util/TimeUtil';
import {registerReactComponent} from 'Util/ComponentUtil';

import {EphemeralTimings} from '../ephemeral/EphemeralTimings';
import {Context} from '../ui/ContextMenu';
import type {Conversation} from '../entity/Conversation';
import NamedIcon from './NamedIcon';

export interface MessageTimerButtonProps {
  conversation: Conversation;
}

const MessageTimerButton: React.FC<MessageTimerButtonProps> = ({conversation}) => {
  const hasMessageTimer = !!conversation?.messageTimer();
  const isTimerDisabled = conversation?.hasGlobalMessageTimer();
  const duration = hasMessageTimer ? formatDuration(conversation.messageTimer()) : ({} as Partial<DurationUnit>);

  /** Click on ephemeral button */
  function onClick(event: React.MouseEvent<HTMLSpanElement, MouseEvent>): void {
    if (isTimerDisabled) {
      return event.preventDefault();
    }

    const entries = [
      {
        click: () => conversation.localMessageTimer(0),
        label: t('ephemeralUnitsNone'),
      },
    ].concat(
      EphemeralTimings.VALUES.map(milliseconds => {
        const {text} = formatDuration(milliseconds);

        return {
          click: () => conversation.localMessageTimer(milliseconds),
          label: text,
        };
      }),
    );

    Context.from(event, entries, 'message-timer-menu');
  }

  return (
    <span
      className="controls-right-button conversation-input-bar-message-timer"
      data-uie-name="do-set-ephemeral-timer"
      data-uie-value={isTimerDisabled ? 'disabled' : 'enabled'}
      id="conversation-input-bar-message-timer"
      onClick={onClick}
      title={t('tooltipConversationEphemeral')}
    >
      {hasMessageTimer && !!conversation && (
        <div
          className={`message-timer-button ${
            isTimerDisabled ? 'message-timer-button--disabled' : 'message-timer-button--enabled'
          }`}
        >
          <span className="message-timer-button-unit">{duration.symbol}</span>
          <span className="full-screen">{duration.value}</span>
        </div>
      )}
      {!hasMessageTimer && <NamedIcon name="timer-icon" className="button-icon-large" />}
    </span>
  );
};

export default MessageTimerButton;

registerReactComponent('message-timer-button', {
  component: MessageTimerButton,
  template: '<div data-bind="react: {conversation: ko.unwrap(conversation)}"></span>',
});
