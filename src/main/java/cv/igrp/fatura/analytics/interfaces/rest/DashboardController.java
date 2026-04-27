package cv.igrp.fatura.analytics.interfaces.rest;

import cv.igrp.fatura.analytics.application.dto.DashboardStatsDTO;
import cv.igrp.fatura.analytics.application.dto.TopProdutoDTO;
import cv.igrp.fatura.analytics.application.dto.VendasMensaisDTO;
import cv.igrp.fatura.analytics.application.dto.VendasPorMeioDTO;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.ClienteRepository;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.FornecedorRepository;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.ProdutoRepository;
import cv.igrp.fatura.compra.infrastructure.persistence.repository.FaturaCompraRepository;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaItemRepository;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Estatísticas agregadas do dashboard")
public class DashboardController {

    private static final String[] MONTH_NAMES =
            {"Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"};

    private static final Map<String, String> ESTADO_CORES = Map.of(
            "CONFIRMADO", "#10b981",
            "RASCUNHO",   "#f59e0b",
            "ANULADO",    "#ef4444"
    );

    private final FaturaVendaRepository faturaVendaRepo;
    private final FaturaCompraRepository faturaCompraRepo;
    private final FaturaVendaItemRepository faturaVendaItemRepo;
    private final ClienteRepository clienteRepo;
    private final FornecedorRepository fornecedorRepo;
    private final ProdutoRepository produtoRepo;

    @GetMapping("/stats")
    @Operation(summary = "Estatísticas gerais para o dashboard")
    public ResponseEntity<DashboardStatsDTO> stats() {
        int ano = LocalDate.now().getYear();

        // ── Counts ───────────────────────────────────────────────
        long totalClientes    = clienteRepo.count();
        long totalFornecedores = fornecedorRepo.count();
        long totalProdutos    = produtoRepo.count();

        // ── Financial totals ──────────────────────────────────────
        BigDecimal totalVendas  = orZero(faturaVendaRepo.sumTotalVendas());
        BigDecimal totalDespesas = orZero(faturaCompraRepo.sumTotalDespesas());
        BigDecimal ganhoLucro   = totalVendas.subtract(totalDespesas);

        // ── Monthly grid (12 months of current year) ──────────────
        Map<Integer, BigDecimal> vendasByMonth  = toMonthMap(faturaVendaRepo.findMensaisConfirmadas(ano));
        Map<Integer, BigDecimal> comprasByMonth = toMonthMap(faturaCompraRepo.findMensaisConfirmadas(ano));

        List<VendasMensaisDTO> vendasMensais = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            vendasMensais.add(new VendasMensaisDTO(
                    MONTH_NAMES[m - 1],
                    vendasByMonth.getOrDefault(m, BigDecimal.ZERO),
                    comprasByMonth.getOrDefault(m, BigDecimal.ZERO)
            ));
        }

        // ── Estado breakdown (mapped to vendasPorMeio for donut) ──
        List<VendasPorMeioDTO> vendasPorMeio = new ArrayList<>();
        for (Object[] row : faturaVendaRepo.countByEstado()) {
            String estado = (String) row[0];
            long count    = ((Number) row[1]).longValue();
            vendasPorMeio.add(new VendasPorMeioDTO(
                    estadoLabel(estado),
                    BigDecimal.valueOf(count),
                    ESTADO_CORES.getOrDefault(estado, "#6b7280")
            ));
        }

        // ── Top 5 products ────────────────────────────────────────
        List<TopProdutoDTO> topProdutos = new ArrayList<>();
        for (Object[] row : faturaVendaItemRepo.findTopProdutos(PageRequest.of(0, 5))) {
            topProdutos.add(new TopProdutoDTO(
                    (String) row[0],
                    orZero((BigDecimal) row[1]),
                    orZero((BigDecimal) row[2])
            ));
        }

        return ResponseEntity.ok(DashboardStatsDTO.builder()
                .totalClientes(totalClientes)
                .totalFornecedores(totalFornecedores)
                .totalProdutos(totalProdutos)
                .totalVendas(totalVendas)
                .totalDespesas(totalDespesas)
                .ganhoLucro(ganhoLucro)
                .vendasMensais(vendasMensais)
                .vendasPorMeio(vendasPorMeio)
                .topProdutos(topProdutos)
                .build());
    }

    // ── helpers ───────────────────────────────────────────────────

    private static BigDecimal orZero(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }

    private static Map<Integer, BigDecimal> toMonthMap(List<Object[]> rows) {
        Map<Integer, BigDecimal> map = new HashMap<>();
        for (Object[] row : rows) {
            int month       = ((Number) row[1]).intValue();
            BigDecimal total = orZero((BigDecimal) row[2]);
            map.put(month, total);
        }
        return map;
    }

    private static String estadoLabel(String estado) {
        return switch (estado) {
            case "CONFIRMADO" -> "Confirmado";
            case "RASCUNHO"   -> "Rascunho";
            case "ANULADO"    -> "Anulado";
            default           -> estado;
        };
    }
}
