import { ReportNotFoundError } from '../errors';

export default function reportNotFound(aggregateRootId, callback) {
  let errorMessage = `The report with identifier ${aggregateRootId} could not be found in the data store.`;
  callback(new ReportNotFoundError(errorMessage));
}
