import _ from 'lodash';

import eventStore  from '../../eventStore';
import documentStore from '../../documentStore';
import dedent from './dedent';

let timeout = 1000;

export default function printCurrentStateOfTheApplication() {
  printEventStoreContent();

  // Give the report database some time to catch up
  setTimeout(() => printReportDatabaseContent(), timeout/2);
}

function printEventStoreContent() {
  printContentHeader('Event store');
  _.forEach(eventStore.createDump(), document => console.log(document.events));
}

function printReportDatabaseContent() {
  printContentHeader('Report database');
  console.log(documentStore.createDump());
}

function printContentHeader(message) {
  console.log(
    dedent`******************************************************
           ${message}
           ******************************************************`
  );
}
