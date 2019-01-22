package org.graylog.plugins.custom.widget.strategy;

import com.google.auto.value.AutoValue;
import org.graylog2.plugin.indexer.searches.timeranges.TimeRange;

import javax.annotation.Nullable;
import java.util.Map;

@AutoValue
public abstract class ChartWidgetStrategyConfiguration {

    public abstract String query();

    @Nullable
    public abstract String streamId();

    public abstract String field();

    public abstract TimeRange timeRange();

    public static ChartWidgetStrategyConfiguration create(String query,
                                                          String streamId,
                                                          String field,
                                                          TimeRange timeRange) {
        return new AutoValue_ChartWidgetStrategyConfiguration(query, streamId, field, timeRange);
    }

    public static ChartWidgetStrategyConfiguration create(Map<String, Object> config,
                                                          TimeRange timeRange) {
        System.out.println("config is:"+ config);
        final String query = (String) config.get("query");
        final String streamId = (config.containsKey("stream_id") ? (String) config.get("stream_id") : null);
        final String field = (String) config.get("field");

        return ChartWidgetStrategyConfiguration.create(query, streamId, field, timeRange);
    }
}
