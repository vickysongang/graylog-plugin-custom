package org.graylog.plugins.custom.widget.strategy;

import com.google.common.collect.Maps;
import com.google.inject.assistedinject.Assisted;
import org.graylog2.dashboards.widgets.InvalidWidgetConfigurationException;
import org.graylog2.indexer.results.TermsResult;
import org.graylog2.indexer.searches.Searches;
import org.graylog2.plugin.dashboards.widgets.ComputationResult;
import org.graylog2.plugin.dashboards.widgets.WidgetStrategy;
import org.graylog2.plugin.indexer.searches.timeranges.TimeRange;

import javax.inject.Inject;
import java.util.Map;

import static com.google.common.base.Strings.isNullOrEmpty;

public class ChartWidgetStrategy implements WidgetStrategy {

    public interface Factory extends WidgetStrategy.Factory<ChartWidgetStrategy> {
        @Override
        ChartWidgetStrategy create(Map<String, Object> config, TimeRange timeRange, String widgetId);
    }

    public final int MAX_RESULTS = 500;
    private final Searches searches;
    private final ChartWidgetStrategyConfiguration configuration;

    @Inject
    public ChartWidgetStrategy(Searches searches, @Assisted Map<String, Object> config, @Assisted TimeRange timeRange, @Assisted String widgetId) throws InvalidWidgetConfigurationException {
        this.searches = searches;
        this.configuration = ChartWidgetStrategyConfiguration.create(config, timeRange);
    }

    @Override
    public ComputationResult compute() {
        String filter = null;
        String streamId = this.configuration.streamId();
        if (!isNullOrEmpty(streamId)) {
            filter = "streams:" + streamId;
        }

        final TermsResult terms = searches.terms(this.configuration.field(),
                MAX_RESULTS, this.configuration.query(), filter, this.configuration.timeRange());

        Map<String, Object> result = Maps.newHashMap();
        result.put("terms", terms.getTerms());
        result.put("total", terms.getTotal());
        result.put("other", terms.getOther());
        result.put("missing", terms.getMissing());

        return new ComputationResult(result, terms.tookMs());
    }
}
