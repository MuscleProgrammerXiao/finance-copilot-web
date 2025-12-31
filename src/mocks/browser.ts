import { setupWorker } from 'msw/browser';
import { helloHandlers } from './handlers/hello.handler';

export const worker = setupWorker(...helloHandlers);
