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

import {errors as ProteusErrors} from '@wireapp/proteus';
import {URL_PATH, getWebsiteUrl} from '../../externalRoute';
import {t} from 'utils/LocalizerUtil';
import {printDevicesId} from 'utils/util';

window.z = window.z || {};
window.z.entity = z.entity || {};

z.entity.DecryptErrorMessage = class DecryptErrorMessage extends z.entity.Message {
  static get REMOTE_IDENTITY_CHANGED_ERROR() {
    return ProteusErrors.DecryptError.CODE.CASE_204.toString();
  }

  constructor() {
    super();
    this.super_type = z.message.SuperType.UNABLE_TO_DECRYPT;

    this.error_code = '';
    this.client_id = '';

    this.htmlCaption = ko.pureComputed(() => {
      const userName = this.user().first_name();
      const replaceHighlight = {
        '/highlight': '</span>',
        highlight: '<span class="label-bold-xs">',
      };

      return this.is_remote_identity_changed()
        ? t('conversationUnableToDecrypt2', userName, replaceHighlight)
        : t('conversationUnableToDecrypt1', userName, replaceHighlight);
    });

    this.link = ko.pureComputed(() => {
      const path = this.is_remote_identity_changed() ? URL_PATH.DECRYPT_ERROR_2 : URL_PATH.DECRYPT_ERROR_1;
      return getWebsiteUrl(path);
    });

    this.is_recoverable = ko.pureComputed(() => {
      return this.error_code.toString().startsWith('2') && !this.is_remote_identity_changed();
    });
    this.is_remote_identity_changed = ko.pureComputed(() => {
      return this.error_code.toString() === DecryptErrorMessage.REMOTE_IDENTITY_CHANGED_ERROR;
    });
    this.is_resetting_session = ko.observable(false);

    this.error_message = ko.pureComputed(() => {
      const parts = [];

      if (this.error_code) {
        const error_text = t('conversationUnableToDecryptErrorMessage');
        parts.push(`${error_text}: <span class='label-bold-xs'>${this.error_code}</span> `);
      }

      if (this.client_id) {
        parts.push(`ID: ${printDevicesId(this.client_id)}`);
      }

      if (parts.length) {
        return `(${parts.join('')})`;
      }
    });

    this.htmlErrorMessage = this.error_message;
  }
};
