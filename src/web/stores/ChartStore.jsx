import Reflux from 'reflux';
import fetch from 'logic/rest/FetchProvider';
const UserNotification = require('util/UserNotification');
const ApiRoutes = require('routing/ApiRoutes');
const URLUtils = require('util/URLUtils');

export const ChartActions = Reflux.createActions({
    "getChartDatas": {asyncResult: true},
});

export const ChartStore = Reflux.createStore({
    listenables: [ChartActions],
    chartDatas: undefined,

    getInitialState() {
        return {
            chartDatas: this.chartDatas,
        };
    },

    //type, query, field, order, size, stackedFields, timerange, streamId
    getChartDatas(query, field, rangeType, rangeParams, streamId, dimension) {
        let promise = undefined;
        const timerange = rangeType === 'relative' ? {range: rangeParams.relative} : rangeParams;
        const q = !query || query.length < 1 ? '*' : query;
        timerange.type = rangeType;
        console.log('query is:', q, "field is:", field, "rangeType is :", rangeType, "rangeParams is:", rangeParams, streamId);
        if (dimension === 'count') {
            let url = ApiRoutes.UniversalSearchApiController.fieldTerms(rangeType, q, field,'desc',1000,'', timerange, streamId).url;
            url = URLUtils.qualifyUrl(url);
            promise = fetch('GET', url);
            promise = promise.then(
                response => {
                    let terms = response.terms;
                    let xAxisDatas = [], yAxisDatas = [];
                    Object.keys(terms).forEach((key) => {
                        xAxisDatas.push(key);
                        yAxisDatas.push(terms[key]);
                    })
                    this.trigger({chartDatas: {
                            dimension: dimension,
                            xAxisDatas:xAxisDatas,
                            yAxisDatas:yAxisDatas,
                        }});
                },
                error => {
                    UserNotification.error('Could not load chart information:'+ error.message);
                }
            );
        } else if (dimension === 'ratio') {
            let url = ApiRoutes.UniversalSearchApiController.fieldTerms(rangeType, q, field,'desc',1000,'', timerange, streamId).url;
            url = URLUtils.qualifyUrl(url);
            promise = fetch('GET', url);
            let fetchAllUrl = ApiRoutes.UniversalSearchApiController.fieldTerms(rangeType, '*', field,'desc',1000,'', timerange, streamId).url;
            fetchAllUrl = URLUtils.qualifyUrl(fetchAllUrl);
            let promise1 = fetch('GET', fetchAllUrl);
            promise = Promise.all([promise, promise1]).then(
                response => {
                    let terms = response[0].terms;
                    let terms1 = response[1].terms;
                    let xAxisDatas = [], yAxisDatas = [];
                    Object.keys(terms).forEach((key) => {
                        xAxisDatas.push(key);
                        yAxisDatas.push(parseFloat((terms[key] / terms1[key]) * 100).toFixed(2));
                    })
                    this.trigger({chartDatas: {
                            dimension: dimension,
                            xAxisDatas:xAxisDatas,
                            yAxisDatas:yAxisDatas,
                        }});
                },
                error => {
                    UserNotification.error('Could not load chart information:'+ error.message);
                }
            )
        } else if (dimension === 'avgRespTime') {
            let url = ApiRoutes.UniversalSearchApiController.fieldTerms(rangeType, '*', field,'desc',1000,'time-taken', timerange, streamId).url;
            url = URLUtils.qualifyUrl(url);
            promise = fetch('GET', url);
            promise = promise.then(
                response => {
                    console.log("ssssss:", response);
                    this.trigger({chartDatas: response});
                },
                error => {
                    UserNotification.error('Could not load chart information:'+ error.message);
                }
            );
        }
        ChartActions.getChartDatas.promise(promise);
    },
});