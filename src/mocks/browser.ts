import { setupWorker } from 'msw/browser';
import { helloHandlers } from './handlers/hello.handler';
import { customerHandlers } from './handlers/customer.handler';
import { financialReportHandlers } from './handlers/financial-report.handler';
import { reportSubmissionHandlers } from './handlers/report-submission.handler';

export const worker = setupWorker(
  ...helloHandlers,
  ...customerHandlers,
  ...financialReportHandlers,
  ...reportSubmissionHandlers
);
