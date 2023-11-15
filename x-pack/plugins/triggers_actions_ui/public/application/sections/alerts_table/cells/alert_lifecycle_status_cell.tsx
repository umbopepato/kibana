/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { AlertStatus, ALERT_FLAPPING, ALERT_STATUS } from '@kbn/rule-data-utils';
import React, { memo } from 'react';
import { EuiBadge } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { AlertLifecycleStatusBadge } from '../../../components/alert_lifecycle_status_badge';
import { CellComponentProps } from '../types';
import { DefaultCell } from './default_cell';
import { useAlertMutedState } from '../hooks/alert_mute/use_alert_muted_state';

const AlertLifecycleStatusCellComponent: React.FC<CellComponentProps> = (props) => {
  const { alert, showAlertStatusWithFlapping } = props;
  const { isMuted } = useAlertMutedState(alert);

  if (!showAlertStatusWithFlapping) {
    return null;
  }

  const alertStatus = alert[ALERT_STATUS] ?? [];

  if (Array.isArray(alertStatus) && alertStatus.length) {
    const flapping = alert[ALERT_FLAPPING] ?? [];

    return (
      <>
        <AlertLifecycleStatusBadge
          alertStatus={alertStatus.join() as AlertStatus}
          flapping={flapping[0]}
        />
        {isMuted && (
          <EuiBadge
            iconType="bellSlash"
            aria-label={i18n.translate('xpack.triggersActionsUI.sections.alertsTable.alertMuted', {
              defaultMessage: 'Alert muted',
            })}
          />
        )}
      </>
    );
  }

  return <DefaultCell {...props} />;
};

AlertLifecycleStatusCellComponent.displayName = 'AlertLifecycleStatusCell';

export const AlertLifecycleStatusCell = memo(AlertLifecycleStatusCellComponent);
