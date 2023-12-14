/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { lazy } from 'react';
import { i18n } from '@kbn/i18n';
import { RuleTypeModel } from '@kbn/triggers-actions-ui-plugin/public';
import { validateExpression } from './validation';
import { LambdaRuleParams } from './types';

export function getRuleType(): RuleTypeModel<LambdaRuleParams> {
  return {
    id: '.lambda',
    description: i18n.translate('xpack.stackAlerts.lambda.ui.alertType.descriptionText', {
      defaultMessage: 'Delegate the rule execution to an external HTTP endpoint.',
    }),
    iconClass: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI4LjIwMzEgMzAuODQ4NEMyNy4yMTgyIDMwLjg0ODQgMjYuMzY1OSAzMC41NDU0IDI1LjY0NjMgMjkuOTM5M0MyNC45MzYgMjkuMzIzOCAyNC4zMzQ3IDI4LjMyNDggMjMuODQyMyAyNi45NDIyTDE4LjQ3MyAxMS44NDI3TDE3LjcyMDEgMTAuMDM4OEwxNi40NzAxIDYuNjcyMjlDMTYuMDkxMyA1LjY3Nzk3IDE1LjY3OTQgNC45Mjk4NyAxNS4yMzQzIDQuNDI3OTdDMTQuNzg5MiAzLjkxNjYxIDE0LjI0OTUgMy42MTM1OCAxMy42MTUgMy41MTg4OEMxMi45ODA1IDMuNDE0NzIgMTIuMTk5MyAzLjQ3MTUzIDExLjI3MTIgMy42ODkzNEwxMC41ODk0IDEuNDQ1MDJDMTAuODA3MiAxLjM1OTc5IDExLjExOTcgMS4yNzkzIDExLjUyNjkgMS4yMDM1NEMxMS45MzQxIDEuMTI3NzggMTIuMzc5MiAxLjA4OTkgMTIuODYyMiAxLjA4OTlDMTQuMjgyNiAxLjA5OTM3IDE1LjQ1NjkgMS40NzM0MyAxNi4zODQ5IDIuMjEyMDZDMTcuMzEyOSAyLjk0MTIzIDE4LjA2NTggNC4wOTY1MyAxOC42NDM0IDUuNjc3OTdMMjYuMTg2IDI2LjE0NjdDMjYuNDUxMiAyNi44ODU0IDI2LjcxNjMgMjcuNDYzIDI2Ljk4MTUgMjcuODc5N0MyNy4yNTYxIDI4LjI4NjkgMjcuNjYzMyAyOC40OTA1IDI4LjIwMzEgMjguNDkwNUMyOC4zMTY3IDI4LjQ5MDUgMjguNDU0IDI4LjQ4MSAyOC42MTUgMjguNDYyMUMyOC43NzYgMjguNDQzMSAyOC45MTMzIDI4LjQyNDIgMjkuMDI2OSAyOC40MDUyTDI5LjYzNzcgMzAuNjc4QzI5LjQwMSAzMC43MzQ4IDI5LjE1OTUgMzAuNzc3NCAyOC45MTMzIDMwLjgwNThDMjguNjc2NiAzMC44NDM3IDI4LjQzOTggMzAuODU3OSAyOC4yMDMxIDMwLjg0ODRaIiBmaWxsPSIjMzQzNzQxIi8+CjxjaXJjbGUgY3g9IjMuODk5MDMiIGN5PSIxOC4zODY0IiByPSIxLjUzNjc3IiBmaWxsPSIjMzQzNzQxIi8+CjxwYXRoIGQ9Ik0xMC4yNzE0IDMwLjkxMDFMMTYuOTI0OCAxMi42Mjk4TDE4LjE4NyAxNi4xNzkyTDEyLjgyNTQgMzAuOTEwMUgxMC4yNzE0WiIgZmlsbD0iIzAwNzg3MSIvPgo8cGF0aCBkPSJNNS42ODI1MyAzMC45MTAxTDEzLjE1MjggMTAuNTI2OEgxNS42Mjc4TDguMjM2NTUgMzAuOTEwMUg1LjY4MjUzWiIgZmlsbD0iIzAwNzg3MSIvPgo8Y2lyY2xlIGN4PSIzLjg5OTAzIiBjeT0iMjUuNjUyMSIgcj0iMS41MzY3NyIgZmlsbD0iIzM0Mzc0MSIvPgo8L3N2Zz4K`,
    documentationUrl: (docLinks) => docLinks.links.alerting.indexThreshold,
    ruleParamsExpression: lazy(() => import('./expression')),
    validate: validateExpression,
    defaultActionMessage: i18n.translate(
      'xpack.stackAlerts.threshold.ui.alertType.defaultActionMessage',
      {
        defaultMessage: `Rule '\\{\\{rule.name\\}\\}' is active for group '\\{\\{context.group\\}\\}':

- Value: \\{\\{context.value\\}\\}
- Conditions Met: \\{\\{context.conditions\\}\\} over \\{\\{rule.params.timeWindowSize\\}\\}\\{\\{rule.params.timeWindowUnit\\}\\}
- Timestamp: \\{\\{context.date\\}\\}`,
      }
    ),
    requiresAppContext: false,
  };
}
