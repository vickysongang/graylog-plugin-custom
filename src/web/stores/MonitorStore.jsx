import Reflux from 'reflux';
const ApiRoutes = require('routing/ApiRoutes');
const URLUtils = require('util/URLUtils');
import fetch from 'logic/rest/FetchProvider';

export const MonitorActions = Reflux.createActions({
    "getMonitorDatas": {asyncResult: true},
});

export const MonitorStore = Reflux.createStore({
    listenables: [MonitorActions],
    monitorDatas: undefined,

    getInitialState() {
      return {
          monitorDatas: this.monitorDatas,
      }
    },

    getMonitorDatas() {
        let rangeType = 'relative';
        let timerange = {range: 86400, type : 'relative'};
        let sortOrder = 'desc';
        let field = 'app_pod';
        let streamId = null;
        let fetchAllUrl = ApiRoutes.UniversalSearchApiController.fieldTerms(rangeType, '*', field,sortOrder,1000,[], timerange, streamId).url;
        fetchAllUrl = URLUtils.qualifyUrl(fetchAllUrl);
        let promise1 = fetch('GET', fetchAllUrl);

        let fetchTimeoutUrl = ApiRoutes.UniversalSearchApiController.fieldTerms(rangeType, 'time-taken:>2 AND response:<500',field,sortOrder,1000,[], timerange, streamId).url;
        fetchTimeoutUrl = URLUtils.qualifyUrl(fetchTimeoutUrl);
        let promise2 = fetch('GET', fetchTimeoutUrl);

        let fetchFailUrl = ApiRoutes.UniversalSearchApiController.fieldTerms(rangeType, 'response:>=500', field,sortOrder,1000,[], timerange, streamId).url;
        fetchFailUrl = URLUtils.qualifyUrl(fetchFailUrl);
        let promise3 = fetch('GET', fetchFailUrl);

        let promise = Promise.all([promise1, promise2, promise3]).then((result) => {
            console.log('result is:', result);
            this.trigger({
                monitorDatas: result,
            });
        }).catch((error) => {
            console.log('getMonitorDatas error is:', error);
        })
        MonitorActions.getMonitorDatas.promise(promise);
    },

});