package cv.igrp.fatura.shared.config;

import cv.igrp.framework.core.data.EnumItem;
import cv.igrp.framework.core.domain.IgrpEnum;
import cv.igrp.fatura.shared.domain.exceptions.IgrpResponseStatusException;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.PathItem;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AssignableTypeFilter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@Component
@ConditionalOnProperty(name = "igrp.enum.exposer.enabled", havingValue = "true")
public class IgrpEnumDynamicRestExposer<E extends Enum<E> & IgrpEnum<String>> {

  private static final Logger LOGGER = LoggerFactory.getLogger(IgrpEnumDynamicRestExposer.class);

  private final RequestMappingHandlerMapping handlerMapping;
  private final OpenAPI openAPI;

  private final Map<String, Class<? extends E>> enumMap = new HashMap<>();

  @Value("${igrp.enum.exposer.path}")
  private String igrpEnumExposerPath;

  public IgrpEnumDynamicRestExposer(@Qualifier("requestMappingHandlerMapping") RequestMappingHandlerMapping handlerMapping, OpenAPI openAPI) {
    this.handlerMapping = handlerMapping;
    this.openAPI = openAPI;
  }

  @PostConstruct
  public void registerEnumEndpoints() throws Exception {

    var scanner = new ClassPathScanningCandidateComponentProvider(false);
    scanner.addIncludeFilter(new AssignableTypeFilter(IgrpEnum.class));

    for (var bean : scanner.findCandidateComponents("")) {

      var clazz = Class.forName(bean.getBeanClassName());

      if (!clazz.isEnum() || !IgrpEnum.class.isAssignableFrom(clazz)) continue;

      var endpointName = clazz.getSimpleName();
      if (enumMap.containsKey(endpointName)) {
        LOGGER.warn("[IgrpEnum] Duplicate enum name '{}' found ({}). Skipping registration.", endpointName, clazz.getName());
        continue;
      }

      @SuppressWarnings("unchecked")
      var casted = (Class<? extends E>) clazz;

      enumMap.put(endpointName, casted);
      registerHandlerForEnum(endpointName);
      registerSwaggerPathForEnum(endpointName, casted);

      LOGGER.debug("[IgrpEnum] Registered dynamic enum endpoint for {}", clazz.getSimpleName());
    }

    LOGGER.info("[IgrpEnum] Total enums registered: {}", enumMap.size());
  }

  private void registerHandlerForEnum(String endpointName) throws Exception {

    var handlerMethod = this.getClass().getDeclaredMethod("handleEnumRequest", HttpServletRequest.class);

    var path = (igrpEnumExposerPath.startsWith("/") ? igrpEnumExposerPath : "/" + igrpEnumExposerPath) + "/" + endpointName;

    var mappingInfo = RequestMappingInfo
    .paths(path)
    .methods(RequestMethod.GET)
    .build();

    handlerMapping.registerMapping(mappingInfo, this, handlerMethod);
  }

  private void registerSwaggerPathForEnum(String endpointName, Class<? extends Enum<?>> enumClass) {
    try {

      var path = (igrpEnumExposerPath.startsWith("/") ? igrpEnumExposerPath : "/" + igrpEnumExposerPath) + "/" + endpointName;

      var operation = buildOperation(enumClass);

      openAPI.path(path, new PathItem().get(operation));

    } catch (Exception e) {
      LOGGER.warn("Failed to register enum '{}' in OpenAPI", endpointName, e);
    }
  }

  private Operation buildOperation(Class<? extends Enum<?>> enumClass) {
        return new Operation()
              .summary("Get values for enum `%s`".formatted(enumClass.getSimpleName()))
              .addTagsItem("iGRP Enums")
              .description("Returns all possible values of the enum `%s` with `code` and `description` fields.".formatted(enumClass.getName()))
              .responses(new ApiResponses()
                  .addApiResponse("200", new ApiResponse().description("Successful operation"))
                  .addApiResponse("404", new ApiResponse().description("Enum not found"))
              );
  }

  /**
  * Generic handler for all dynamically registered enum endpoints.
  */
  @ResponseBody
  public List<EnumItem<String>> handleEnumRequest(HttpServletRequest request) {

    var path = request.getRequestURI();
    var enumName = path.substring(path.lastIndexOf('/') + 1);

    Class<? extends E> enumClass = enumMap.get(enumName);
    if (enumClass == null)
      throw IgrpResponseStatusException.notFound("Enum not found for name: %s".formatted(enumName));

    return Stream.of(enumClass.getEnumConstants())
        .map(constant -> new EnumItem<>(constant.getCode(), constant.getDescription()))
        .toList();
  }
}