import { FEATURE } from '../config.js';
import * as localAdapter from './adapters/localAdapter.js';
import * as apiAdapter from './adapters/apiAdapter.js';

export const dataProvider = FEATURE.USE_API ? apiAdapter : localAdapter;

