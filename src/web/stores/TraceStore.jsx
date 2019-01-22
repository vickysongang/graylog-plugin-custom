import Reflux from 'reflux';
import fetch from 'logic/rest/FetchProvider';
import Stack from 'utils/Stack';
const UserNotification = require('util/UserNotification');
const ApiRoutes = require('routing/ApiRoutes');
const URLUtils = require('util/URLUtils');
const StoreProvider = require('injection/StoreProvider');
const SearchStore = StoreProvider.getStore('Search');

export const TraceActions = Reflux.createActions({
    "getTraceDatas": {asyncResult : true},
});

export const TraceStore = Reflux.createStore({
    listenables: [TraceActions],
    traceDatas: undefined,

    getInitialState() {
        return {
            traceDatas: this.traceDatas,
        }
    },

    parseTraceDatas(messages) {
        let spans = [];
        messages.forEach((item) => {
            let message = item.message;
            let startTime = new Date(message.timestamp).getTime();
            let endTime = startTime + parseFloat(message['time-taken']) * 1000;
            let span = message;
            span.id = message._id + '-' +message.request;
            span.startTime = startTime;
            span.endTime = endTime;
            spans.push(span);
        });
        spans = spans.sort((span1, span2) => {
            if (span1.startTime !== span2.startTime) {
                return span1.startTime < span2.startTime ? -1 : 1;
            } else {
                return span1.endTime < span2.endTime ? 1 : -1;
            }
        })
        if (spans.length > 0) {
            let stack = new Stack();
            for (let i = 0; i< spans.length; i++) {
                if (i === 0) {
                    stack.push(spans[0]);
                } else {
                    let span = spans[i];
                    while (stack.length() > 0) {
                        let parent = stack.peek();
                        if (span.endTime <= parent.endTime) {
                            span.parentId = parent.id;
                            stack.push(span);
                            break;
                        } else {
                            stack.pop();
                        }
                    }
                    if (stack.length() === 0) {
                        stack.push(span);
                    }
                }
            }
        }
        console.log('messagesssssss:', spans);
        return spans;
    },

    getTraceDatas(ecid) {
        const originalSearchURLParams = SearchStore.getOriginalSearchURLParams();
        console.log("TraceStore originalSearchURLParams is:", originalSearchURLParams);
        const rangeType = originalSearchURLParams.get('rangetype');
        let timerange = {};
        switch (rangeType) {
            case 'relative':
                let range = originalSearchURLParams.get('relative');
                timerange['range'] = range < 86400 ? 86400 : range;
                break;
            case 'absolute':
                timerange['from'] = originalSearchURLParams.get('from');
                timerange['to'] = originalSearchURLParams.get('to');
                break;
            case 'keyword':
                timerange['keyword'] = originalSearchURLParams.get('keyword');
                break;
        }
        const q = !ecid ? '*' : "ecid:" + ecid;
        let url = ApiRoutes.UniversalSearchApiController.search(rangeType, q, timerange, null).url;
        url = URLUtils.qualifyUrl(url);
        const promise = fetch('GET', url);
        promise.then(
            response => {
                this.trigger({traceDatas: this.parseTraceDatas(response.messages)});
            },
            error => {
                UserNotification.error( 'Could not load trace datas:', error.message);
            }
        );

        TraceActions.getTraceDatas.promise(promise);
    }
});