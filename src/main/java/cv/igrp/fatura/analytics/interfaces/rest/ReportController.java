package cv.igrp.fatura.analytics.interfaces.rest;

import cv.igrp.fatura.analytics.application.dto.TopClienteDTO;
import cv.igrp.fatura.analytics.application.dto.TopProdutoDTO;
import cv.igrp.fatura.analytics.application.dto.VendasMensaisDTO;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Relatórios e análises estatísticas")
public class ReportController {

    private static final String[] MONTH_NAMES =
            {"Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"};

    private final FaturaVendaRepository faturaVendaRepo;
    private final FaturaCompraRepository faturaCompraRepo;
    private final FaturaVendaItemRepository faturaVendaItemRepo;

    @GetMapping("/vendas/mensais")
    @Operation(summary = "Totais mensais de vendas e compras para um ano")
    public ResponseEntity<List<VendasMensaisDTO>> vendasMensais(
            @RequestParam(defaultValue = "0") int ano) {

        int targetYear = ano > 0 ? ano : LocalDate.now().getYear();

        Map<Integer, BigDecimal> vendasByMonth  = toMonthMap(faturaVendaRepo.findMensaisConfirmadas(targetYear));
        Map<Integer, BigDecimal> comprasByMonth = toMonthMap(faturaCompraRepo.findMensaisConfirmadas(targetYear));

        List<VendasMensaisDTO> result = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            result.add(new VendasMensaisDTO(
                    MONTH_NAMES[m - 1],
                    vendasByMonth.getOrDefault(m, BigDecimal.ZERO),
                    comprasByMonth.getOrDefault(m, BigDecimal.ZERO)
            ));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/vendas/top-produtos")
    @Operation(summary = "Top N produtos mais vendidos por valor total")
    public ResponseEntity<List<TopProdutoDTO>> topProdutos(
            @RequestParam(defaultValue = "5") int limit) {

        List<TopProdutoDTO> result = new ArrayList<>();
        for (Object[] row : faturaVendaItemRepo.findTopProdutos(PageRequest.of(0, Math.min(limit, 20)))) {
            result.add(new TopProdutoDTO(
                    (String) row[0],
                    orZero((BigDecimal) row[1]),
                    orZero((BigDecimal) row[2])
            ));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/vendas/top-clientes")
    @Operation(summary = "Top N clientes por volume de faturação")
    public ResponseEntity<List<TopClienteDTO>> topClientes(
            @RequestParam(defaultValue = "5") int limit) {

        List<TopClienteDTO> result = new ArrayList<>();
        for (Object[] row : faturaVendaRepo.findTopClientes(PageRequest.of(0, Math.min(limit, 20)))) {
            result.add(new TopClienteDTO(
                    (String) row[0],
                    (String) row[1],
                    orZero((BigDecimal) row[2])
            ));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/vendas/por-estado")
    @Operation(summary = "Distribuição de faturas de venda por estado")
    public ResponseEntity<List<Map<String, Object>>> porEstado() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : faturaVendaRepo.countByEstado()) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("estado", row[0]);
            entry.put("count", ((Number) row[1]).longValue());
            result.add(entry);
        }
        return ResponseEntity.ok(result);
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
}
