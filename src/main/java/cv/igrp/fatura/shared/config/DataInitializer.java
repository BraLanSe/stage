package cv.igrp.fatura.shared.config;

import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrFaturaTipoEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrSerieEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrFaturaTipoRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrSerieRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Seeds reference data into the H2 in-memory database on startup.
 * Runs only when the target table is empty, so it is safe to restart.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final PrFaturaTipoRepository prFaturaTipoRepo;
    private final PrSerieRepository prSerieRepo;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedTiposFatura();
        seedSeries();
    }

    // ── pr_fatura_tipo ────────────────────────────────────────

    private void seedTiposFatura() {
        if (prFaturaTipoRepo.count() > 0) {
            log.debug("[DataInitializer] pr_fatura_tipo already seeded, skipping.");
            return;
        }

        // codigo max length = 10 chars (VARCHAR(10))
        List.of(
            new String[]{"FATURA",     "Fatura"},
            new String[]{"FAT_RECIBO", "Fatura-Recibo"},
            new String[]{"N_CREDITO",  "Nota de Crédito"},
            new String[]{"N_DEBITO",   "Nota de Débito"},
            new String[]{"RECIBO",     "Recibo"},
            new String[]{"TALAO",      "Talão de Venda"},
            new String[]{"F_PROFORMA", "Fatura Proforma"}
        ).forEach(pair -> {
            var entity = new PrFaturaTipoEntity();
            entity.setCodigo(pair[0]);
            entity.setDesig(pair[1]);
            prFaturaTipoRepo.save(entity);
        });

        log.info("[DataInitializer] Seeded {} tipos de fatura.", prFaturaTipoRepo.count());
    }

    // ── pr_serie ──────────────────────────────────────────────

    private void seedSeries() {
        if (prSerieRepo.count() > 0) {
            log.debug("[DataInitializer] pr_serie already seeded, skipping.");
            return;
        }

        var tipoFatura = prFaturaTipoRepo.findByCodigo("FATURA").orElse(null);

        List.of(
            new String[]{"FT-2025", "Série Faturas 2025"},
            new String[]{"FR-2025", "Série Faturas-Recibo 2025"},
            new String[]{"NC-2025", "Série Notas de Crédito 2025"}
        ).forEach(pair -> {
            var serie = new PrSerieEntity();
            serie.setCodigo(pair[0]);
            serie.setDesig(pair[1]);
            serie.setPrFaturaTipo(tipoFatura);
            prSerieRepo.save(serie);
        });

        log.info("[DataInitializer] Seeded {} séries.", prSerieRepo.count());
    }
}
