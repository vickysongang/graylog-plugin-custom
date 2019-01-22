/**
 * This file is part of Graylog.
 *
 * Graylog is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Graylog is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Graylog.  If not, see <http://www.gnu.org/licenses/>.
 */
package org.graylog.plugins.custom.decorators;

import com.floreysoft.jmte.Engine;
import com.floreysoft.jmte.template.Template;
import com.floreysoft.jmte.template.VariableDescription;
import com.google.common.collect.ImmutableMap;
import com.google.inject.assistedinject.Assisted;
import org.graylog2.plugin.Message;
import org.graylog2.plugin.configuration.ConfigurationRequest;
import org.graylog2.plugin.configuration.fields.BooleanField;
import org.graylog2.plugin.configuration.fields.TextField;
import org.graylog2.plugin.decorators.SearchResponseDecorator;
import org.graylog2.rest.models.messages.responses.ResultMessageSummary;
import org.graylog2.rest.resources.search.responses.SearchResponse;
import org.graylog2.decorators.Decorator;

import javax.inject.Inject;
import java.util.*;
import java.util.stream.Collectors;

import static java.util.Objects.requireNonNull;

public class LinkFieldDecorator implements SearchResponseDecorator {

    private static final String CK_LINK_FIELD = "link_field";
    private static final String CK_TARGET_FIELD = "target_field";
    private static final String CK_TEXT_FIELD = "text_field";

    private final Template linkTemplate;
    private final String targetField;
    private final Template textTemplate;
    private final List<VariableDescription> usedVariables;

    public interface Factory extends SearchResponseDecorator.Factory {
        @Override
        LinkFieldDecorator create(Decorator decorator);

        @Override
        LinkFieldDecorator.Config getConfig();

        @Override
        LinkFieldDecorator.Descriptor getDescriptor();
    }

    public static class Config implements SearchResponseDecorator.Config {

        @Override
        public ConfigurationRequest getRequestedConfiguration() {
            return new ConfigurationRequest() {
                {
                    addField(new TextField(
                            CK_LINK_FIELD,
                            "Link field",
                            "http://docs.graylog.org",
                            "The field is a hyperlink."
                    ));
                    addField(new TextField(
                            CK_TEXT_FIELD,
                            "Text field",
                            "Text",
                            "The field will be displayed in tag a."
                    ));
                    addField(new TextField(
                            CK_TARGET_FIELD,
                            "Target field",
                            "TargetFiledName",
                            "The field will be created with the hyperlink"
                    ));
                }
            };
        }
    }

    public static class Descriptor extends SearchResponseDecorator.Descriptor {
        public Descriptor() {
            super("Hyperlink String", "http://docs.graylog.org/", "Hyperlink string");
        }
    }

    @Inject
    public LinkFieldDecorator(@Assisted Decorator decorator, Engine templateEngine) {
        final String linkString = (String) requireNonNull(decorator.config().get(CK_LINK_FIELD),
                CK_LINK_FIELD + " cannot be null");
        final String textString = (String) decorator.config().get(CK_TEXT_FIELD);
        this.targetField = (String) requireNonNull(decorator.config().get(CK_TARGET_FIELD),
                CK_TARGET_FIELD + " cannot be null");
        linkTemplate = requireNonNull(templateEngine, "templateEngine").getTemplate(linkString);
        usedVariables = linkTemplate.getUsedVariableDescriptions();
        textTemplate = requireNonNull(templateEngine, "templateEngine").getTemplate(textString);
        usedVariables.addAll(textTemplate.getUsedVariableDescriptions());
    }

    @Override
    public SearchResponse apply(SearchResponse searchResponse) {
        List<ResultMessageSummary> summaries = searchResponse.messages();
        List<ResultMessageSummary> resultSummaries = new ArrayList<ResultMessageSummary>();
        for (ResultMessageSummary summary : summaries){
            final Message message = new Message(ImmutableMap.copyOf(summary.message()));

            if (usedVariables.size() > 0) {
                boolean flag = false;
                for (VariableDescription variable: usedVariables) {
                    if (!summary.message().containsKey(variable.name)) {
                        flag = true;
                        break;
                    }
                }
                if (flag) {
                    resultSummaries.add(summary.toBuilder().message(message.getFields()).build());
                    continue;
                }
            }
            final String linkString = linkTemplate.transform(summary.message(), Locale.ENGLISH);
            final String textString = textTemplate.transform(summary.message(), Locale.ENGLISH);
            final Map<String, String> decoratedField = new HashMap<>();
            decoratedField.put("type", "a");
            decoratedField.put("href", linkString);
            decoratedField.put("text", textString);
            message.addField(targetField, decoratedField);
            resultSummaries.add(summary.toBuilder().message(message.getFields()).build());
        }
        return searchResponse.toBuilder().messages(resultSummaries).build();
    }
}