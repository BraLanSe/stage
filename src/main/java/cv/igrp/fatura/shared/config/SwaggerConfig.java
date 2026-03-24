package cv.igrp.fatura.shared.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        security = { @SecurityRequirement(name = "bearerAuth") }
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT"
)
public class SwaggerConfig {

    @Value("${openapi.server.api:}")
    private String serverApiUrl; // fallback empty if not set

    @Bean
    public OpenApiCustomizer customOpenApi() {
        return openApi -> {
            if (serverApiUrl != null && !serverApiUrl.isBlank()) {
                openApi.getServers().clear();
                openApi.addServersItem(
                        new Server().url(serverApiUrl).description("Configured Server")
                );
            }
            // else → do nothing, swagger will auto-detect server URL
        };
    }

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("iGRP Project API")
                .version("1.0.0")
                .description("Automatically generated OpenAPI definition"));
    }
}