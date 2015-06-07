// ES6 implementation of node_m_r

import either from 'either.js';
import _ from 'lodash';
import { InvalidDataAreaError, ReportNotFoundError } from '../errors';
import simulateAsynchronousIO from '../utils/simulateAsynchronousIO';

let singleton = Symbol();
let singletonEnforcer = Symbol()

export default class DocumentStore {

  static get instance() {
    if (!this[singleton]) {
      this[singleton] = new DocumentStore(singletonEnforcer);
    }
    return this[singleton];
  }

  constructor(enforcer) {
    if (enforcer != singletonEnforcer) {
      throw "Cannot construct singleton";
    }
    // POC: Note these are in-memory data stores
    // In a real app, we would access a database
    this._dataAreas = {
      PublishedProductsReports: [],
      ProductDetailsReports: [],
      ProductHeaderViewModels: []
    };
  }

  createDump() {
    return this._dataAreas;
  }

  getReportsCollectionFor(dataArea) {
    var reportsCollection = this._dataAreas[dataArea];

    if(reportsCollection)
      return either.right(reportsCollection);
    else
      return either.left(new InvalidDataAreaError('The specified data area is unknown.'));
  }

  getReport(dataArea, id, callback) {
    // Helps simulate using a real database instead of in-memory storage
    simulateAsynchronousIO(() => {
      this.getReportsCollectionFor(dataArea).fold(
        function left(error) {
          callback(error);
        },
        function right(reportsCollection) {
          var requestedReport = _.find(reportsCollection, function(report) {
            return report.id === id;
          });
          if (!requestedReport) {
            return callback('No record found for '+id+' in '+dataArea);
          }
          callback(null, requestedReport);
        }
      );
    });
  }

  insertReport(dataArea, report, callback) {
    // Helps simulate using a real database instead of in-memory storage
    simulateAsynchronousIO(() => {
      this.getReportsCollectionFor(dataArea).fold(
        function left(error) {
          callback(error);
        },
        function right(reportsCollection) {
          reportsCollection.push(report);
          callback();
        }
      );
    });
  }

  removeReport(dataArea, id, callback) {
    // Helps simulate using a real database instead of in-memory storage
    simulateAsynchronousIO(() => {
      this.getReportsCollectionFor(dataArea).fold(
        function left(error) {
          callback(error);
        },
        function right(reportsCollection) {
          _.remove(reportsCollection, function(report) {
            return report.id === id;
          });

          callback();
        }
      );
    });
  }

}
