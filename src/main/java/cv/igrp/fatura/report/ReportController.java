package cv.igrp.fatura.report;

import cv.igrp.fatura.compra.infrastructure.persistence.repository.FaturaCompraRepository;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaItemRepository;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaRepository;
import cv.igrp.framework.stereotype.IgrpController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@IgrpController
@RestController
@RequestMapping(value = "api/v1/reports", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Analytics e relatórios de faturação")
public class ReportController {

    private static final String[] MONTH_LABELS = {
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    };

    private final FaturaVendaRepository faturaVendaRepo;
    private final FaturaCompraRepository faturaCompraRepo;
    private final FaturaVendaItemRepository faturaVendaItemRepo;

    @GetMapping("/monthly-totals")
    @Operation(summary = "Totais mensais de vendas e compras confirmadas para o ano indicado")
    public ResponseEntity<List<MonthlyTotalDTO>> getMonthlyTotals(
            @RequestParam(required = false) Integer year) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();

        Map<Integer, BigDecimal> vendasByMonth = new HashMap<>();
        for (Object[] row : faturaVendaRepo.sumValorFaturaByMonth(targetYear)) {
            vendasByMonth.put(((Number) row[0]).intValue(), (BigDecimal) row[1]);
        }
        Map<Integer, BigDecimal> comprasByMonth = new HashMap<>();
        for (Object[] row : faturaCompraRepo.sumValorFaturaByMonth(targetYear)) {
            comprasByMonth.put(((Number) row[0]).intValue(), (BigDecimal) row[1]);
        }

        List<MonthlyTotalDTO> result = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            result.add(new MonthlyTotalDTO(
                    m,
                    MONTH_LABELS[m - 1],
                    vendasByMonth.getOrDefault(m, BigDecimal.ZERO),
                    comprasByMonth.getOrDefault(m, BigDecimal.ZERO)));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/top-produtos")
    @Operation(summary = "Top 5 produtos mais vendidos por valor total faturado")
    public ResponseEntity<List<TopProdutoDTO>> getTopProdutos() {
        List<Object[]> rows = faturaVendaItemRepo.top5ProdutosVendidos(PageRequest.of(0, 5));
        List<TopProdutoDTO> result = rows.stream()
                .map(r -> new TopProdutoDTO(
                        (String) r[0],
                        r[1] != null ? (String) r[1] : "",
                        ((BigDecimal) r[2]).setScale(2, RoundingMode.HALF_UP),
                        ((BigDecimal) r[3]).setScale(2, RoundingMode.HALF_UP)))
                .toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/estado-distribuicao")
    @Operation(summary = "Distribuição das faturas de venda por estado (count + valor total)")
    public ResponseEntity<List<EstadoDistribuicaoDTO>> getEstadoDistribuicao() {
        List<Object[]> rows = faturaVendaRepo.countAndSumByEstado();
        List<EstadoDistribuicaoDTO> result = rows.stream()
                .map(r -> new EstadoDistribuicaoDTO(
                        (String) r[0],
                        (Long) r[1],
                        (BigDecimal) r[2]))
                .toList();
        return ResponseEntity.ok(result);
    }
}
