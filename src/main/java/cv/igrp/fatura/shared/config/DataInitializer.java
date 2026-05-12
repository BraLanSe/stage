package cv.igrp.fatura.shared.config;

import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.ClienteEntity;
import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.FornecedorEntity;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.ClienteRepository;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.FornecedorRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrEnquadramentoEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrFaturaTipoEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrSerieEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrEnquadramentoRepository;
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

    private final PrEnquadramentoRepository prEnquadramentoRepo;
    private final PrFaturaTipoRepository prFaturaTipoRepo;
    private final PrSerieRepository prSerieRepo;
    private final ClienteRepository clienteRepo;
    private final FornecedorRepository fornecedorRepo;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedEnquadramentos();
        seedTiposFatura();
        seedSeries();
        seedDemoClientes();
        seedDemoFornecedores();
    }

    // ── pr_enquadramento ──────────────────────────────────────

    private void seedEnquadramentos() {
        if (prEnquadramentoRepo.count() > 0) {
            log.debug("[DataInitializer] pr_enquadramento already seeded, skipping.");
            return;
        }

        List.of(
            new String[]{"CO",         "Contabilidade Organizada",                        null},
            new String[]{"RS",         "Regime Simplificado",                             null},
            new String[]{"ISENTO",     "Isento",                                          "Entidade isenta de IVA"},
            new String[]{"PC",         "Pequeno Contribuinte",                            "Regime de pequeno contribuinte"},
            new String[]{"REMP",       "Regime Especial das Micro e Pequenas Empresas",   "Taxa de IVA reduzida a 4%"}
        ).forEach(row -> {
            var e = new PrEnquadramentoEntity();
            e.setCodigo(row[0]);
            e.setDesig(row[1]);
            e.setDescr(row[2]);
            prEnquadramentoRepo.save(e);
        });

        log.info("[DataInitializer] Seeded {} enquadramentos.", prEnquadramentoRepo.count());
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

    // ── demo clientes ─────────────────────────────────────────

    private void seedDemoClientes() {
        if (clienteRepo.count() > 0) {
            log.debug("[DataInitializer] clientes already seeded, skipping.");
            return;
        }
        record C(String codigo, String desig, String nif, boolean coletivo) {}
        List.of(
            new C("C-00000001", "Empresa Demo Lda",       "500000001", true),
            new C("C-00000002", "João Silva",              "123456789", false),
            new C("C-00000003", "Cabo Verde Serviços SA",  "500000002", true)
        ).forEach(c -> {
            var e = new ClienteEntity();
            e.setCodigo(c.codigo());
            e.setDesig(c.desig());
            e.setNif(c.nif());
            e.setIndColetivo(c.coletivo());
            e.setAplicarImpostos(true);
            e.setEstado("ATIVO");
            e.setPais("CPV");
            clienteRepo.save(e);
        });
        log.info("[DataInitializer] Seeded {} demo clientes.", clienteRepo.count());
    }

    // ── demo fornecedores ─────────────────────────────────────

    private void seedDemoFornecedores() {
        if (fornecedorRepo.count() > 0) {
            log.debug("[DataInitializer] fornecedores already seeded, skipping.");
            return;
        }
        record F(String codigo, String desig, String nif) {}
        List.of(
            new F("F-00000001", "Fornecedor Alpha Lda",  "600000001"),
            new F("F-00000002", "Importações Beta SA",   "600000002")
        ).forEach(f -> {
            var e = new FornecedorEntity();
            e.setCodigo(f.codigo());
            e.setDesig(f.desig());
            e.setNif(f.nif());
            e.setIndColetivo(true);
            e.setAplicarImpostos(true);
            e.setEstado("ATIVO");
            e.setPais("CPV");
            fornecedorRepo.save(e);
        });
        log.info("[DataInitializer] Seeded {} demo fornecedores.", fornecedorRepo.count());
    }
}
