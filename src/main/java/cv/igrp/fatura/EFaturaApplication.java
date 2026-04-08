package cv.igrp.fatura;

import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import cv.igrp.fatura.shared.config.ApplicationAuditorAware;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "applicationAuditorAware")
public class EFaturaApplication {

    public static void main(String[] args) {
        SpringApplication.run(EFaturaApplication.class, args);
    }

    @Bean
    public ApplicationAuditorAware applicationAuditorAware() {
        return new ApplicationAuditorAware();
    }

    @Bean
    public Hibernate6Module hibernate6Module() {
        Hibernate6Module module = new Hibernate6Module();
        module.enable(Hibernate6Module.Feature.FORCE_LAZY_LOADING);
        return module;
    }
}